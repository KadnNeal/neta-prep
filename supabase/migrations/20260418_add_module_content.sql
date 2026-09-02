-- Session 13: Rich content structure for roadmap modules
-- Adds content_sections JSONB + supporting columns to roadmap_modules
-- Adds learning_complete BOOLEAN to user_roadmap_progress
-- Seeds all 9 modules with full educational content

-- =============================================================================
-- 1. SCHEMA CHANGES
-- =============================================================================

ALTER TABLE public.roadmap_modules
  ADD COLUMN IF NOT EXISTS hook_text           text,
  ADD COLUMN IF NOT EXISTS content_sections    jsonb,
  ADD COLUMN IF NOT EXISTS estimated_read_time int,
  ADD COLUMN IF NOT EXISTS video_recommended   boolean DEFAULT false;

ALTER TABLE public.user_roadmap_progress
  ADD COLUMN IF NOT EXISTS learning_complete boolean DEFAULT false;

-- =============================================================================
-- 2. MODULE 1 — THREE-PHASE SYSTEMS & POWER
-- =============================================================================

UPDATE public.roadmap_modules SET
  hook_text = 'Almost every power system you will ever test runs on three-phase AC. Understanding WHY — and knowing the math cold — is the non-negotiable foundation for everything else in this roadmap.',
  estimated_read_time = 12,
  video_recommended = true,
  content_sections = '[
    {
      "type": "text",
      "heading": "Why Three-Phase?",
      "body": "Single-phase AC creates a pulsating power delivery — it dips to zero 120 times per second (at 60 Hz). Three-phase AC solves this by staggering three sine waves 120° apart. Their sum is constant, so power delivery is smooth.\n\nThree-phase also transmits three times the power using only 1.73× the conductor compared to three separate single-phase circuits. This is why generators, transmission lines, and motors are almost exclusively three-phase."
    },
    {
      "type": "quick_check",
      "question": "What is the phase displacement between any two phases in a balanced three-phase system?",
      "options": {"a": "90°", "b": "120°", "c": "180°", "d": "60°"},
      "answer": "b",
      "explanation": "The three phases are displaced 120° from each other (360° ÷ 3 = 120°). At any instant, they sum to zero."
    },
    {
      "type": "text",
      "heading": "Wye vs. Delta Connections",
      "body": "**Wye (Y):** Each phase connects between a line and a common neutral point.\n- Line voltage = √3 × Phase voltage\n- Line current = Phase current\n- Neutral carries unbalanced current; grounding is straightforward.\n\n**Delta (Δ):** Each phase connects directly between two lines — no neutral.\n- Line voltage = Phase voltage\n- Line current = √3 × Phase current\n- No neutral, so circulating currents are possible. Third-harmonic currents circulate harmlessly inside the delta.\n\nMemory hook: **Wye multiplies voltage by √3 going out; Delta multiplies current by √3 going out.**"
    },
    {
      "type": "text",
      "heading": "The Power Triangle",
      "body": "Three-phase power has three components you must know for the exam:\n\n| Symbol | Name | Unit | Formula |\n|--------|------|------|---------|\n| S | Apparent power | kVA | √3 × V_L × I_L |\n| P | Real (true) power | kW | S × PF |\n| Q | Reactive power | kVAR | √(S² − P²) |\n\nThe power factor (PF) angle θ relates them: P = S cos θ, Q = S sin θ.\n\nFor the exam: if you see MVA + voltage + %Z, you are being set up to calculate fault current. Start with I_FLA = S / (√3 × V), then I_fault = I_FLA / (Z_pu)."
    },
    {
      "type": "worked_example",
      "problem": "A 10 MVA, 13.8 kV transformer has a nameplate impedance of 5.75%. Calculate the full-load amps (FLA) on the 13.8 kV side, then the available fault current if a bolted three-phase fault occurs at the terminals.",
      "steps": [
        "Step 1 — FLA: I_FLA = S / (√3 × V) = 10,000 kVA / (1.732 × 13.8 kV) = 418 A",
        "Step 2 — Convert %Z: 5.75% = 0.0575 per unit",
        "Step 3 — Fault current: I_fault = I_FLA / Z_pu = 418 / 0.0575 = 7,270 A"
      ],
      "answer": "FLA ≈ 418 A; Fault current ≈ 7,270 A (7.27 kA)"
    },
    {
      "type": "quick_check",
      "question": "A 500 kVA, 480 V three-phase transformer is operating at full load with a 0.85 power factor. What is the real power output?",
      "options": {"a": "425 kW", "b": "500 kW", "c": "588 kW", "d": "850 kW"},
      "answer": "a",
      "explanation": "P = S × PF = 500 kVA × 0.85 = 425 kW. The kVA rating is apparent power (S), not real power."
    },
    {
      "type": "video",
      "title": "Three-Phase Power Explained",
      "search_query": "three phase power systems explained wye delta",
      "why": "A visual walkthrough of phasor diagrams makes Wye/Delta relationships click faster than text alone."
    },
    {
      "type": "summary",
      "points": [
        "Three-phase phases are displaced 120° apart — always.",
        "Wye: V_line = √3 × V_phase. Delta: I_line = √3 × I_phase.",
        "S (kVA) = √3 × V_L × I_L. P (kW) = S × PF. Q = √(S² − P²).",
        "Fault current formula: I_fault = I_FLA / Z_pu. Memorize this.",
        "Every calculation on this exam starts with the power triangle."
      ]
    }
  ]'::jsonb
WHERE id = 'a0000000-0000-4000-a000-000000000001';

-- =============================================================================
-- 3. MODULE 2 — TRANSFORMERS: THEORY & CONNECTIONS
-- =============================================================================

