-- Session 11: Roadmap system — Level 1 onboarding flow
-- Creates roadmap_modules, user_roadmap_progress tables
-- Adds roadmap_module_id to questions, updates question_type constraint
-- Seeds 9 modules and 76 Level 1 practice questions

-- =============================================================================
-- 1. SCHEMA CHANGES ON questions TABLE
-- =============================================================================

-- Add roadmap_module_id column
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS roadmap_module_id uuid;

-- Update question_type CHECK constraint to include 'roadmap'
ALTER TABLE public.questions DROP CONSTRAINT IF EXISTS questions_question_type_check;
ALTER TABLE public.questions
  ADD CONSTRAINT questions_question_type_check
  CHECK (question_type IN ('exam_simulation', 'practice', 'roadmap'));

CREATE INDEX IF NOT EXISTS idx_questions_roadmap_module
  ON public.questions (roadmap_module_id)
  WHERE roadmap_module_id IS NOT NULL;

-- =============================================================================
-- 2. NEW TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.roadmap_modules (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phase            int  NOT NULL,
  order_in_phase   int  NOT NULL,
  title            text NOT NULL,
  description      text,
  estimated_minutes int,
  content_source   text,
  total_questions  int,
  unlocks_after    uuid REFERENCES public.roadmap_modules(id),
  created_at       timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roadmap_progress (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id           uuid NOT NULL REFERENCES public.roadmap_modules(id) ON DELETE CASCADE,
  status              text NOT NULL DEFAULT 'not_started'
                        CHECK (status IN ('not_started', 'in_progress', 'completed')),
  questions_completed int  NOT NULL DEFAULT 0,
  questions_correct   int  NOT NULL DEFAULT 0,
  score_percentage    decimal,
  started_at          timestamptz,
  completed_at        timestamptz,
  UNIQUE (user_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_urp_user_id ON public.user_roadmap_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_urp_module_id ON public.user_roadmap_progress (module_id);

-- =============================================================================
-- 3. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.roadmap_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read roadmap modules"
  ON public.roadmap_modules FOR SELECT USING (true);

ALTER TABLE public.user_roadmap_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own roadmap progress"
  ON public.user_roadmap_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- 4. SEED: 9 MODULES WITH FIXED UUIDs
-- =============================================================================

INSERT INTO public.roadmap_modules
  (id, phase, order_in_phase, title, description, estimated_minutes, content_source, total_questions, unlocks_after)
VALUES
  (
    'a0000000-0000-4000-a000-000000000001', 1, 1,
    'Three-Phase Systems & Power',
    'Foundation: AC generation, three-phase systems, phasors, Wye/Delta connections, power calculations',
    60, 'Module_01_Three_Phase_Systems_and_Power.pdf', 10, NULL
  ),
  (
    'a0000000-0000-4000-a000-000000000002', 1, 2,
    'Transformers: Theory & Connections',
    'Power transformer operation, voltage/current ratios, Wye-Delta connections, nameplate data',
    45, 'Module_02_Transformers.pdf', 7,
    'a0000000-0000-4000-a000-000000000001'
  ),
  (
    'a0000000-0000-4000-a000-000000000003', 1, 3,
    'Instrument Transformers: CTs & PTs',
    'Current and potential transformers, ratios, polarity, accuracy, safety',
    45, 'Module_03_Instrument_Transformers_CTs_PTs.pdf', 9,
    'a0000000-0000-4000-a000-000000000002'
  ),
  (
    'a0000000-0000-4000-a000-000000000004', 1, 4,
    'Fault Types on Power Systems',
    'Three-phase, phase-to-phase, phase-to-ground fault types and fault current behavior',
    30, 'Module_04_Fault_Types.pdf', 7,
    'a0000000-0000-4000-a000-000000000003'
  ),
  (
    'a0000000-0000-4000-a000-000000000005', 1, 5,
    'Grounding Methods & Sequence Components',
    'System grounding, positive/negative/zero sequence components, fault type analysis',
    45, 'Module_05_Grounding_and_Sequence_Components.pdf', 9,
    'a0000000-0000-4000-a000-000000000004'
  ),
  (
    'a0000000-0000-4000-a000-000000000006', 2, 1,
    'Introduction to Protective Relays',
    'What relays are, zones of protection, primary/backup protection, time coordination curves',
    60, 'Module_06_Introduction_to_Protective_Relays.pdf', 9,
    'a0000000-0000-4000-a000-000000000005'
  ),
  (
    'a0000000-0000-4000-a000-000000000007', 2, 2,
    'History of Protective Relays',
    'Electromechanical, solid-state, and microprocessor relay generations and their trade-offs',
    30, 'Module_07_History_of_Protective_Relays.pdf', 7,
    'a0000000-0000-4000-a000-000000000006'
  ),
  (
    'a0000000-0000-4000-a000-000000000008', 3, 1,
    'Relay Testing Fundamentals',
    'Why we test, test equipment, testing methods, pickup and timing procedures',
    90, 'Module_08_Relay_Testing_Fundamentals.pdf', 10,
    'a0000000-0000-4000-a000-000000000007'
  ),
  (
    'a0000000-0000-4000-a000-000000000009', 3, 2,
    'Test Sheets & Documentation',
    'Professional documentation standards, as-found/as-left records, NETA test sheet requirements',
    45, 'Module_09_Test_Sheets_and_Documentation.pdf', 8,
    'a0000000-0000-4000-a000-000000000008'
  );

-- =============================================================================
-- 5. SEED: MODULE 1 — THREE-PHASE SYSTEMS & POWER (10 questions)
-- =============================================================================

INSERT INTO public.questions
  (domain, subdomain, level, concept_type, difficulty, frequency_tier,
   question, options, correct_answer, explanation, source, question_type, roadmap_module_id)
VALUES
(
  'fundamentals-theory', 'three-phase-power', 2, 'conceptual', 1, 2,
  'What is the phase angle between any two phases in a balanced three-phase system?',
  '{"a": "90°", "b": "120°", "c": "180°", "d": "60°"}'::jsonb,
  'b',
  'In a balanced three-phase system, each phase is displaced 120° from the others. This creates three equal voltages that always sum to zero at any instant.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000001'
),
(
  'fundamentals-theory', 'three-phase-power', 2, 'conceptual', 2, 2,
  'In a balanced three-phase Wye (Y) connection, what is the relationship between line voltage (VL) and phase voltage (Vφ)?',
  '{"a": "VL = Vφ", "b": "VL = √2 × Vφ", "c": "VL = √3 × Vφ", "d": "VL = 3 × Vφ"}'::jsonb,
  'c',
  'In a Wye connection, line voltage equals √3 times phase voltage (VL = √3 × Vφ). A 480V three-phase system has phase voltages of 480/√3 ≈ 277V.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000001'
),
(
  'fundamentals-theory', 'three-phase-power', 2, 'conceptual', 2, 2,
  'In a balanced three-phase Delta (Δ) connection, what is the relationship between line current (IL) and phase current (Iφ)?',
  '{"a": "IL = Iφ", "b": "IL = √2 × Iφ", "c": "IL = √3 × Iφ", "d": "IL = 3 × Iφ"}'::jsonb,
  'c',
  'In a Delta connection, line current equals √3 times phase current (IL = √3 × Iφ), because two phase currents combine at each node of the delta.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000001'
),
(
  'fundamentals-theory', 'three-phase-power', 2, 'conceptual', 2, 2,
  'What is the correct formula for three-phase apparent power (S)?',
  '{"a": "S = V × I", "b": "S = 3 × V × I", "c": "S = √3 × VL × IL", "d": "S = VL × IL ÷ √3"}'::jsonb,
  'c',
  'Three-phase apparent power S = √3 × VL × IL, where VL is line voltage and IL is line current. This formula applies to both Wye and Delta connections.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000001'
),
(
  'fundamentals-theory', 'three-phase-power', 2, 'calculation', 3, 2,
  'A three-phase load draws 100A at 480V with a power factor of 0.85. What is the real power (P)?',
  '{"a": "48.0 kW", "b": "70.7 kW", "c": "83.1 kW", "d": "40.8 kW"}'::jsonb,
  'b',
  'S = √3 × 480 × 100 = 83,138 VA. P = S × PF = 83,138 × 0.85 ≈ 70.7 kW. The reactive power is Q = √(S² − P²) ≈ 43.8 kVAR.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000001'
),
(
  'fundamentals-theory', 'three-phase-power', 2, 'conceptual', 1, 2,
  'What does a phasor represent in AC circuit analysis?',
  '{"a": "The instantaneous value of an AC quantity at a specific moment", "b": "The magnitude (RMS) and phase angle of a sinusoidal quantity", "c": "The average value of an AC waveform over one cycle", "d": "The peak value of an AC quantity"}'::jsonb,
  'b',
  'A phasor represents a sinusoidal quantity by its RMS magnitude and phase angle, allowing AC circuit analysis using vector arithmetic instead of differential equations.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000001'
),
(
  'fundamentals-theory', 'three-phase-power', 2, 'calculation', 3, 2,
  'A load has real power P = 75 kW and reactive power Q = 100 kVAR. What is the apparent power (S)?',
  '{"a": "125 kVA", "b": "175 kVA", "c": "100 kVA", "d": "25 kVA"}'::jsonb,
  'a',
  'S = √(P² + Q²) = √(75² + 100²) = √(5625 + 10000) = √15625 = 125 kVA. P, Q, and S form a right triangle — the power triangle.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000001'
),
(
  'fundamentals-theory', 'three-phase-power', 2, 'conceptual', 1, 2,
  'Power factor is defined as the ratio of:',
  '{"a": "Reactive power to apparent power (Q/S)", "b": "Real power to apparent power (P/S)", "c": "Apparent power to real power (S/P)", "d": "Voltage magnitude to current magnitude"}'::jsonb,
  'b',
  'Power factor = P/S = cos(θ), where θ is the phase angle between voltage and current. PF = 1.0 means all power is real; lower PF indicates reactive power consumption.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000001'
),
(
  'fundamentals-theory', 'three-phase-power', 2, 'conceptual', 2, 2,
  'What is the instantaneous sum of the three phase voltages in a balanced three-phase system?',
  '{"a": "3 × Vφ (three times phase voltage)", "b": "√3 × Vφ (line voltage)", "c": "Zero at all times", "d": "Vφ (one phase voltage)"}'::jsonb,
  'c',
  'In a balanced system, Va + Vb + Vc = 0 at every instant. The three voltages are equal in magnitude and 120° apart, so they always cancel exactly.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000001'
),
(
  'fundamentals-theory', 'three-phase-power', 2, 'conceptual', 1, 2,
  'Which three-phase connection provides a neutral conductor, enabling both single-phase and three-phase loads to be served?',
  '{"a": "Delta-Delta (Δ-Δ)", "b": "Wye (Star, Y)", "c": "Open-Delta", "d": "Delta (Δ)"}'::jsonb,
  'b',
  'A Wye connection creates a center neutral point that connects to the neutral conductor. This allows 277V single-phase loads (phase-to-neutral) alongside 480V three-phase loads (phase-to-phase).',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000001'
);

-- =============================================================================
-- 6. MODULE 2 — TRANSFORMERS: THEORY & CONNECTIONS (7 questions)
-- =============================================================================

INSERT INTO public.questions
  (domain, subdomain, level, concept_type, difficulty, frequency_tier,
   question, options, correct_answer, explanation, source, question_type, roadmap_module_id)
VALUES
(
  'component-testing', 'transformers', 2, 'conceptual', 1, 2,
  'What is the operating principle of a transformer?',
  '{"a": "Electromagnetic induction between two windings sharing a magnetic core", "b": "Direct electrical conduction through a shared conductor", "c": "Conversion of DC to AC voltage using switching transistors", "d": "Voltage amplification through transistor gain"}'::jsonb,
  'a',
  'A transformer uses electromagnetic induction — AC in the primary creates changing flux in the core, inducing voltage in the secondary. No electrical connection between windings is needed.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000002'
),
(
  'component-testing', 'transformers', 2, 'calculation', 2, 2,
  'A transformer has 200 primary turns and 50 secondary turns with a primary voltage of 480V. What is the secondary voltage?',
  '{"a": "1,920V", "b": "120V", "c": "240V", "d": "96V"}'::jsonb,
  'b',
  'Turns ratio = N1/N2 = 200/50 = 4:1. Secondary voltage = 480 ÷ 4 = 120V. Voltage ratio equals turns ratio: V1/V2 = N1/N2.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000002'
),
(
  'component-testing', 'transformers', 2, 'calculation', 2, 2,
  'A single-phase 100 kVA transformer has a primary voltage of 12,470V. What is the primary full-load current (FLA)?',
  '{"a": "8.02A", "b": "80.2A", "c": "0.802A", "d": "802A"}'::jsonb,
  'a',
  'I_FLA = kVA × 1000 / V = 100,000 / 12,470 ≈ 8.02A. For three-phase: I = kVA × 1000 / (√3 × VL).',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000002'
),
(
  'component-testing', 'transformers', 2, 'calculation', 3, 2,
  'A Wye-connected transformer primary is connected to a 480V three-phase system. What is the voltage across each primary winding?',
  '{"a": "480V (full line voltage)", "b": "277V (phase voltage = VL / √3)", "c": "831V (VL × √3)", "d": "240V (VL / 2)"}'::jsonb,
  'b',
  'In a Wye connection, each winding sees phase voltage = VL / √3 = 480 / √3 ≈ 277V — not the full line-to-line voltage.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000002'
),
(
  'component-testing', 'transformers', 2, 'conceptual', 3, 2,
  'What does the percent impedance (%Z) on a transformer nameplate indicate?',
  '{"a": "The percentage of primary voltage lost in winding resistance at full load", "b": "The percentage of rated voltage needed to circulate rated current with the secondary short-circuited", "c": "The transformer efficiency at full load as a percentage", "d": "The ratio of leakage flux to total core flux"}'::jsonb,
  'b',
  '%Z is the percentage of rated primary voltage required to push rated current through a short-circuited secondary. Lower %Z allows higher fault current; higher %Z limits fault current but causes more voltage drop under load.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000002'
),
(
  'component-testing', 'transformers', 2, 'conceptual', 2, 2,
  'Why are transformers rated in kVA rather than kW?',
  '{"a": "Because transformers only handle reactive power, not real power", "b": "Because transformer heating depends on current (I²R), not power factor — kVA represents the full current-carrying requirement", "c": "Because kW ratings are reserved for generators and motors only", "d": "Because transformers are assumed to be 100% efficient"}'::jsonb,
  'b',
  'Transformer winding losses (I²R) depend on current magnitude, regardless of power factor. A transformer must handle the full apparent power (kVA) regardless of load PF.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000002'
),
(
  'component-testing', 'transformers', 2, 'conceptual', 3, 2,
  'What is the purpose of a delta-connected tertiary winding on a three-winding transformer?',
  '{"a": "To increase the transformer kVA rating without changing the core size", "b": "To provide a circulating path for zero-sequence currents and suppress third-harmonic voltages", "c": "To reduce core losses by providing an alternate flux path", "d": "To provide automatic voltage regulation under varying load"}'::jsonb,
  'b',
  'A delta tertiary winding provides a path for zero-sequence (ground fault) currents in grounded-wye systems and suppresses third-harmonic voltages by allowing them to circulate within the delta.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000002'
);

-- =============================================================================
-- 7. MODULE 3 — INSTRUMENT TRANSFORMERS: CTs & PTs (9 questions)
-- =============================================================================

INSERT INTO public.questions
  (domain, subdomain, level, concept_type, difficulty, frequency_tier,
   question, options, correct_answer, explanation, source, question_type, roadmap_module_id)
VALUES
(
  'component-testing', 'instrument-transformers', 2, 'conceptual', 1, 1,
  'What is the purpose of a current transformer (CT) in a power system?',
  '{"a": "To step up line current for testing high-resistance circuits", "b": "To provide a reduced, proportional secondary current for metering and protective relays", "c": "To isolate the AC power supply from DC control circuits", "d": "To measure voltage across a high-impedance protection relay"}'::jsonb,
  'b',
  'A CT steps down line current to a standard secondary value (usually 5A or 1A) for safe connection to meters and protective relays, while providing electrical isolation from the high-voltage primary.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000003'
),
(
  'component-testing', 'instrument-transformers', 2, 'calculation', 2, 1,
  'A CT is rated 600:5. When primary current is 300A, what is the secondary current?',
  '{"a": "2.5A (ratio = 120:1, so 300/120 = 2.5A)", "b": "5.0A (rated secondary current)", "c": "1.25A (half of rated secondary)", "d": "0.25A (secondary ÷ primary ratio)"}'::jsonb,
  'a',
  'Turns ratio = 600/5 = 120:1. Secondary current = 300 / 120 = 2.5A. The CT accurately produces the primary current divided by the turns ratio.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000003'
),
(
  'component-testing', 'instrument-transformers', 2, 'safety-standards', 1, 1,
  'What is the critical safety rule when working on a CT secondary circuit while the primary is energized?',
  '{"a": "Always short-circuit the CT secondary before opening the burden circuit", "b": "Never connect more than one relay to a single CT secondary", "c": "Always open the secondary circuit before removing the primary conductor", "d": "Keep CT secondary impedance as high as possible while energized"}'::jsonb,
  'a',
  'NEVER open-circuit an energized CT secondary. Without a burden, the CT tries to maintain rated current through infinite impedance, generating dangerously high voltage — potentially thousands of volts. Always short the secondary first.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000003'
),
(
  'component-testing', 'instrument-transformers', 2, 'conceptual', 3, 1,
  'A CT secondary is grounded on the wrong side of the relay. What is the consequence?',
  '{"a": "The CT ratio changes proportionally to the ground location", "b": "Ground fault current is diverted around the relay — the relay will not operate during a ground fault", "c": "The CT overheats due to increased secondary burden", "d": "The CT accuracy class degrades from C to T class"}'::jsonb,
  'b',
  'CT secondaries must be grounded at one point only. Grounding on the wrong side of the relay creates a path for ground fault current to bypass the relay completely — causing a failure to trip when needed.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000003'
),
(
  'component-testing', 'instrument-transformers', 2, 'conceptual', 2, 1,
  'What is CT "burden" and why does it matter for protection accuracy?',
  '{"a": "The CT physical weight — heavier cores maintain accuracy under high current", "b": "The total impedance on the CT secondary (wire + relay) — excessive burden causes core saturation and ratio errors", "c": "The CT primary current rating in amperes", "d": "The number of protective relays connected to one CT secondary"}'::jsonb,
  'b',
  'CT burden is the total secondary impedance (lead resistance + relay impedance). Excessive burden causes the CT core to saturate, producing a distorted secondary current that no longer accurately represents the primary — leading to relay misoperation.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000003'
),
(
  'component-testing', 'instrument-transformers', 2, 'conceptual', 1, 2,
  'What is the purpose of a potential transformer (PT or VT)?',
  '{"a": "To measure high-frequency transient signals in power systems", "b": "To step down high system voltage to a safe, proportional secondary voltage for metering and relays", "c": "To provide variable voltage control for motor starters", "d": "To measure fault current magnitude during ground faults"}'::jsonb,
  'b',
  'A PT steps down high system voltages (e.g., 12,470V) to standardized secondary voltages (typically 120V) for safe connection to voltmeters, wattmeters, and protective relays.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000003'
),
(
  'component-testing', 'instrument-transformers', 2, 'conceptual', 3, 1,
  'What does the CT accuracy class designation "C200" mean?',
  '{"a": "The CT is rated for 200A primary current maximum", "b": "The CT can develop up to 200V at the secondary terminals while maintaining ≤10% ratio error at 20× rated secondary current", "c": "The CT has a standard 200:5 ratio", "d": "The CT is rated for 200°C maximum operating temperature"}'::jsonb,
  'b',
  '"C" means the ratio error is calculable (relay-class CT). "200" means up to 200V can appear across the secondary (burden × 100A) before accuracy degrades beyond 10% error.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000003'
),
(
  'component-testing', 'current-transformers', 2, 'calculation', 2, 1,
  'A technician wraps a conductor through a 2000:5 CT window 4 times. What effective ratio does the relay see?',
  '{"a": "2000:5 (ratio unchanged by conductor routing)", "b": "500:5 (each pass multiplies apparent primary turns)", "c": "8000:5 (passes multiply the secondary turns)", "d": "2000:20 (passes multiply secondary current)"}'::jsonb,
  'b',
  'Each conductor pass through the CT window = one additional primary turn. With 4 passes: effective primary turns = 4, so apparent ratio = 2000 / 4 = 500:5. This allows using a high-ratio CT with limited-range test equipment.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000003'
),
(
  'component-testing', 'instrument-transformers', 2, 'conceptual', 3, 1,
  'What is the difference between CT accuracy class and CT polarity markings?',
  '{"a": "Accuracy class determines the ratio; polarity marks determine current direction", "b": "Accuracy class defines acceptable ratio error; polarity marks (H1/X1) define current direction for correct differential relay operation", "c": "They are the same specification expressed in different notation", "d": "Accuracy class applies to metering CTs only; polarity marks apply to protection CTs only"}'::jsonb,
  'b',
  'Accuracy class (C, T, K) defines ratio error tolerance. Polarity marks (H1 primary, X1 secondary) define current direction — current into H1 exits X1. Correct polarity is critical for differential relays that compare current directions.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000003'
);

-- =============================================================================
-- 8. MODULE 4 — FAULT TYPES ON POWER SYSTEMS (7 questions)
-- =============================================================================

INSERT INTO public.questions
  (domain, subdomain, level, concept_type, difficulty, frequency_tier,
   question, options, correct_answer, explanation, source, question_type, roadmap_module_id)
VALUES
(
  'fundamentals-theory', 'fault-current', 2, 'conceptual', 1, 2,
  'What are the four main types of faults on a three-phase power system?',
  '{"a": "Open-circuit, short-circuit, ground fault, and overload", "b": "Three-phase (3LG), phase-to-phase (LL), double-phase-to-ground (LLG), and single-phase-to-ground (LG)", "c": "Symmetrical, asymmetrical, transient, and permanent", "d": "Series, shunt, parallel, and cascading"}'::jsonb,
  'b',
  'The four fault types are: three-phase (3LG — symmetrical, most severe), phase-to-phase (LL), double-line-to-ground (LLG), and single-line-to-ground (LG — most common at ~70–80% of all faults).',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000004'
),
(
  'fundamentals-theory', 'fault-current', 2, 'conceptual', 2, 2,
  'Which fault type typically produces the highest fault current magnitude?',
  '{"a": "Single-line-to-ground (LG)", "b": "Phase-to-phase (LL)", "c": "Three-phase (3LG)", "d": "Double-line-to-ground (LLG)"}'::jsonb,
  'c',
  'A three-phase (3LG) bolted fault typically produces the highest current because all three phases are shorted with minimum impedance. Equipment interrupting ratings are based on this worst-case symmetrical fault current.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000004'
),
(
  'fundamentals-theory', 'fault-current', 2, 'conceptual', 1, 2,
  'What percentage of power system faults are single-line-to-ground (LG) faults?',
  '{"a": "5–10%", "b": "20–30%", "c": "50–60%", "d": "70–80%"}'::jsonb,
  'd',
  'Single-line-to-ground faults account for approximately 70–80% of all power system faults, caused by lightning strikes, insulator failure, conductor contact with a grounded structure, or tree contact.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000004'
),
(
  'fundamentals-theory', 'fault-current', 2, 'conceptual', 2, 2,
  'What is the simplified per-unit formula for calculating fault current from full-load current?',
  '{"a": "I_fault = V_rated × %Z", "b": "I_fault = I_FLA ÷ %Z (expressed as decimal)", "c": "I_fault = I_FLA × %Z", "d": "I_fault = V_rated ÷ (Z_source × %Z)"}'::jsonb,
  'b',
  'I_fault = I_FLA / %Z_pu. For example, a transformer with I_FLA = 1000A and %Z = 5% (0.05): I_fault = 1000 / 0.05 = 20,000A.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000004'
),
(
  'fundamentals-theory', 'fault-current', 2, 'calculation', 3, 2,
  'A transformer is rated 1000 kVA, 480V secondary, with 5% impedance. What is the bolted three-phase fault current at the secondary terminals?',
  '{"a": "24,056A", "b": "1,203A", "c": "2,406A", "d": "12,028A"}'::jsonb,
  'a',
  'I_FLA = 1,000,000 / (√3 × 480) = 1,202.8A. I_fault = 1,202.8 / 0.05 = 24,056A. This is the maximum available fault current directly at the transformer secondary.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000004'
),
(
  'fundamentals-theory', 'fault-current', 2, 'conceptual', 2, 2,
  'Why is a three-phase (3LG) fault called a "symmetrical" fault?',
  '{"a": "Because it occurs symmetrically at the center of the power system", "b": "Because all three phases are affected equally — fault currents are balanced and 120° apart", "c": "Because it produces equal voltage and current magnitudes on all phases", "d": "Both b and c"}'::jsonb,
  'd',
  'A three-phase fault is symmetrical because all phases are equally affected. The fault currents remain balanced (equal magnitude, 120° apart) and only positive-sequence analysis is needed — negative and zero sequence components are zero.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000004'
),
(
  'fundamentals-theory', 'fault-current', 2, 'conceptual', 3, 2,
  'What is the "asymmetrical" fault current, and why does it matter for equipment ratings?',
  '{"a": "The RMS value of fault current used for thermal damage calculations", "b": "The peak first-cycle fault current including DC offset — determines equipment momentary current ratings", "c": "The fault current after DC offset has decayed (steady-state)", "d": "The fault current seen on only one phase during an unbalanced fault"}'::jsonb,
  'b',
  'Asymmetrical fault current includes the DC offset transient in the first cycles after fault inception. The peak can reach 1.6–2.6× the symmetrical RMS value — this peak determines the momentary current (closing/latching) rating of breakers and switchgear.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000004'
);

-- =============================================================================
-- 9. MODULE 5 — GROUNDING METHODS & SEQUENCE COMPONENTS (9 questions)
-- =============================================================================

INSERT INTO public.questions
  (domain, subdomain, level, concept_type, difficulty, frequency_tier,
   question, options, correct_answer, explanation, source, question_type, roadmap_module_id)
VALUES
(
  'component-testing', 'grounding-systems', 2, 'conceptual', 1, 2,
  'What are the three main system neutral grounding methods?',
  '{"a": "Series, parallel, and delta grounding", "b": "Solidly grounded, impedance grounded (resistance or reactance), and ungrounded (isolated)", "c": "Direct, indirect, and floating ground", "d": "Ground fault, static ground, and safety ground"}'::jsonb,
  'b',
  'Three-phase systems are grounded via: solidly grounded (neutral tied directly to ground), impedance grounded (through resistor/reactor to limit fault current), or ungrounded/isolated (no intentional neutral-to-ground connection).',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000005'
),
(
  'component-testing', 'grounding-systems', 2, 'conceptual', 2, 2,
  'What is the primary operational advantage of a solidly grounded system?',
  '{"a": "Fault current is limited to protect sensitive equipment from damage", "b": "Ground fault current is large enough to be detected and cleared quickly by overcurrent relays", "c": "The system can continue operating with one phase faulted to ground", "d": "Overvoltages on unfaulted phases are suppressed without relay action"}'::jsonb,
  'b',
  'In a solidly grounded system, ground faults produce large fault currents (limited only by system impedance), which are easily detected by overcurrent relays and automatically cleared. This is the standard for 480V and below.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000005'
),
(
  'component-testing', 'grounding-systems', 2, 'conceptual', 2, 2,
  'How does a high-resistance grounded (HRG) system allow continued operation after a single-phase ground fault?',
  '{"a": "The large fault current clears the fault automatically within milliseconds", "b": "The resistance limits fault current to a very small value (1–5A), preventing equipment damage while allowing time to locate the fault", "c": "Capacitors absorb the fault current harmlessly", "d": "The neutral reactor stores fault energy until the next maintenance cycle"}'::jsonb,
  'b',
  'An HRG system connects the neutral through a high resistance that limits ground fault current to match the system capacitive charging current (typically 1–5A). This prevents damage and allows continued operation while the fault is located.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000005'
),
(
  'component-testing', 'grounding-systems', 2, 'conceptual', 2, 2,
  'What are the three symmetrical components used in power system fault analysis (Fortescue theorem)?',
  '{"a": "Peak, RMS, and average components", "b": "Real, imaginary, and complex components", "c": "Positive sequence, negative sequence, and zero sequence", "d": "Fundamental, harmonic, and sub-harmonic components"}'::jsonb,
  'c',
  'By Fortescue theorem, any unbalanced three-phase system decomposes into: positive sequence (balanced, abc rotation — normal), negative sequence (balanced, acb rotation — reverse), and zero sequence (all three phases equal and in-phase).',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000005'
),
(
  'component-testing', 'grounding-systems', 2, 'conceptual', 2, 2,
  'What does zero-sequence current represent, and what path does it require to flow?',
  '{"a": "Normal balanced current that flows during steady-state operation", "b": "Equal magnitude, in-phase current in all three phases — can only flow through a grounded neutral or ground path", "c": "The fundamental frequency component of line current", "d": "Current that flows between neutral and ground during normal conditions only"}'::jsonb,
  'b',
  'Zero-sequence currents are equal in all three phases and in phase with each other. They can only flow if a return path exists (grounded neutral or ground). Neutral current IN = 3 × I0.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000005'
),
(
  'component-testing', 'grounding-systems', 2, 'conceptual', 3, 2,
  'A single-line-to-ground (LG) fault produces which sequence current components?',
  '{"a": "Positive sequence only", "b": "Positive and negative sequence only", "c": "All three: positive, negative, and zero sequence (all equal)", "d": "Zero sequence only"}'::jsonb,
  'c',
  'An LG fault produces all three sequence components, and they are equal: I1 = I2 = I0. Ground fault current = 3 × I0. This is why ground fault protection requires zero-sequence sensing (residual current or a zero-sequence CT).',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000005'
),
(
  'component-testing', 'grounding-systems', 2, 'conceptual', 2, 2,
  'What is the purpose of a grounding transformer (zigzag or Wye-Delta configuration)?',
  '{"a": "To step up voltages for long-distance transmission efficiency", "b": "To create an artificial neutral grounding point for an ungrounded delta or isolated system", "c": "To reduce harmonic distortion generated by variable frequency drives", "d": "To provide galvanic isolation between two different voltage levels"}'::jsonb,
  'b',
  'A grounding transformer (zigzag or grounded-wye/delta) creates a neutral point that can be grounded, allowing ground fault protection to function on systems that would otherwise have no neutral — such as delta systems.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000005'
),
(
  'component-testing', 'grounding-systems', 2, 'conceptual', 2, 2,
  'In a 480V solidly grounded Wye system, what happens to the unfaulted phase-to-ground voltages during a solid single-phase-to-ground fault?',
  '{"a": "They rise to 480V (line-to-line voltage)", "b": "They remain at 277V (normal phase voltage — neutral is held at ground)", "c": "They rise to 831V (line voltage × √3)", "d": "They drop to zero along with the faulted phase"}'::jsonb,
  'b',
  'In a solidly grounded system, the neutral is held near ground potential even during a fault. The faulted phase drops to near zero, but unfaulted phase-to-ground voltages remain at normal phase voltage (277V). This is a key advantage over ungrounded systems.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000005'
),
(
  'component-testing', 'grounding-systems', 2, 'conceptual', 2, 2,
  'What does negative-sequence current in a three-phase system indicate?',
  '{"a": "Normal balanced three-phase operation at rated frequency", "b": "An unbalanced condition such as a phase-to-phase fault, open phase, or unbalanced load", "c": "Ground fault current returning through the neutral conductor", "d": "Harmonic currents generated by nonlinear loads such as VFDs"}'::jsonb,
  'b',
  'Negative-sequence currents (reverse-rotation sequence acb) are produced by unbalanced conditions — phase-to-phase faults, open-phase conditions, unbalanced loads. In motors, negative-sequence creates reverse torque and heat. ANSI device 47 detects this.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000005'
);

-- =============================================================================
-- 10. MODULE 6 — INTRODUCTION TO PROTECTIVE RELAYS (9 questions)
-- =============================================================================

INSERT INTO public.questions
  (domain, subdomain, level, concept_type, difficulty, frequency_tier,
   question, options, correct_answer, explanation, source, question_type, roadmap_module_id)
VALUES
(
  'component-testing', 'protective-relays', 2, 'conceptual', 1, 1,
  'What is the primary purpose of protective relaying in a power system?',
  '{"a": "To prevent all electrical faults from occurring", "b": "To detect abnormal conditions and automatically isolate the faulted section with minimum disruption to the rest of the system", "c": "To continuously monitor power quality and voltage levels", "d": "To control voltage and reactive power throughout the transmission system"}'::jsonb,
  'b',
  'Protective relays detect fault conditions, then send trip signals to circuit breakers to isolate the faulted section — limiting damage and restoring power to unaffected portions as quickly as possible.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000006'
),
(
  'component-testing', 'protective-relays', 2, 'conceptual', 2, 1,
  'What is a "zone of protection"?',
  '{"a": "A physical safety exclusion area around high-voltage equipment", "b": "The portion of the power system that a specific relay is designed to protect, defined by its CT locations", "c": "The distance from a relay to the fault location on a transmission line", "d": "The coverage area of a relay''s current transformer window"}'::jsonb,
  'b',
  'A zone of protection is the specific electrical area (transformer, bus, cable, motor) monitored by a particular relay. Zones are defined by CT locations. Overlapping zones between adjacent relays ensure no unprotected gaps.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000006'
),
(
  'component-testing', 'protective-relays', 2, 'conceptual', 1, 1,
  'What is the difference between primary protection and backup protection?',
  '{"a": "Primary protection uses modern digital relays; backup uses older electromechanical relays", "b": "Primary protection operates first to clear the fault; backup operates with a time delay if primary fails or is too slow", "c": "Primary trips the main breaker; backup trips all feeder breakers simultaneously", "d": "Primary protection measures current; backup protection measures voltage"}'::jsonb,
  'b',
  'Primary protection is the first, fastest relay intended to clear the fault. Backup protection operates with a time delay if primary fails — due to relay failure, breaker failure, or communication loss — providing a second line of defense.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000006'
),
(
  'component-testing', 'protective-relays', 2, 'conceptual', 2, 1,
  'What does "selectivity" (or "coordination") mean in a protective relay system?',
  '{"a": "The ability to select which fault type the relay responds to", "b": "The relay''s ability to distinguish between fault current and normal load current", "c": "Only the relay closest to the fault operates, leaving the rest of the system energized", "d": "The sensitivity of a relay to detecting small fault currents"}'::jsonb,
  'c',
  'Selectivity means only the faulted section is isolated. Through time-current coordination, the relay closest to the fault trips first. Upstream relays only operate if the downstream relay fails — minimizing the outage extent.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000006'
),
(
  'component-testing', 'protective-relays', 2, 'conceptual', 1, 1,
  'What is the ANSI device number for a time-overcurrent relay?',
  '{"a": "27 (undervoltage relay)", "b": "50 (instantaneous overcurrent relay)", "c": "51 (time-overcurrent relay)", "d": "86 (lockout relay)"}'::jsonb,
  'c',
  'ANSI device 51 is the time-overcurrent relay. It has an inverse time-current characteristic — the greater the overcurrent, the faster it operates. Used for primary and backup protection of feeders and equipment.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000006'
),
(
  'component-testing', 'protective-relays', 2, 'conceptual', 2, 1,
  'What is the key difference between ANSI device 50 and device 51?',
  '{"a": "Device 50 responds to current; device 51 responds to voltage", "b": "Device 50 is instantaneous (no intentional time delay); device 51 operates with a time delay inversely proportional to current magnitude", "c": "Device 50 is for three-phase faults only; device 51 is for single-phase faults only", "d": "Device 50 is a protection relay; device 51 is a monitoring relay only"}'::jsonb,
  'b',
  'Device 50 (instantaneous OC) operates immediately when current exceeds its pickup, with no intentional delay. Device 51 (time OC) operates with a delay that decreases as current increases (inverse characteristic). They are often combined as a 50/51 element.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000006'
),
(
  'component-testing', 'protective-relays', 2, 'conceptual', 2, 1,
  'What is the purpose of a time-current coordination curve (TCC)?',
  '{"a": "To plot the time response of protective devices versus fault current — ensuring selective operation between upstream and downstream devices", "b": "To show the transformer thermal damage curve for cable sizing", "c": "To calculate maximum fault current available at each substation bus", "d": "To determine conductor ampacity derating under elevated ambient temperature"}'::jsonb,
  'a',
  'A TCC plots operate time vs. current on log-log paper for all protective devices. Proper coordination requires downstream devices to operate faster than upstream for any given fault current, creating a selective protection hierarchy.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000006'
),
(
  'component-testing', 'protective-relays', 2, 'conceptual', 2, 1,
  'What is the ANSI device 86 lockout relay, and what is its function?',
  '{"a": "Device 52 — directly controls the circuit breaker trip coil mechanism", "b": "Device 86 — latches in the operated state after a serious fault and must be manually reset before the breaker can be closed again", "c": "Device 51G — prevents automatic closing after any ground fault detection", "d": "Device 27 — prevents energizing equipment under low-voltage conditions"}'::jsonb,
  'b',
  'The ANSI 86 lockout relay is a hand-reset auxiliary relay that locks out after serious faults. It prevents automatic or accidental re-closing until the fault cause is investigated. Trip sequence: fault → 51 operates → 86 lockout trips → 52 breaker opens.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000006'
),
(
  'component-testing', 'protective-relays', 2, 'table-lookup', 2, 1,
  'What is the typical minimum coordination time interval (CTI) required between two series overcurrent relays?',
  '{"a": "0.05 seconds (50ms)", "b": "0.10 seconds (100ms)", "c": "0.25–0.30 seconds (250–300ms)", "d": "0.50 seconds (500ms)"}'::jsonb,
  'c',
  'A minimum CTI of 0.25–0.30 seconds is required, accounting for: circuit breaker clearing time (~0.08s for a 5-cycle breaker), CT error, relay overshoot time, and a safety margin to ensure the upstream relay does not operate before the downstream relay clears.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000006'
);

-- =============================================================================
-- 11. MODULE 7 — HISTORY OF PROTECTIVE RELAYS (7 questions)
-- =============================================================================

INSERT INTO public.questions
  (domain, subdomain, level, concept_type, difficulty, frequency_tier,
   question, options, correct_answer, explanation, source, question_type, roadmap_module_id)
VALUES
(
  'component-testing', 'protective-relays', 2, 'conceptual', 1, 3,
  'What was the primary limitation of early electromechanical protective relays?',
  '{"a": "They could not detect overcurrent conditions above a fixed threshold", "b": "They were slow (mechanical inertia), energy-intensive, wore out over time, and had fixed non-adjustable characteristics", "c": "They were overly sensitive and operated frequently during normal load swings", "d": "They required digital computers to calculate the correct operating time"}'::jsonb,
  'b',
  'Electromechanical relays (induction disc, attracted armature) were limited by mechanical inertia (slower response), required more CT burden, had mechanical wear, and had fixed time-current characteristics that were difficult to adjust.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000007'
),
(
  'component-testing', 'protective-relays', 2, 'conceptual', 2, 3,
  'What distinguishes a solid-state relay from an electromechanical relay?',
  '{"a": "Solid-state relays use magnets and moving contacts; electromechanical relays use transistors", "b": "Solid-state relays use analog electronic circuits (transistors, op-amps) with no moving parts", "c": "Solid-state relays are only suitable for DC protection applications", "d": "Solid-state relays cannot measure current magnitude"}'::jsonb,
  'b',
  'Solid-state relays (1970s) replaced mechanical parts with analog electronic circuits. Benefits: faster operation, lower CT burden requirements, greater reliability (no mechanical wear), more adjustable characteristics.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000007'
),
(
  'component-testing', 'protective-relays', 2, 'conceptual', 1, 3,
  'What major advantages do microprocessor-based (digital) relays offer over electromechanical relays?',
  '{"a": "They are significantly less expensive to purchase and install", "b": "Multiple protection functions, self-diagnostics, oscillography, event recording, and SCADA communications — all in a single device", "c": "They operate at lower voltages (5V DC), improving installation safety", "d": "They do not require current transformers for operation"}'::jsonb,
  'b',
  'Microprocessor relays (1980s–90s) combine dozens of protection functions, self-monitoring diagnostics, fault recording (oscillography), and communications (IEC 61850, Modbus, DNP3) in one device — replacing entire racks of electromechanical relays.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000007'
),
(
  'component-testing', 'protective-relays', 2, 'conceptual', 2, 3,
  'How does an induction disc overcurrent relay produce its inverse time-current characteristic?',
  '{"a": "A magnetic disc vibrates at a frequency proportional to system voltage, closing a contact when frequency matches a target", "b": "Two magnetic fluxes create eddy-current torque in an aluminum disc — greater overcurrent spins the disc faster, closing contacts sooner", "c": "A bimetallic strip bends proportionally to the heating caused by overcurrent", "d": "A digital counter increments at a rate proportional to current and trips at a preset count"}'::jsonb,
  'b',
  'In an induction disc relay, the current coil creates two magnetic fluxes that induce eddy currents in the aluminum disc. Their interaction creates torque ∝ I². Higher current = faster disc rotation = faster trip. This creates the classic inverse time characteristic.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000007'
),
(
  'component-testing', 'protective-relays', 2, 'conceptual', 2, 3,
  'What does the "IEEE Very Inverse" time-current curve shape mean for relay coordination?',
  '{"a": "The relay operates instantaneously for all currents above pickup regardless of magnitude", "b": "A steep inverse slope — small overcurrents take much longer than large overcurrents, providing better discrimination across a wide current range", "c": "The relay operates at a fixed time delay regardless of current magnitude", "d": "The relay only operates for three-phase fault currents, not for single-phase faults"}'::jsonb,
  'b',
  'IEEE defines curve shapes: Inverse, Very Inverse, and Extremely Inverse. Very Inverse has a steeper slope — it better discriminates between moderate overcurrents (load) and severe fault currents. Useful where fault current varies widely through the system.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000007'
),
(
  'component-testing', 'protective-relays', 2, 'conceptual', 2, 3,
  'What drove utilities to transition from electromechanical to microprocessor relays in the 1990s?',
  '{"a": "Electromechanical relays stopped being manufactured and replacement parts were unavailable", "b": "One microprocessor relay could replace 5–10 electromechanical relays while adding fault recording, diagnostics, and SCADA communications", "c": "New NETA standards in 1990 mandated the use of digital relays in all new substations", "d": "Analog solid-state relays were found to be unsafe under certain fault conditions"}'::jsonb,
  'b',
  'Economics and functionality drove the transition: one IED replaced many individual relays, reduced panel space, provided oscillography for post-fault analysis, communicated with SCADA systems, and self-tested for improved reliability.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000007'
),
(
  'component-testing', 'protective-relays', 2, 'conceptual', 1, 3,
  'What does "IED" stand for in modern protection engineering?',
  '{"a": "Isolated Electrical Device — a relay with no external communication ports", "b": "Intelligent Electronic Device — a microprocessor-based relay, meter, or controller with digital communications capability", "c": "Integrated Engineering Diagram — a one-line diagram showing all protection schemes", "d": "Induction Element Device — any relay using the induction disc principle"}'::jsonb,
  'b',
  'IED (Intelligent Electronic Device) is the modern term for microprocessor-based protective relays, meters, and controllers that can communicate using protocols such as IEC 61850, Modbus, DNP3, or GOOSE messaging.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000007'
);

-- =============================================================================
-- 12. MODULE 8 — RELAY TESTING FUNDAMENTALS (10 questions)
-- =============================================================================

INSERT INTO public.questions
  (domain, subdomain, level, concept_type, difficulty, frequency_tier,
   question, options, correct_answer, explanation, source, question_type, roadmap_module_id)
VALUES
(
  'systems-commissioning', 'functional-testing', 2, 'conceptual', 1, 2,
  'What is the fundamental purpose of testing protective relays?',
  '{"a": "To reset relay target indicators (flags) after they have operated during a fault", "b": "To verify the relay operates correctly at its design settings and will trip the breaker during actual fault conditions", "c": "To calibrate the CT ratio to exactly 5A secondary current", "d": "To establish the breaker clearing time for coordination studies"}'::jsonb,
  'b',
  'Relay testing verifies: correct pickup setting, correct timing characteristic, proper trip output contact operation, and the complete path to the breaker. Required by NETA ATS after installation and at maintenance intervals.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000008'
),
(
  'systems-commissioning', 'functional-testing', 2, 'conceptual', 1, 2,
  'What does "pickup" mean in relay testing terminology?',
  '{"a": "The relay''s physical location number in the protection panel", "b": "The minimum input quantity (current, voltage, etc.) at which the relay element begins to operate", "c": "The relay''s maximum current rating before internal damage occurs", "d": "The time required to physically install and wire the relay in the panel"}'::jsonb,
  'b',
  'Pickup is the minimum input that causes the relay element to begin operating — the disc starts rotating in an induction relay; the element enables in a microprocessor relay. Testing pickup verifies the relay responds at the correct threshold.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000008'
),
(
  'systems-commissioning', 'functional-testing', 2, 'conceptual', 2, 2,
  'What is the difference between a relay pickup test and a timing test?',
  '{"a": "Pickup tests verify accuracy at low currents; timing tests verify accuracy at high currents only", "b": "Pickup verifies the minimum operate threshold; timing applies a specific current multiple and measures how long the relay takes to operate", "c": "They are the same test performed at different current levels", "d": "Pickup tests are for instantaneous elements only; timing tests are only for differential relays"}'::jsonb,
  'b',
  'Pickup test: gradually increase current until relay just operates — verify within ±5% of setting. Timing test: apply a fixed multiple of pickup (e.g., 2×, 5×, 10×) and measure operate time — compare to TCC with ±10% or ±50ms tolerance.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000008'
),
(
  'systems-commissioning', 'functional-testing', 2, 'conceptual', 1, 2,
  'What is the purpose of a relay test set?',
  '{"a": "To provide controlled, adjustable currents and voltages that simulate power system fault conditions for relay testing", "b": "To measure the insulation resistance of relay winding coils", "c": "To calibrate the CT burden to exactly the specified secondary impedance", "d": "To measure the contact resistance of circuit breaker main contacts"}'::jsonb,
  'a',
  'A relay test set generates precise current, voltage, frequency, and phase angle outputs under controlled conditions. It simulates fault conditions (overcurrent, undervoltage, etc.) to test relay operation without creating actual power system faults.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000008'
),
(
  'systems-commissioning', 'functional-testing', 2, 'conceptual', 2, 2,
  'What is the "burden" of a relay input circuit, and why must it be measured before testing?',
  '{"a": "The relay physical weight — must be checked for proper panel support before installation", "b": "The impedance (VA or Ω) the relay presents to the CT or PT secondary — affects CT accuracy and saturation margins", "c": "The relay DC power consumption in watts during normal monitoring mode", "d": "The relay''s rated response time in milliseconds at maximum overcurrent"}'::jsonb,
  'b',
  'Relay burden is the impedance the relay presents to the instrument transformer secondary. Excessive burden causes CT saturation or PT voltage error. Burden must be verified when selecting CT accuracy class and sizing secondary lead wiring.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000008'
),
(
  'systems-commissioning', 'functional-testing', 2, 'conceptual', 2, 2,
  'Why must relay testing include a "trip circuit" continuity test?',
  '{"a": "To verify the relay coil impedance matches the manufacturer''s specification", "b": "To verify the complete path from relay output contact through wiring to the breaker trip coil actually operates the breaker", "c": "To check circuit breaker main contact resistance after each relay operation", "d": "To verify CT secondary grounding location meets NETA standards"}'::jsonb,
  'b',
  'A relay that operates correctly is useless if the trip circuit is open, a terminal is loose, or the breaker trip coil is failed. The complete scheme test verifies the entire chain: CT → relay → output contact → trip wiring → breaker trip coil → breaker opens.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000008'
),
(
  'systems-commissioning', 'functional-testing', 2, 'table-lookup', 1, 2,
  'What is the standard CT secondary current rating for North American protective relay applications?',
  '{"a": "1 ampere (standard in Europe and international applications)", "b": "5 amperes (standard in North America)", "c": "10 amperes (for high-current applications above 5000A primary)", "d": "100 milliamperes (for digital relay metering inputs)"}'::jsonb,
  'b',
  'The standard CT secondary rating in North America is 5 amperes at rated primary current. (Europe and international use 1A.) All relay burden tables, lead wire sizing charts, and test equipment are standardized around the 5A secondary.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000008'
),
(
  'systems-commissioning', 'functional-testing', 2, 'conceptual', 2, 2,
  'What is CT saturation, and why is it dangerous for protection relays?',
  '{"a": "When the CT primary current exceeds the nameplate rating, reducing transformer life", "b": "When the CT magnetic core reaches maximum flux — secondary current becomes distorted and no longer accurately represents primary current", "c": "When too many relays are connected to one CT secondary, increasing burden beyond the limit", "d": "When the CT is installed outdoors and exposed to temperature cycling"}'::jsonb,
  'b',
  'CT saturation occurs when core flux reaches its maximum — additional primary current produces a clipped, distorted secondary waveform that is lower than the true value. Saturated CTs can cause differential relays to misoperate or overcurrent relays to fail to trip.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000008'
),
(
  'systems-commissioning', 'functional-testing', 2, 'conceptual', 2, 2,
  'What is the "reset" of an overcurrent relay element?',
  '{"a": "Clearing the relay''s stored fault event log and oscillography records", "b": "The relay element returning to its non-operated state after the input falls below the reset threshold", "c": "Re-entering all relay settings after a firmware update or factory reset", "d": "Resetting the relay''s target (flag) indicator after manual inspection"}'::jsonb,
  'b',
  'Reset is the opposite of pickup — the element drops out when current falls below the reset level (typically 95–98% of pickup for electromechanical; near-instantaneous or programmable for microprocessor relays). Reset time affects coordination for intermittent faults.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000008'
),
(
  'systems-commissioning', 'functional-testing', 2, 'conceptual', 2, 2,
  'What is a "functional test" of a complete protection scheme?',
  '{"a": "A test performed at rated load current to verify relay stability during normal operation", "b": "An end-to-end test verifying the complete protection chain from CT/PT inputs through relay logic to breaker operation, simulating actual fault conditions", "c": "A test of relay target and flag indicators to verify they operate mechanically", "d": "A test of the DC control power supply voltage and current capacity"}'::jsonb,
  'b',
  'A functional test simulates actual fault conditions using a test set to verify the entire protection scheme: instrument transformers → wiring → relay inputs → relay logic → output contacts → trip wiring → breaker trip coil → breaker opens. Required by NETA ATS after installation.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000008'
);

-- =============================================================================
-- 13. MODULE 9 — TEST SHEETS & DOCUMENTATION (8 questions)
-- =============================================================================

INSERT INTO public.questions
  (domain, subdomain, level, concept_type, difficulty, frequency_tier,
   question, options, correct_answer, explanation, source, question_type, roadmap_module_id)
VALUES
(
  'systems-commissioning', 'commissioning-process', 2, 'conceptual', 1, 2,
  'Why is accurate test documentation important after relay testing?',
  '{"a": "To satisfy insurance requirements for high-voltage equipment coverage", "b": "To provide a record of as-left settings and test results for future comparison, troubleshooting, and regulatory compliance", "c": "Primarily to bill the customer accurately for the testing services provided", "d": "To update the relay firmware version log maintained by the manufacturer"}'::jsonb,
  'b',
  'Test sheets document as-found and as-left conditions, settings, and results. This baseline is critical for future maintenance comparisons, post-fault analysis, regulatory compliance (NERC, NETA), and verifying protection integrity over time.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000009'
),
(
  'systems-commissioning', 'commissioning-process', 2, 'conceptual', 1, 2,
  'What minimum information must be recorded on a relay test sheet?',
  '{"a": "Only the test date and the technician''s name", "b": "Equipment ID/tag, relay type/model/serial number, as-found and as-left settings, all test results, test equipment used, date, technician name, and any deficiencies", "c": "Only pickup and timing test results, since those are the critical performance metrics", "d": "Only the relay model number and current firmware version"}'::jsonb,
  'b',
  'A complete test sheet includes: equipment identification, relay information, settings (as-found and as-left), all test results, test equipment identification (for calibration traceability), date, technician signature, and any deficiencies noted.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000009'
),
(
  'systems-commissioning', 'commissioning-process', 2, 'conceptual', 1, 2,
  'What do "as-found" and "as-left" mean on a relay test sheet?',
  '{"a": "As-found = the relay was found physically installed; as-left = the relay was removed for bench testing", "b": "As-found = the relay condition and settings before any adjustments; as-left = the final condition and settings after testing and adjustments", "c": "As-found = data from the design drawings; as-left = actual field-measured values", "d": "They mean the same thing — just two terms for the final relay condition"}'::jsonb,
  'b',
  'As-found documents the relay''s settings and condition when testing began, before any changes. As-left documents the final state after adjustments. Comparison reveals if the relay drifted from design, was inadvertently changed, or degraded since last test.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000009'
),
(
  'systems-commissioning', 'commissioning-process', 2, 'conceptual', 2, 2,
  'A technician finds relay settings that differ from the coordination study. What is the correct action?',
  '{"a": "Nothing — minor differences are expected and acceptable in the field", "b": "Document as-found settings, note the discrepancy, notify the engineer of record, and document corrective action taken or reason for acceptance", "c": "Simply change the settings to match the study and document only the final as-left values", "d": "Request that the coordination study be revised to match the installed settings"}'::jsonb,
  'b',
  'Any discrepancy must be documented and reported to the engineer of record. The engineer evaluates whether the difference is acceptable or requires correction. Technicians should not change settings independently without engineering authorization.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000009'
),
(
  'systems-commissioning', 'commissioning-process', 2, 'table-lookup', 2, 2,
  'Per NETA ATS standards, what is the acceptable tolerance for overcurrent relay timing tests?',
  '{"a": "±1% of calculated operate time", "b": "±10% of calculated operate time, or ±50ms — whichever is greater", "c": "±25% of calculated operate time", "d": "±5% of calculated operate time, or ±20ms — whichever is greater"}'::jsonb,
  'b',
  'NETA ATS specifies ±10% or ±50ms (0.05 seconds), whichever is greater, for overcurrent relay timing. Manufacturer specifications may be tighter and take precedence. Electromechanical relays typically have wider tolerances than microprocessor relays.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000009'
),
(
  'systems-commissioning', 'commissioning-process', 2, 'conceptual', 2, 2,
  'Why should the test equipment model and serial number always be recorded on the test sheet?',
  '{"a": "To comply with billing requirements for equipment rental charges", "b": "To provide calibration traceability — if equipment is later found out of calibration, affected tests can be identified and reviewed", "c": "To identify which equipment was used to operate the relay target indicator", "d": "To track preventive maintenance schedules for test equipment"}'::jsonb,
  'b',
  'Recording test equipment ID provides calibration traceability. If test equipment is later discovered to have been out of calibration, all tests performed with that equipment during that period can be reviewed and potentially re-performed.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000009'
),
(
  'systems-commissioning', 'commissioning-process', 2, 'conceptual', 2, 2,
  'What is the difference between a NETA acceptance test and a NETA maintenance test?',
  '{"a": "Acceptance tests are performed by the manufacturer; maintenance tests are the owner''s responsibility", "b": "Acceptance tests are performed on new equipment before initial energization; maintenance tests are periodic tests on in-service equipment to verify continued correct operation", "c": "Acceptance tests are always more comprehensive and take longer than maintenance tests", "d": "They use entirely different test procedures and equipment"}'::jsonb,
  'b',
  'NETA ATS (Acceptance Testing Specifications) covers new equipment before initial energization — verifying it meets specifications. NETA MTS (Maintenance Testing Specifications) covers periodic testing of in-service equipment at defined intervals.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000009'
),
(
  'systems-commissioning', 'commissioning-process', 2, 'conceptual', 2, 2,
  'When should a relay test report be formally signed and certified by the testing technician?',
  '{"a": "Before testing begins, to authorize the test procedure", "b": "After all testing is complete, results are recorded, and any deficiencies are resolved or formally documented as outstanding items", "c": "Immediately after each individual test step is completed", "d": "Only when the relay has passed all tests with no deficiencies found"}'::jsonb,
  'b',
  'The report is signed after all testing is complete and results are recorded. Deficiencies must be either corrected and re-tested, or documented as outstanding items requiring follow-up. Signing certifies the accuracy of the test records, not necessarily a pass result.',
  'generated', 'roadmap', 'a0000000-0000-4000-a000-000000000009'
);