UPDATE public.roadmap_modules SET
  hook_text = 'Transformers are why the modern grid exists. Without them, long-distance power transmission would be economically impossible. As a NETA tech, you will test more transformers than any other apparatus — so this is not optional knowledge.',
  estimated_read_time = 10,
  video_recommended = true,
  content_sections = '[
    {
      "type": "text",
      "heading": "How a Transformer Works",
      "body": "A transformer transfers energy from one circuit to another via electromagnetic induction — no electrical connection required between primary and secondary.\n\nAC current in the primary winding creates a changing magnetic flux in the core. That changing flux induces a voltage in the secondary winding. The ratio of turns determines the voltage ratio:\n\n**V_primary / V_secondary = N_primary / N_secondary = a (turns ratio)**\n\nBecause power is conserved (ignoring losses): V_p × I_p ≈ V_s × I_s\n\nSo if voltage goes UP, current goes DOWN by the same ratio. This is why step-up transformers have high voltage but low current on the transmission side — thin wire, less I²R loss."
    },
    {
      "type": "quick_check",
      "question": "A transformer has a turns ratio of 10:1 (primary to secondary). If the primary voltage is 13,800 V, what is the secondary voltage?",
      "options": {"a": "138 V", "b": "1,380 V", "c": "138,000 V", "d": "13,800 V"},
      "answer": "b",
      "explanation": "V_secondary = V_primary / turns ratio = 13,800 / 10 = 1,380 V. The turns ratio a = N_p/N_s = V_p/V_s."
    },
    {
      "type": "text",
      "heading": "Three-Phase Transformer Connections",
      "body": "Three-phase transformers can connect each winding in Wye or Delta. The four common combinations:\n\n| Configuration | Phase Shift | Common Use |\n|---------------|-------------|------------|\n| Wye–Wye | 0° | Transmission, metering |\n| Delta–Wye | 30° | Most distribution substation transformers |\n| Wye–Delta | 30° (lag) | Generator step-up |\n| Delta–Delta | 0° | Industrial, no neutral needed |\n\n**The 30° phase shift in Wye-Delta is critical for differential relay settings.** Ignore it and your relay will see a continuous \"fault\" on every energization."
    },
    {
      "type": "text",
      "heading": "Nameplate Data You Must Know",
      "body": "Every transformer nameplate carries:\n- **kVA or MVA rating** — thermal capacity, not power delivered\n- **Voltage ratings** (primary/secondary, no-load)\n- **%Z (impedance)** — determines available fault current\n- **Temperature rise** — 80°C, 115°C, or 150°C (Class F is most common for dry-type)\n- **Vector group** — identifies Wye/Delta connections and phase shift (e.g., Dyn11)\n- **Cooling class** — ONAN, ONAF, OFAF for liquid-filled; AA, FA for dry-type\n\n**Exam trap:** Dry-type transformer rated temperature rise is 150°C (Class F) for most exam questions. Don''t confuse the rise (150°C) with the maximum hot-spot temperature (~220°C)."
    },
    {
      "type": "quick_check",
      "question": "A Delta-Wye distribution transformer introduces what phase shift between primary and secondary?",
      "options": {"a": "0°", "b": "30°", "c": "60°", "d": "90°"},
      "answer": "b",
      "explanation": "Delta-Wye (and Wye-Delta) transformers introduce a 30° phase shift. This must be compensated in differential relay settings or the relay will see it as a fault current."
    },
    {
      "type": "summary",
      "points": [
        "Turns ratio: V_p/V_s = N_p/N_s = I_s/I_p. Voltage and current are inverse.",
        "Delta-Wye introduces a 30° phase shift — critical for differential relay compensation.",
        "Dry-type rated temperature rise: 150°C (Class F) — a frequent exam trap.",
        "%Z on the nameplate is used directly to calculate available fault current.",
        "Wye secondary provides a neutral; Delta secondary does not."
      ]
    }
  ]'::jsonb
WHERE id = 'a0000000-0000-4000-a000-000000000002';

-- =============================================================================
-- 4. MODULE 3 — INSTRUMENT TRANSFORMERS: CTs & PTs
-- =============================================================================

UPDATE public.roadmap_modules SET
  hook_text = 'You cannot connect a meter or relay directly to a 138 kV bus. Current transformers (CTs) and potential transformers (PTs) bring those dangerous quantities down to safe, measurable values — and they are the inputs to every relay on the system. If you misunderstand CTs, people die.',
  estimated_read_time = 11,
  video_recommended = false,
  content_sections = '[
    {
      "type": "text",
      "heading": "Current Transformers (CTs)",
      "body": "A CT steps down high primary current to a safe secondary level — typically **5 A** standard. The ratio is expressed as primary:secondary (e.g., 3000:5 = 600:1).\n\n**Critical safety rule:** Never open a CT secondary while the primary is energized. With the secondary open, the CT acts as a voltage transformer and can generate thousands of volts — lethal and destructive.\n\n**Grounding:** CT secondary circuits must be grounded at **one point only**. Multiple grounds create circulating currents and measurement errors. The ground goes on the side away from the relay — grounding on the wrong side means the relay won''t see the fault current and will fail to operate.\n\n**Burden testing:** Establish the CT burden BEFORE energizing the core. Burden is the impedance of the connected load (meters, relays, wiring)."
    },
    {
      "type": "quick_check",
      "question": "A CT secondary is accidentally opened while the primary current is 500 A. What is the danger?",
      "options": {
        "a": "The CT will overheat from excess current",
        "b": "High voltage will develop across the open secondary — potentially lethal",
        "c": "The connected relay will trip incorrectly",
        "d": "The primary circuit will be interrupted"
      },
      "answer": "b",
      "explanation": "An open CT secondary forces all magnetizing energy into developing voltage rather than driving current. The secondary voltage can reach thousands of volts, destroying insulation and posing a lethal shock hazard."
    },
    {
      "type": "text",
      "heading": "CT Ratio Math: Multiple Turns",
      "body": "The standard CT ratio assumes the primary conductor passes through the window once (1 turn). If you need a different ratio for testing — say your test set only goes to 500 A but the relay requires 1,000 A — you can pass the conductor through the CT window multiple times.\n\n**Each pass = 1 additional turn = multiplied apparent current.**\n\nExample: A 3000:5 CT (600:1). If you loop the cable 3 times:\n- Apparent primary turns = 3\n- Effective ratio = 3000 / (5 × 3) = 200:1\n- 500 A test current → relay sees 500 × 3 / 600 = 2.5 A secondary\n\nThis appears frequently on the exam as: \"Your test equipment maximum is 500 A. How many loops are needed to test a 3000:5 CT relay at full-load amps?\""
    },
    {
      "type": "worked_example",
      "problem": "A 3000:5 CT feeds an overcurrent relay set at 5 A pickup. Your test set has a maximum output of 300 A. How many times must you loop the test lead through the CT window to achieve the equivalent of 3,000 A on the primary?",
      "steps": [
        "Step 1 — Determine required apparent primary amps: We need the relay to see 3,000 A equivalent.",
        "Step 2 — Each loop multiplies apparent current: loops = required primary / test set output = 3,000 / 300 = 10 loops.",
        "Step 3 — Verify: 300 A × 10 turns = 3,000 A apparent. CT ratio 3000:5 → relay sees 3,000/600 = 5 A. ✓ At pickup."
      ],
      "answer": "10 loops through the CT window."
    },
    {
      "type": "text",
      "heading": "Potential Transformers (PTs / VTs)",
      "body": "PTs step down high system voltage to a safe secondary — typically **120 V** (line-to-line) or 69.3 V (line-to-neutral).\n\nUnlike CTs, PT secondaries should **never be short-circuited** — this would cause a large fault current and destroy the PT.\n\n**Accuracy classes:** CTs and PTs are rated 0.3, 0.6, or 1.2 — the maximum percent error. Metering-class devices (0.3) must be more accurate than relaying-class (typically 1.2 or C-class for CTs).\n\n**Polarity markings:** H1/X1 are the same instantaneous polarity. For differential protection, polarity must be consistent across all CTs in the zone — reversed polarity causes the relay to sum currents instead of subtract them, guaranteeing a false trip."
    },
    {
      "type": "quick_check",
      "question": "A CT secondary ground is accidentally connected on the relay side of the secondary circuit rather than the source side. What is the result?",
      "options": {
        "a": "No effect — grounding location does not matter",
        "b": "The relay will trip faster than normal",
        "c": "Fault current will bypass the relay; the relay will not operate",
        "d": "The CT will saturate during a fault"
      },
      "answer": "c",
      "explanation": "If the ground is on the relay side, fault current has a path to ground that bypasses the relay coil. The relay will not see the fault and will fail to trip — a protection failure."
    },
    {
      "type": "summary",
      "points": [
        "Never open a CT secondary under load — lethal voltage will appear.",
        "CT secondaries: one ground only, on the source side (away from relay).",
        "Each conductor pass through CT window = 1 additional primary turn.",
        "PT secondaries must never be shorted — it will destroy the PT.",
        "Polarity (H1/X1) must be consistent for differential protection to work."
      ]
    }
  ]'::jsonb
WHERE id = 'a0000000-0000-4000-a000-000000000003';

-- =============================================================================
-- 5. MODULE 4 — FAULT TYPES ON POWER SYSTEMS
-- =============================================================================

UPDATE public.roadmap_modules SET
  hook_text = 'Every relay on the system exists for one reason: to detect and isolate faults. You cannot understand protection without understanding what faults look like — their current magnitudes, their symmetry, and why some are more dangerous than others.',
  estimated_read_time = 9,
  video_recommended = false,
  content_sections = '[
    {
      "type": "text",
      "heading": "The Four Fault Types",
      "body": "Power system faults fall into four categories, ranked from most to least common:\n\n| Fault Type | Abbrev | Frequency | Severity |\n|------------|--------|-----------|----------|\n| Single line-to-ground (SLG) | L-G | ~70–80% | Moderate |\n| Line-to-line (LL) | L-L | ~15–20% | High |\n| Double line-to-ground (DLG) | DLG | ~5–10% | High |\n| Three-phase bolted | 3φ | ~3–5% | Highest |\n\nThe three-phase fault is rarest but produces the maximum fault current — it is used as the basis for equipment ratings and relay settings.\n\nThe SLG fault is the most common, especially on ungrounded or high-resistance grounded systems where it may not immediately trip the system."
    },
    {
      "type": "text",
      "heading": "Fault Current Magnitude",
      "body": "Fault current magnitude depends on the system impedance in the fault path:\n\n**Three-phase fault (symmetric):**\nI_fault = V_nominal / Z_total\n\n**In per-unit with transformer impedance:**\nI_fault = I_FLA / %Z_pu\n\nWhere I_FLA is the rated full-load current and %Z_pu is the per-unit impedance (e.g., 5.75% = 0.0575).\n\nFor ground faults, the magnitude also depends on the **zero-sequence impedance** of the system — which in turn depends on the grounding method. A solidly grounded system allows large ground fault currents. A high-resistance grounded (HRG) system limits ground fault current to just a few amps."
    },
    {
      "type": "quick_check",
      "question": "Which fault type occurs most frequently on power systems?",
      "options": {
        "a": "Three-phase bolted fault",
        "b": "Line-to-line fault",
        "c": "Single line-to-ground fault",
        "d": "Double line-to-ground fault"
      },
      "answer": "c",
      "explanation": "Single line-to-ground faults account for 70–80% of all power system faults, typically caused by insulation failure, weather, or conductor contact with ground."
    },
    {
      "type": "text",
      "heading": "How Fault Type Affects Protection",
      "body": "Different fault types require different relay elements:\n\n- **Three-phase fault:** Detected by phase overcurrent (50/51) or distance (21)\n- **Line-to-line fault:** Detected by phase overcurrent or distance\n- **SLG fault:** Detected by ground overcurrent (50G/51G), residual ground (3I₀), or zero-sequence voltage (59N)\n- **Internal transformer fault:** Detected by differential relay (87) — key because it can detect turn-to-turn faults that don''t produce large currents\n\n**The Buchholz relay (ANSI 63)** detects gas accumulation in liquid-filled transformers — catches internal arcing faults that no current-based relay can see."
    },
    {
      "type": "quick_check",
      "question": "A three-phase bolted fault produces less current than a single line-to-ground fault on the same system. Under what system condition is this true?",
      "options": {
        "a": "Never — three-phase fault always produces the most current",
        "b": "When the system is solidly grounded and zero-sequence impedance is low",
        "c": "When the system is ungrounded",
        "d": "When the transformer uses a Delta-Wye connection"
      },
      "answer": "b",
      "explanation": "On solidly grounded systems with very low zero-sequence impedance, the SLG fault current can actually exceed the three-phase fault current. This is an important edge case in protection engineering, though the three-phase fault is still used for equipment ratings."
    },
    {
      "type": "summary",
      "points": [
        "SLG faults are most common (70–80%); three-phase are most severe but rarest.",
        "Three-phase fault current = I_FLA / %Z_pu. Memorize this formula.",
        "Ground fault magnitude depends on system grounding method (solid vs HRG).",
        "Buchholz relay (63) detects transformer internal faults via gas accumulation.",
        "Relay type selection depends on the fault type it must detect."
      ]
    }
  ]'::jsonb
WHERE id = 'a0000000-0000-4000-a000-000000000004';

-- =============================================================================
-- 6. MODULE 5 — GROUNDING METHODS & SEQUENCE COMPONENTS
-- =============================================================================

UPDATE public.roadmap_modules SET
  hook_text = 'How a power system is grounded determines whether a single ground fault immediately trips the system, damages equipment silently for hours, or blows up catastrophically. This is one of the most tested conceptual areas on the NETA exam.',
  estimated_read_time = 10,
  video_recommended = false,
  content_sections = '[
    {
      "type": "text",
      "heading": "System Grounding Methods",
      "body": "System grounding refers to how the neutral of a power source (generator or transformer) is connected to earth. The method dramatically affects fault behavior.\n\n**Solidly grounded:** Neutral tied directly to earth. Ground fault current can be very high (same order as three-phase fault). Used on most distribution systems. Fast fault clearing; no overvoltage on unfaulted phases.\n\n**Resistance grounded (LRG/HRG):**\n- Low-resistance (LRG): Limits ground fault current to 200–400 A. Allows relaying; used on medium-voltage systems.\n- High-resistance (HRG): Limits current to < 10 A. System can continue operating with a ground fault. Used in industrial plants where process continuity is critical.\n\n**Ungrounded (isolated neutral):** No intentional path to ground. A single fault doesn''t trip anything. But the unfaulted phases rise to √3 × line voltage above ground — dangerous.\n\n**Reactance grounded:** Uses an inductor in the neutral. Tuned grounding (Petersen coil) can completely cancel ground fault current."
    },
    {
      "type": "quick_check",
      "question": "An industrial plant uses high-resistance grounding (HRG) on its 4160 V system. A single line-to-ground fault occurs. What is the expected behavior?",
      "options": {
        "a": "The system trips immediately on high fault current",
        "b": "The system continues operating; fault current is limited to a few amps",
        "c": "The other two phases drop to zero voltage",
        "d": "The transformer neutral is destroyed by overcurrent"
      },
      "answer": "b",
      "explanation": "HRG limits ground fault current to typically < 5–10 A. The system can continue operating, and alarms alert operators to locate and clear the fault before it escalates."
    },
    {
      "type": "text",
      "heading": "Symmetrical Components (The Basics)",
      "body": "Symmetrical components are the mathematical tool that lets engineers analyze unbalanced (fault) conditions using balanced network models. Any unbalanced set of three-phase quantities can be decomposed into three balanced sets:\n\n**Positive sequence (1, or +):** Three equal-magnitude phasors, 120° apart, in normal ABC rotation. This is what the system looks like under normal load.\n\n**Negative sequence (2, or −):** Three equal-magnitude phasors, 120° apart, but in reverse rotation (ACB). Negative sequence appears during unbalanced faults (SLG, LL). Negative-sequence current causes heating in generators and motors.\n\n**Zero sequence (0):** Three equal-magnitude, in-phase phasors (0° displacement). Zero sequence flows only when there is a path to ground — it is the ground fault current. A delta winding blocks zero sequence from passing through.\n\n**NETA exam application:** You need to know which fault types produce which sequences:\n- Three-phase fault: positive sequence only\n- SLG fault: all three sequences (1, 2, 0)\n- LL fault: positive and negative sequence (no zero)"
    },
    {
      "type": "quick_check",
      "question": "Which sequence component is present ONLY during ground faults (not during line-to-line faults)?",
      "options": {
        "a": "Positive sequence",
        "b": "Negative sequence",
        "c": "Zero sequence",
        "d": "All sequences are present in all fault types"
      },
      "answer": "c",
      "explanation": "Zero-sequence current requires a path to ground and only flows during ground faults (SLG or DLG). Line-to-line faults produce positive and negative sequence only. A delta winding blocks zero sequence from passing through the transformer."
    },
    {
      "type": "summary",
      "points": [
        "Solidly grounded: high fault current, fast clearing, no overvoltage on unfaulted phases.",
        "HRG: limits ground fault to < 10 A; system continues operating with a fault.",
        "Ungrounded: unfaulted phases rise to √3 × normal voltage — dangerous.",
        "Zero-sequence current = ground fault current. Delta windings block zero sequence.",
        "SLG fault contains all three sequences. Three-phase fault has positive sequence only."
      ]
    }
  ]'::jsonb
WHERE id = 'a0000000-0000-4000-a000-000000000005';

-- =============================================================================
-- 7. MODULE 6 — INTRODUCTION TO PROTECTIVE RELAYS
-- =============================================================================

UPDATE public.roadmap_modules SET
  hook_text = 'Protective relays are the single largest topic on the NETA Level 3 exam — 8–15 questions, roughly 15% of your score. Engineers who recalled exam questions from 2020–2025 ALL mentioned relay questions. You need to know this deeply.',
  estimated_read_time = 14,
  video_recommended = true,
  content_sections = '[
    {
      "type": "text",
      "heading": "What Is a Protective Relay?",
      "body": "A protective relay is a device that continuously monitors electrical quantities (current, voltage, frequency, power flow) and signals a circuit breaker to trip when those quantities indicate a fault or abnormal condition.\n\nThe relay is NOT the circuit breaker — it only issues the trip command. The relay monitors; the breaker interrupts. Understanding this distinction is critical for questions about trip sequence.\n\n**Relay trip sequence (memorize this exactly):**\n1. Fault occurs on the system\n2. Overcurrent relay (51) detects excess current and times out\n3. **Lockout relay (86) operates** — it latches and sends the trip signal\n4. Circuit breaker (52) trips open\n\n**Exam trap:** \"What trips first?\" — Answer is the 86 lockout relay, not the 52 circuit breaker. The 86 is an intermediate device that must be manually reset after operation."
    },
    {
      "type": "text",
      "heading": "ANSI Device Numbers — The Ones You Must Know",
      "body": "ANSI/IEEE device numbers are the universal language of protection engineers. The NETA exam uses them extensively.\n\n| Number | Function | Key Notes |\n|--------|----------|-----------|\n| 21 | Distance relay | Measures impedance; used on transmission lines |\n| 27 | Undervoltage relay | Trap: do NOT confuse with 59 (overvoltage) |\n| 47 | Phase sequence voltage relay | Detects wrong phase rotation |\n| 50 | Instantaneous overcurrent | No time delay |\n| 50G | Instantaneous overcurrent — ground | Trap: vs 51G and 64 |\n| 51 | Time overcurrent | Has intentional time delay for coordination |\n| 51G | Time overcurrent — ground | Time-delayed version of 50G |\n| 52 | AC circuit breaker | This IS the breaker, not a relay |\n| 59 | Overvoltage relay | Trap: do NOT confuse with 27 |\n| 63 | Gas/pressure relay (Buchholz) | Detects transformer internal faults |\n| 67 | Directional overcurrent | Only trips for current flowing one direction |\n| 86 | Lockout relay | Latches after operation; requires manual reset |\n| 87 | Differential relay | Compares currents in vs. out; 2nd harmonic restraint |"
    },
    {
      "type": "quick_check",
      "question": "In a relay protection scheme, a fault causes a 51 relay to time out. What is the correct sequence of subsequent events?",
      "options": {
        "a": "52 circuit breaker trips → 86 lockout latches → fault cleared",
        "b": "86 lockout operates → 52 circuit breaker trips → fault cleared",
        "c": "51 relay trips the fault directly → 86 lockout records the event",
        "d": "87 differential relay operates first, then 51 trips the 52"
      },
      "answer": "b",
      "explanation": "The 51 (time overcurrent) times out and operates the 86 lockout relay. The 86 then issues the trip command to the 52 circuit breaker. The 86 must be manually reset after the fault is cleared and investigated."
    },
    {
      "type": "text",
      "heading": "Zones of Protection",
      "body": "Every piece of equipment on the system should be inside at least one protection zone. A zone is bounded by current transformers and has at least one relay that monitors current flowing in and out.\n\n**Primary protection:** The fastest, most sensitive protection for a given zone. Should trip in < 3 cycles for faults in its zone.\n\n**Backup protection:** A second layer that operates if primary protection fails. Intentionally delayed to give primary protection time to operate first. Backup can be local (different relay on same device) or remote (upstream relay with longer time delay).\n\n**Overlapping zones:** Adjacent zones intentionally overlap at the circuit breakers. This ensures every fault is covered — there is no gap between zones. The trade-off is that a breaker is in two zones; a fault on the breaker trips both adjacent zones."
    },
    {
      "type": "quick_check",
      "question": "Which ANSI device number represents the lockout relay that must be manually reset after a relay protection operation?",
      "options": {"a": "51", "b": "52", "c": "86", "d": "87"},
      "answer": "c",
      "explanation": "The 86 lockout relay latches when it operates and must be manually reset. This prevents the system from automatically re-energizing into a fault. The 52 is the circuit breaker; the 51 is the overcurrent relay that initiated the trip."
    },
    {
      "type": "text",
      "heading": "The 87 Differential Relay",
      "body": "The differential relay (87) is one of the most important protection devices you will encounter. It operates on a simple principle: **current in must equal current out**. If they don''t match, there is an internal fault.\n\nFor a transformer differential relay:\n- CTs on the primary side measure current in\n- CTs on the secondary side measure current out\n- The relay computes the difference (operate current) vs the average (restraint current)\n- If operate current > restraint setting, the relay trips\n\n**2nd Harmonic Restraint — exam critical:**\nWhen a transformer is first energized (\"inrush\"), the magnetizing current can be 6–10× rated current for 0.1–0.5 seconds. Without restraint, the 87 relay would trip every time the transformer is energized.\n\nInrush current is rich in **2nd harmonic** content (120 Hz on a 60 Hz system). The relay''s harmonic restraint function detects this and blocks the trip during inrush. Fault current has very little harmonic content, so the relay will still trip correctly for real faults.\n\n**This was asked by ALL FOUR recalled engineers.** Know it."
    },
    {
      "type": "video",
      "title": "Differential Protection and Harmonic Restraint",
      "search_query": "transformer differential relay 87 second harmonic restraint explained",
      "why": "The 2nd harmonic restraint concept is abstract — a visual demonstration of inrush waveforms vs fault waveforms makes it stick."
    },
    {
      "type": "summary",
      "points": [
        "Relay trip sequence: 51 times out → 86 lockout operates → 52 circuit breaker trips.",
        "86 lockout must be manually reset — it does NOT auto-reset.",
        "27 = undervoltage; 59 = overvoltage. These are a classic exam trap — know both.",
        "87 differential relay: trips when current in ≠ current out. Protects transformers, buses, generators.",
        "2nd harmonic restraint prevents false trip on transformer inrush. Fault current lacks harmonics."
      ]
    }
  ]'::jsonb
WHERE id = 'a0000000-0000-4000-a000-000000000006';

-- =============================================================================
-- 8. MODULE 7 — HISTORY OF PROTECTIVE RELAYS
-- =============================================================================

UPDATE public.roadmap_modules SET
  hook_text = 'You will test all three generations of relays in the field. Understanding their construction tells you exactly what can fail, what tests apply to each type, and why microprocessor relays require such different commissioning procedures.',
  estimated_read_time = 8,
  video_recommended = false,
  content_sections = '[
    {
      "type": "text",
      "heading": "Generation 1: Electromechanical Relays",
      "body": "The first protective relays (1900s–1970s) were entirely mechanical. An electromagnet attracted a disc, plunger, or armature when current exceeded a threshold.\n\n**Induction disc relay (most common):** An aluminum disc rotates between two electromagnets. Current through the relay windings induces eddy currents in the disc, creating torque proportional to current. The disc rotates at a speed proportional to overcurrent — this creates the inverse-time characteristic.\n\n**Advantages:**\n- Simple, robust, no auxiliary power required\n- Proven decades of reliable service\n- Fail-safe: spring returns disc to open position if power lost\n\n**Disadvantages:**\n- Mechanical wear (bearings, contacts)\n- Difficult to adjust settings\n- Single-function only\n- Slow (cycles, not milliseconds)\n- No self-diagnostics"
    },
    {
      "type": "text",
      "heading": "Generation 2: Solid-State (Static) Relays",
      "body": "In the 1960s–1980s, electronic components (transistors, op-amps, logic ICs) replaced moving parts. The same protective functions were implemented in analog circuitry.\n\n**Advantages over electromechanical:**\n- No moving parts → no mechanical wear\n- Faster operation\n- More precise settings (potentiometers vs. taps)\n- Can implement multiple functions in one unit\n\n**Disadvantages:**\n- Sensitive to transient overvoltages, RFI, and temperature extremes\n- Component aging degrades accuracy over time\n- More complex testing — must use test equipment with precise waveforms\n- Requires auxiliary DC power\n- Still largely single-function"
    },
    {
      "type": "quick_check",
      "question": "Which relay generation provides self-diagnostics, event recording, and oscillography in addition to protection functions?",
      "options": {
        "a": "Electromechanical (induction disc)",
        "b": "Solid-state (static)",
        "c": "Microprocessor (digital/numerical)",
        "d": "All generations provide these features"
      },
      "answer": "c",
      "explanation": "Microprocessor relays contain a full digital computer. They provide self-diagnostics, continuous monitoring, event logs, oscillography (waveform capture), communications, and multiple protection functions simultaneously."
    },
    {
      "type": "text",
      "heading": "Generation 3: Microprocessor (Digital/Numerical) Relays",
      "body": "Modern relays (1980s–present) are digital computers running protection algorithms in software. Input currents and voltages are sampled by analog-to-digital converters (typically 16–64 samples per cycle).\n\n**Advantages:**\n- Multi-function: one relay can replace 5+ electromechanical units\n- Self-diagnostics with alarm outputs\n- Event recording and oscillography\n- Communications (SCADA, IEC 61850, Modbus)\n- Extremely precise settings\n- Easy to change settings via software\n\n**Testing implications for NETA:**\n- Must verify firmware version and settings as-found before any testing\n- Binary inputs/outputs must be tested — not just the protection elements\n- Communications and SCADA integration must be verified\n- Self-test alarms must be tested (inject a simulated failure)\n- Settings must be uploaded from a tested backup file, not re-typed\n\n**The failure mode has shifted:** With microprocessor relays, the relay hardware rarely fails. Problems are almost always settings errors, firmware bugs, or wiring mistakes."
    },
    {
      "type": "quick_check",
      "question": "Which of the following is a known weakness of solid-state (static) relays compared to electromechanical relays?",
      "options": {
        "a": "Slower operation time",
        "b": "Higher mechanical wear on contacts",
        "c": "Susceptibility to transient overvoltages and RFI",
        "d": "Cannot implement inverse-time characteristics"
      },
      "answer": "c",
      "explanation": "Solid-state relays use sensitive electronic components that are vulnerable to transient overvoltages (from switching surges) and radio-frequency interference (RFI). This is why proper shielding, grounding, and surge protection are required when applying them."
    },
    {
      "type": "summary",
      "points": [
        "Electromechanical: induction disc, mechanical wear, no aux power, single function, proven reliable.",
        "Solid-state: no moving parts, faster, sensitive to transients and RFI, component aging.",
        "Microprocessor: multi-function, self-diagnostics, event recording, SCADA communications.",
        "For NETA testing: microprocessor relay commissioning requires settings verification, I/O testing, and comms verification — not just injection testing.",
        "Modern protection failures are almost always settings or wiring errors, not hardware."
      ]
    }
  ]'::jsonb
WHERE id = 'a0000000-0000-4000-a000-000000000007';

-- =============================================================================
-- 9. MODULE 8 — RELAY TESTING FUNDAMENTALS
-- =============================================================================

UPDATE public.roadmap_modules SET
  hook_text = 'The relay is only as good as its last successful test. NETA exists precisely because protection systems that are never tested will eventually fail to operate when needed — or operate when they should not. This module is the core of what you will do every day as a NETA technician.',
  estimated_read_time = 15,
  video_recommended = true,
  content_sections = '[
    {
      "type": "text",
      "heading": "Why We Test Relays",
      "body": "A protective relay is a \"normally idle\" device — it sits monitoring the system 99.9% of the time and is expected to operate correctly in the fraction of a second when a fault occurs. The problem: you cannot know if it will work until it is tested.\n\n**Three reasons relays fail:**\n1. **Settings errors** — wrong settings entered at commissioning or after a settings change\n2. **Mechanical/electrical degradation** — contacts corroded, disc sluggish, component drift\n3. **Wiring errors** — CT connected backwards, wrong terminals, open circuit in trip loop\n\n**Two primary test categories:**\n- **Acceptance (commissioning) testing:** Performed before the relay is put into service. Verifies that settings are correct and the relay operates as designed. Most comprehensive.\n- **Maintenance testing:** Performed periodically while in service. Verifies the relay has not drifted. NETA ATS provides recommended intervals by equipment class."
    },
    {
      "type": "text",
      "heading": "Test Equipment Overview",
      "body": "Modern relay testing uses a **relay test set** — a programmable source of three-phase voltage and current that can simulate any power system condition.\n\nKey test set capabilities:\n- Output: 3-phase voltage (0–150 V AC typical) and 3-phase current (0–50 A per phase typical)\n- Waveform synthesis: pure sine or arbitrary waveforms with harmonics\n- Timer: measures operate time from injection start to contact closure\n- State sequencing: simulate pre-fault, fault, and post-fault conditions\n- Binary I/O: monitor relay output contacts; inject digital inputs\n\n**Secondary injection:** Test set connects to the relay''s CT secondary terminals. The primary is not energized. This is the standard NETA testing method.\n\n**Primary injection:** Actual current is injected through the primary conductor. Used to test the CT, wiring, AND relay as a complete system. Required for final commissioning sign-off on high-stakes installations."
    },
    {
      "type": "quick_check",
      "question": "During secondary injection testing of a time overcurrent relay (51), you inject 300% of pickup current and measure the operate time. The relay trips in 0.8 seconds. Your test plan specifies a tolerance of ±5%. The manufacturer curve value at 300% is 0.75 seconds. Does the relay pass?",
      "options": {
        "a": "Yes — 0.8 seconds is within 5% of 0.75 seconds",
        "b": "No — 0.8 seconds is outside 5% of 0.75 seconds",
        "c": "Cannot determine without knowing the relay model",
        "d": "Timing tests are not performed on time overcurrent relays"
      },
      "answer": "b",
      "explanation": "5% of 0.75 s = 0.0375 s. Acceptable range: 0.7125 to 0.7875 seconds. Measured 0.8 seconds is outside this band — the relay fails. Investigate: disc friction (electromechanical), component drift (solid-state), or settings error (microprocessor)."
    },
    {
      "type": "text",
      "heading": "Pickup Testing",
      "body": "**Pickup** is the minimum input quantity that causes the relay to operate. Testing pickup verifies the relay responds at the correct threshold.\n\n**Pickup test procedure (overcurrent relay):**\n1. Slowly increase injected current from zero\n2. Note the value at which the relay output contact closes (operate)\n3. Slowly decrease current until the contact opens (reset)\n4. Record both operate and reset values\n5. Compare to setting + tolerance (typically ±5–10%)\n\n**Reset ratio:** Reset current / pickup current. Electromechanical relays reset at ~95–97% of pickup. Microprocessor relays often reset at 97–98%.\n\nA relay that picks up too high will miss faults. A relay that picks up too low will trip on load current — nuisance tripping."
    },
    {
      "type": "text",
      "heading": "Timing Tests",
      "body": "After verifying pickup, you test that the relay operates in the correct time at various multiples of pickup current. This verifies the time-current characteristic curve.\n\n**Typical test points for a 51 relay:**\n- 2× pickup\n- 3× pickup\n- 5× pickup\n- 10× pickup\n\nPlot the measured times against the manufacturer''s curve. All points should fall within the tolerance band (typically ±5–7%).\n\n**Instantaneous test (50 element):** Ramp current up rapidly past the instantaneous setting. Verify the relay operates before the time-overcurrent element (within ~1 cycle = 16.7 ms).\n\n**Common timing test failure modes:**\n- Electromechanical: disc drag from dirty bearings or contaminated pivot\n- Solid-state: component aging changing trip threshold\n- Microprocessor: incorrect time-dial setting or wrong curve selected"
    },
    {
      "type": "quick_check",
      "question": "During acceptance testing of a new microprocessor overcurrent relay, the as-found pickup current is 20% above the setting. What is the most likely cause?",
      "options": {
        "a": "Component drift from long-term aging",
        "b": "Settings entry error — the wrong pickup value was programmed",
        "c": "The CT ratio is incorrect",
        "d": "The test set output is not calibrated"
      },
      "answer": "b",
      "explanation": "Microprocessor relays do not drift — their accuracy is determined by the programmed settings. A 20% deviation on a brand-new relay during acceptance testing almost always indicates a settings entry error. Check the as-found settings against the approved relay settings file."
    },
    {
      "type": "video",
      "title": "Relay Pickup and Timing Test Procedure",
      "search_query": "protective relay testing pickup timing overcurrent NETA procedure",
      "why": "Watching an actual test set injection with contact output measurement is the fastest way to understand the test procedure."
    },
    {
      "type": "summary",
      "points": [
        "Acceptance testing: before commissioning, full settings verification + all element tests.",
        "Maintenance testing: periodic; verifies no drift. NETA ATS provides intervals.",
        "Secondary injection: test set connects to CT secondary — standard NETA method.",
        "Pickup test: slowly ramp current to find operate and reset thresholds. Tolerance ±5–10%.",
        "Timing test: verify operate time at 2×, 3×, 5×, 10× pickup. Plot vs manufacturer curve.",
        "Microprocessor relay deviation → settings error. Electromechanical deviation → mechanical wear."
      ]
    }
  ]'::jsonb
WHERE id = 'a0000000-0000-4000-a000-000000000008';

-- =============================================================================
-- 10. MODULE 9 — TEST SHEETS & DOCUMENTATION
-- =============================================================================

UPDATE public.roadmap_modules SET
  hook_text = 'Documentation is not paperwork — it is evidence. In a court case, a regulatory audit, or an incident investigation, your test sheet IS your testimony. NETA technicians who cannot document their work professionally are a liability to their employer.',
  estimated_read_time = 9,
  video_recommended = false,
  content_sections = '[
    {
      "type": "text",
      "heading": "Why Documentation Matters",
      "body": "Electrical testing documentation serves several critical purposes:\n\n1. **Legal protection:** If equipment later fails and causes injury, your test records prove that equipment was properly tested and in correct condition when you left the site.\n\n2. **As-found condition:** Documents the state of the equipment BEFORE any adjustments. Critical for identifying pre-existing problems and for insurance/warranty claims.\n\n3. **As-left condition:** Documents the final settings and test results after testing. This is the reference baseline for all future maintenance testing.\n\n4. **Settings verification:** The test sheet captures the approved settings vs. the as-found settings vs. the as-left settings — three separate data points.\n\n5. **Regulatory compliance:** NETA, NFPA 70E, and many local codes require documented testing programs for electrical equipment."
    },
    {
      "type": "text",
      "heading": "NETA Test Sheet Structure",
      "body": "A proper NETA test sheet includes:\n\n**Header information:**\n- Equipment identification (tag number, serial number, manufacturer, model)\n- Location (substation, switchgear lineup, bay/cubicle number)\n- Voltage/kVA/MVA rating\n- Date of test, technician name(s), certifications\n- Work order number / contract number\n\n**As-Found section:**\n- All settings read from the relay BEFORE any changes\n- All test results obtained in the as-found state\n- Notation of any discrepancies from the approved settings\n\n**As-Left section:**\n- All settings after adjustment to approved values\n- All test results after any corrections\n- Pass/fail determination against acceptance criteria\n\n**Test equipment used:**\n- Manufacturer, model, serial number, last calibration date\n- All test equipment must have current calibration certificates"
    },
    {
      "type": "quick_check",
      "question": "A NETA technician tests a relay and finds the pickup setting is incorrect. She corrects it to match the approved settings sheet, then re-tests. She only documents the as-left (corrected) results. What critical information is missing?",
      "options": {
        "a": "Nothing — only the as-left results matter for compliance",
        "b": "The as-found (before correction) settings and test results",
        "c": "The equipment serial number",
        "d": "The test equipment calibration date"
      },
      "answer": "b",
      "explanation": "The as-found data is critical. It documents that a discrepancy existed — which may indicate a commissioning error, unauthorized settings change, or deliberate tampering. Without as-found data, you cannot prove the equipment was in an incorrect state when you arrived. This also affects insurance claims and incident investigations."
    },
    {
      "type": "text",
      "heading": "Calibration and Traceability",
      "body": "All test equipment used for NETA testing must be calibrated and traceable to NIST (National Institute of Standards and Technology) standards.\n\n**Calibration interval:** Typically annual, unless the manufacturer or customer specifies otherwise.\n\n**What calibration means:** A calibration service measures the test equipment output against a known standard, documents any deviation, adjusts the equipment if needed, and issues a certificate stating the equipment''s accuracy.\n\n**Traceability chain:** Your test set → calibration lab''s reference standard → NIST primary standard. Each link in the chain has a documented uncertainty.\n\n**If your test equipment''s calibration has expired:** You cannot legally certify that your test results are accurate. The test must be repeated with calibrated equipment. This is non-negotiable on NETA projects."
    },
    {
      "type": "quick_check",
      "question": "During a relay test, a technician discovers their current injection test set''s calibration certificate expired 2 months ago. What is the correct course of action?",
      "options": {
        "a": "Continue testing — calibration intervals are only a guideline",
        "b": "Note the expiration on the test sheet and continue",
        "c": "Stop testing with that equipment; obtain calibrated equipment before continuing",
        "d": "Apply a 5% correction factor to all measurements"
      },
      "answer": "c",
      "explanation": "Testing with out-of-calibration equipment means you cannot certify the accuracy of your results. Continuing produces legally unacceptable test records. Stop, obtain calibrated equipment, and repeat any tests performed with the expired equipment."
    },
    {
      "type": "summary",
      "points": [
        "Always document as-found settings and results BEFORE making any adjustments.",
        "As-left records are the baseline for all future maintenance testing on that device.",
        "All test equipment must have current (non-expired) NIST-traceable calibration certificates.",
        "Test sheet header must include: equipment ID, location, date, technician name/certification.",
        "If calibration has expired, stop testing — results are not certifiable."
      ]
    }
  ]'::jsonb
WHERE id = 'a0000000-0000-4000-a000-000000000009';
