-- NETA Prep: Session 8 — Add question_type column + fill domain gaps to 100 exam_simulation
--
-- Audit summary (pre-migration, all level=3):
--   safety-standards:      4 questions  (target 13 — need  9 more)
--   fundamentals-theory:  17 questions  (target 23 — need  6 more)
--   component-testing:    79 questions  (target 47 — keep best 47)
--   systems-commissioning: 0 questions  (target 17 — need 17 more)
--   Total:               100 questions
--
-- After migration:
--   exam_simulation pool: 13 + 23 + 47 + 17 = 100 questions exactly
--   Remaining 32 component-testing questions tagged 'practice'
--
-- Component-testing exam_simulation distribution (47 total):
--   protective-relays:    15   current-transformers:  5
--   circuit-breakers:      5   cables-conductors:     5
--   transformers:          5   ev-chargers:           3
--   sf6-gas-equipment:     2   batteries-dc:          2
--   grounding-electrodes:  2   motor-protection:      2
--   surge-arresters:       1

-- =============================================================================
-- 1. SCHEMA CHANGES
-- =============================================================================

ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS question_type text
    CHECK (question_type IN ('exam_simulation', 'practice')),
  ADD COLUMN IF NOT EXISTS parent_question_id uuid
    REFERENCES public.questions(id);

CREATE INDEX IF NOT EXISTS idx_questions_type_level
  ON public.questions (question_type, level);

-- =============================================================================
-- 2. TAG EXISTING QUESTIONS
-- =============================================================================

-- Start all level-3 as 'practice', then promote the selected exam_simulation set
UPDATE public.questions
SET question_type = 'practice'
WHERE level = 3;

-- ── safety-standards: all 4 existing → exam_simulation ───────────────────────
UPDATE public.questions
SET question_type = 'exam_simulation'
WHERE level = 3 AND domain = 'safety-standards';

-- ── fundamentals-theory: all 17 existing → exam_simulation ───────────────────
UPDATE public.questions
SET question_type = 'exam_simulation'
WHERE level = 3 AND domain = 'fundamentals-theory';

-- ── component-testing: select best 47 via per-subdomain ranked promotion ──────
-- protective-relays: top 15 (of 21)
UPDATE public.questions
SET question_type = 'exam_simulation'
WHERE id IN (
  SELECT id FROM public.questions
  WHERE level = 3 AND domain = 'component-testing' AND subdomain = 'protective-relays'
  ORDER BY frequency_tier ASC, difficulty ASC, created_at ASC
  LIMIT 15
);
-- current-transformers: top 5 (of 9)
UPDATE public.questions
SET question_type = 'exam_simulation'
WHERE id IN (
  SELECT id FROM public.questions
  WHERE level = 3 AND domain = 'component-testing' AND subdomain = 'current-transformers'
  ORDER BY frequency_tier ASC, difficulty ASC, created_at ASC
  LIMIT 5
);
-- circuit-breakers: top 5 (of 7)
UPDATE public.questions
SET question_type = 'exam_simulation'
WHERE id IN (
  SELECT id FROM public.questions
  WHERE level = 3 AND domain = 'component-testing' AND subdomain = 'circuit-breakers'
  ORDER BY frequency_tier ASC, difficulty ASC, created_at ASC
  LIMIT 5
);
-- cables-conductors: top 5 (of 7)
UPDATE public.questions
SET question_type = 'exam_simulation'
WHERE id IN (
  SELECT id FROM public.questions
  WHERE level = 3 AND domain = 'component-testing' AND subdomain = 'cables-conductors'
  ORDER BY frequency_tier ASC, difficulty ASC, created_at ASC
  LIMIT 5
);
-- transformers: top 5 (of 13)
UPDATE public.questions
SET question_type = 'exam_simulation'
WHERE id IN (
  SELECT id FROM public.questions
  WHERE level = 3 AND domain = 'component-testing' AND subdomain = 'transformers'
  ORDER BY frequency_tier ASC, difficulty ASC, created_at ASC
  LIMIT 5
);
-- ev-chargers: top 3 (of 5)
UPDATE public.questions
SET question_type = 'exam_simulation'
WHERE id IN (
  SELECT id FROM public.questions
  WHERE level = 3 AND domain = 'component-testing' AND subdomain = 'ev-chargers'
  ORDER BY frequency_tier ASC, difficulty ASC, created_at ASC
  LIMIT 3
);
-- sf6-gas-equipment: top 2 (of 3)
UPDATE public.questions
SET question_type = 'exam_simulation'
WHERE id IN (
  SELECT id FROM public.questions
  WHERE level = 3 AND domain = 'component-testing' AND subdomain = 'sf6-gas-equipment'
  ORDER BY frequency_tier ASC, difficulty ASC, created_at ASC
  LIMIT 2
);
-- batteries-dc: top 2 (of 4)
UPDATE public.questions
SET question_type = 'exam_simulation'
WHERE id IN (
  SELECT id FROM public.questions
  WHERE level = 3 AND domain = 'component-testing' AND subdomain = 'batteries-dc'
  ORDER BY frequency_tier ASC, difficulty ASC, created_at ASC
  LIMIT 2
);
-- grounding-electrodes: top 2 (of 4)
UPDATE public.questions
SET question_type = 'exam_simulation'
WHERE id IN (
  SELECT id FROM public.questions
  WHERE level = 3 AND domain = 'component-testing' AND subdomain = 'grounding-electrodes'
  ORDER BY frequency_tier ASC, difficulty ASC, created_at ASC
  LIMIT 2
);
-- motor-protection: top 2 (of 4)
UPDATE public.questions
SET question_type = 'exam_simulation'
WHERE id IN (
  SELECT id FROM public.questions
  WHERE level = 3 AND domain = 'component-testing' AND subdomain = 'motor-protection'
  ORDER BY frequency_tier ASC, difficulty ASC, created_at ASC
  LIMIT 2
);
-- surge-arresters: top 1 (of 2)
UPDATE public.questions
SET question_type = 'exam_simulation'
WHERE id IN (
  SELECT id FROM public.questions
  WHERE level = 3 AND domain = 'component-testing' AND subdomain = 'surge-arresters'
  ORDER BY frequency_tier ASC, difficulty ASC, created_at ASC
  LIMIT 1
);

-- =============================================================================
-- 3. INSERT NEW QUESTIONS
-- =============================================================================
-- All new questions tagged question_type='exam_simulation', source='generated'
-- Covers: 9 safety + 6 fundamentals + 17 systems = 32 questions

INSERT INTO public.questions
  (domain, subdomain, level, concept_type, difficulty, frequency_tier,
   question, options, correct_answer, explanation, trap_pattern, source, question_type)
VALUES

-- =============================================================================
-- SAFETY STANDARDS — 9 new questions
-- Fills gap from 4 → 13 (13% of Level 3 exam)
-- =============================================================================

('safety-standards', 'risk-assessment', 3, 'conceptual', 2, 1,
 'According to NFPA 70E, which action represents the HIGHEST priority in the hierarchy of risk controls for arc flash hazards?',
 '{"a":"Select arc-rated PPE rated to the incident energy level","b":"Establish an electrically safe work condition by de-energizing and verifying zero energy","c":"Install engineering controls such as remote racking devices","d":"Post warning labels and implement administrative controls"}',
 'b',
 'NFPA 70E''s hierarchy of risk controls places hazard elimination at the top. Establishing an electrically safe work condition de-energizes the circuit and verifies zero energy state — this eliminates the arc flash hazard entirely. PPE is the last resort, not the first choice.',
 'PPE is the most visible protection but lowest on the hierarchy. Elimination (de-energizing) is always preferred.',
 'generated', 'exam_simulation'),

('safety-standards', 'electrically-safe-work-condition', 3, 'conceptual', 2, 1,
 'Per NFPA 70E, at what point in establishing an electrically safe work condition is absence of voltage verified with a meter?',
 '{"a":"Before opening any disconnecting means, to confirm the circuit can be safely isolated","b":"Immediately after opening the disconnecting means, before applying lockout devices","c":"After applying lockout/tagout devices and releasing stored energy, as the final step before work begins","d":"After completing the work, immediately before re-energization"}',
 'c',
 'NFPA 70E 120.5 sequence: (1) identify energy sources, (2) open disconnecting means, (3) release/restrain stored energy, (4) apply LOTO devices, (5) verify absence of voltage at the work location. Verification is the LAST step before touching — not the first.',
 NULL,
 'generated', 'exam_simulation'),

('safety-standards', 'codes-standards', 3, 'conceptual', 2, 1,
 'A "qualified person" for electrical work, as defined by NFPA 70E, must be someone who:',
 '{"a":"Holds a valid state electrical contractor license","b":"Has completed OSHA 30-hour general industry safety training","c":"Is trained to recognize and avoid electrical hazards and has demonstrated knowledge of safety-related work practices","d":"Has a minimum of five years of verified electrical work experience"}',
 'c',
 'NFPA 70E defines a qualified person by training and demonstrated knowledge of electrical hazards and safe work practices — not by licensing, specific training-hour counts, or years of experience. The employer determines and documents qualification.',
 'Qualification is skill-based, not credential-based. A licensed electrician is not automatically a qualified person under NFPA 70E.',
 'generated', 'exam_simulation'),

('safety-standards', 'incident-energy-analysis', 3, 'conceptual', 3, 1,
 'Which method for determining arc flash PPE provides the most accurate protection for a specific piece of equipment?',
 '{"a":"The PPE category method using NFPA 70E Table 130.7(C)(15)(a)","b":"Incident energy analysis using actual system fault current, clearing time, and working distance","c":"Both methods provide equivalent levels of protection","d":"Only the PPE category method is permitted by NFPA 70E"}',
 'b',
 'Incident energy analysis uses actual system parameters — available fault current, protective device clearing time, and working distance — to calculate cal/cm² at the worker''s position. The PPE category method uses conservative table values based on assumed conditions and may require higher-rated PPE than necessary. Incident energy analysis is more precise.',
 NULL,
 'generated', 'exam_simulation'),

('safety-standards', 'electrically-safe-work-condition', 3, 'conceptual', 3, 1,
 'Under NFPA 70E, an employer may authorize work on energized electrical equipment ONLY when:',
 '{"a":"The task takes less than 15 minutes to complete","b":"A licensed electrician performs all energized work","c":"De-energizing creates a greater hazard or is infeasible due to continuous process requirements or equipment design","d":"The equipment is rated below 480V"}',
 'c',
 'NFPA 70E 130.2 requires that energized work be justified — de-energizing must create a greater hazard (e.g., shutting off life-safety equipment) or be infeasible. Duration, voltage level, and worker qualification alone do not justify energized work. An energized electrical work permit is then required.',
 'Low voltage and short task duration do NOT justify energized work under NFPA 70E.',
 'generated', 'exam_simulation'),

('safety-standards', 'ppe', 3, 'table-lookup', 2, 1,
 'PPE Category 4 for arc flash protection requires a minimum arc rating of:',
 '{"a":"25 cal/cm²","b":"40 cal/cm²","c":"70 cal/cm²","d":"100 cal/cm²"}',
 'b',
 'NFPA 70E PPE Categories: Category 1 = 4 cal/cm² minimum, Category 2 = 8 cal/cm² minimum, Category 3 = 25 cal/cm² minimum, Category 4 = 40 cal/cm² minimum. These are MINIMUM arc ratings — higher ratings are permissible.',
 NULL,
 'generated', 'exam_simulation'),

('safety-standards', 'isolation-grounding', 3, 'conceptual', 3, 1,
 'After opening and locking out a variable frequency drive''s main disconnect, what additional step is required before touching internal drive components?',
 '{"a":"Confirm the connected motor shaft is not rotating","b":"Apply a personal lock to the drive cabinet door","c":"Discharge stored energy in the DC bus capacitors and verify zero energy state with a meter","d":"Notify the motor control center attendant that the drive is isolated"}',
 'c',
 'VFDs contain large DC bus filter capacitors that can maintain lethal DC voltage for minutes after the main disconnect opens. LOTO isolation is necessary but not sufficient. Stored energy must be discharged (or the manufacturer''s discharge time must elapse) and zero energy verified with an appropriate meter before touching any internal components.',
 'LOTO alone is insufficient for VFDs. Capacitor discharge and energy verification are additional required steps.',
 'generated', 'exam_simulation'),

('safety-standards', 'approach-boundaries', 3, 'conceptual', 2, 1,
 'Which OSHA standard specifically governs the control of hazardous energy (lockout/tagout) for general industry?',
 '{"a":"29 CFR 1910.333 — Electrical Safety-Related Work Practices","b":"29 CFR 1910.147 — The Control of Hazardous Energy (Lockout/Tagout)","c":"29 CFR 1910.137 — Electrical Protective Equipment","d":"NFPA 70E Article 130 — Work Involving Electrical Hazards"}',
 'b',
 'OSHA 29 CFR 1910.147 is the primary OSHA standard for lockout/tagout procedures in general industry. 1910.333 covers energized electrical work practices. 1910.137 covers electrical PPE. NFPA 70E is a consensus standard adopted by reference, not an OSHA regulation.',
 'Students confuse 1910.333 (energized work) with 1910.147 (LOTO). They are separate standards covering different activities.',
 'generated', 'exam_simulation'),

('safety-standards', 'confined-space', 3, 'conceptual', 3, 1,
 'An underground transformer vault containing energized 15kV equipment is classified as a permit-required confined space (PRCS) because:',
 '{"a":"It is located below grade and requires a ladder for entry","b":"The space has limited means of entry or exit and contains a recognized serious physical hazard","c":"All spaces containing equipment rated above 600V are automatically PRCS by OSHA definition","d":"The vault dimensions are less than 50 cubic feet"}',
 'b',
 'OSHA 1910.146 defines a PRCS as a confined space with limited means of entry or exit AND a known or potential serious physical hazard. Energized 15kV equipment is a recognized serious hazard. Being below grade alone does not make a space permit-required — the hazard recognition is the defining criterion.',
 'Below-grade location and ladder entry alone are not sufficient for PRCS classification. A recognized serious hazard must be present.',
 'generated', 'exam_simulation'),

-- =============================================================================
-- FUNDAMENTALS & THEORY — 6 new questions
-- Fills gap from 17 → 23 (23% of Level 3 exam)
-- =============================================================================

('fundamentals-theory', 'resistance-testing', 3, 'conceptual', 3, 1,
 'If an insulation resistance (IR) test is performed at 10°C instead of the standard 20°C reference temperature, the measured IR value will be:',
 '{"a":"Lower than at 20°C — cold insulation has less resistance","b":"Higher than at 20°C — insulation resistance increases as temperature decreases","c":"Unchanged — temperature does not significantly affect IR","d":"Exactly half the value at 20°C"}',
 'b',
 'Insulation resistance approximately doubles for every 10°C decrease in temperature (resistivity increases as temperature drops). A reading at 10°C will appear better than the same insulation tested at 20°C. Results must be temperature-corrected before comparing to tables or baselines.',
 'Cold temperature artificially inflates IR readings — students expect warmer = better, but the opposite is true for IR.',
 'generated', 'exam_simulation'),

('fundamentals-theory', 'resistance-testing', 3, 'calculation', 3, 1,
 'A dielectric absorption ratio (DAR) test yields a 30-second reading of 800 MΩ and a 60-second reading of 1,200 MΩ. What does this result indicate?',
 '{"a":"DAR = 1.5 — good insulation; absorption is continuing normally","b":"DAR = 0.67 — poor insulation; result fails the minimum threshold","c":"DAR = 1.5 — moisture present; insulation must be replaced","d":"The result is inconclusive — a full 10-minute PI test is required"}',
 'a',
 'DAR = R₆₀ / R₃₀ = 1,200 / 800 = 1.5. A DAR ≥ 1.4 indicates good, dry insulation where polarization currents are diminishing normally over time. A DAR near 1.0 indicates poor, wet, or contaminated insulation. DAR is a shorter alternative to the PI test (R₁₀min / R₁min).',
 'Students invert the ratio (800/1200 = 0.67) or forget which reading goes in the numerator.',
 'generated', 'exam_simulation'),

('fundamentals-theory', 'resistance-testing', 3, 'table-lookup', 2, 1,
 'Per NETA ATS Table 100.1, what megohmmeter test voltage should be used for equipment rated 5,001V to 15,000V?',
 '{"a":"1,000V DC","b":"2,500V DC","c":"5,000V DC","d":"10,000V DC"}',
 'c',
 'NETA ATS Table 100.1 test voltages by equipment rated voltage: up to 250V → 500V DC; 251–600V → 1,000V DC; 601–5,000V → 2,500V DC; 5,001–15,000V → 5,000V DC; above 15kV → 10,000V DC. Using too low a test voltage on high-voltage equipment may not reveal existing insulation defects.',
 NULL,
 'generated', 'exam_simulation'),

('fundamentals-theory', 'resistance-testing', 3, 'conceptual', 2, 1,
 'The polarization index (PI) is defined as the ratio of:',
 '{"a":"The 1-minute IR reading divided by the 10-minute IR reading","b":"The 10-minute IR reading divided by the 1-minute IR reading","c":"The 30-second reading divided by the 60-second reading","d":"The IR reading at operating voltage divided by the IR at test voltage"}',
 'b',
 'PI = IR₁₀min / IR₁min. Good insulation: PI ≥ 2.0. Questionable: 1.0–2.0. Poor/wet: < 1.0. Healthy insulation shows increasing IR over time as polarization currents diminish — so the ratio should be ≥ 2.0. Inverting the ratio (1/10-min) would give values less than 1.0 for good insulation, which seems wrong.',
 'Students invert the ratio: 1-min/10-min gives < 1 for good insulation, which appears to indicate failure.',
 'generated', 'exam_simulation'),

('fundamentals-theory', 'ac-dc-circuits', 3, 'calculation', 3, 1,
 'A series circuit contains R = 30 Ω and XL = 40 Ω. The total impedance is:',
 '{"a":"70 Ω (arithmetic sum)","b":"50 Ω (phasor sum)","c":"35 Ω (geometric mean)","d":"10 Ω (difference)"}',
 'b',
 'Z = √(R² + XL²) = √(30² + 40²) = √(900 + 1,600) = √2,500 = 50 Ω. Resistance and reactance are 90° out of phase — use the Pythagorean theorem for phasor addition, not arithmetic addition. The 3-4-5 right triangle (×10) is a classic exam calculation.',
 'Students add R + XL = 70 Ω. Impedance is phasor addition, not arithmetic.',
 'generated', 'exam_simulation'),

('fundamentals-theory', 'fundamentals-electricity', 3, 'conceptual', 2, 1,
 'In a large AC conductor operating at power frequency, the skin effect causes current to concentrate:',
 '{"a":"At the center of the conductor, where magnetic flux density is highest","b":"At the outer surface of the conductor, increasing effective AC resistance","c":"Uniformly throughout the conductor cross-section","d":"At the insulation boundary, causing dielectric heating"}',
 'b',
 'Skin effect causes AC current to flow predominantly near the outer surface (skin) of a conductor. At 60 Hz, skin depth in copper is approximately 8.5 mm. For large conductors, this significantly increases effective AC resistance compared to DC resistance. It is the reason large bus conductors use hollow or stranded designs.',
 NULL,
 'generated', 'exam_simulation'),

-- =============================================================================
-- SYSTEMS & COMMISSIONING — 17 new questions
-- Fills gap from 0 → 17 (17% of Level 3 exam)
-- =============================================================================

('systems-commissioning', 'commissioning-process', 3, 'conceptual', 2, 1,
 'NETA''s Electrical Commissioning Specification (ECS) defines the commissioning process as which sequence of phases?',
 '{"a":"Installation → Energization → Load testing → Final acceptance","b":"Design review → Pre-installation → Installation → Pre-functional → Functional testing → Acceptance","c":"Factory acceptance test → Site delivery → Wiring → Energization → Documentation","d":"Inspection → Testing → Startup → Punch list"}',
 'b',
 'NETA ECS defines six commissioning phases: (1) design review, (2) pre-installation inspection, (3) installation inspection, (4) pre-functional testing, (5) functional testing, and (6) acceptance. Each phase requires documentation before the next phase begins. This structured sequence ensures defects are caught early when correction is least costly.',
 NULL,
 'generated', 'exam_simulation'),

('systems-commissioning', 'commissioning-process', 3, 'conceptual', 2, 1,
 'What distinguishes NETA acceptance testing (ATS) from NETA maintenance testing (MTS)?',
 '{"a":"Acceptance testing uses higher test voltages than maintenance testing for all equipment categories","b":"Acceptance testing establishes baseline data on new or recently rebuilt equipment; maintenance testing compares results to that baseline to detect deterioration","c":"Maintenance testing is performed by the utility company; acceptance testing is performed by the electrical contractor","d":"There is no functional difference — both follow identical test procedures and acceptance criteria"}',
 'b',
 'NETA ATS acceptance testing establishes the initial condition baseline for new or recently installed equipment. NETA MTS maintenance testing uses those baselines for trend comparison to detect deterioration over time. Using ATS test voltages (higher) on service-aged equipment during maintenance can cause failures that would not occur in service — MTS uses reduced voltages for aged equipment.',
 'Using ATS hi-pot voltages on aged equipment during maintenance can fail insulation that was acceptable in service.',
 'generated', 'exam_simulation'),

('systems-commissioning', 'functional-testing', 3, 'conceptual', 2, 1,
 'Functional testing during electrical commissioning is distinct from component acceptance testing because functional testing verifies:',
 '{"a":"That each individual component meets its nameplate rating under standalone conditions","b":"That the complete integrated system — protection schemes, control interlocks, and SCADA signals — operates correctly as a coordinated whole","c":"That cable insulation resistance meets NETA ATS minimums on all feeders","d":"That all relay settings have been entered correctly into each individual relay"}',
 'b',
 'Functional testing verifies integrated system behavior: relay schemes trip the correct breakers, interlocks prevent incorrect switching sequences, SCADA signals are mapped correctly, and automatic functions (reclosing, load transfer) operate as designed. Individual component acceptance tests verify parts in isolation — functional tests verify the assembled system.',
 NULL,
 'generated', 'exam_simulation'),

('systems-commissioning', 'scada-dcs', 3, 'conceptual', 2, 1,
 'The primary function of a SCADA (Supervisory Control and Data Acquisition) system in an electrical substation is to:',
 '{"a":"Automatically isolate faulted circuits and reclose breakers after a fault clears","b":"Calculate and apply protective relay coordination settings across the network","c":"Remotely monitor equipment status, collect operational data, and allow remote control of switching devices","d":"Provide automatic power factor correction by switching capacitor banks"}',
 'c',
 'SCADA provides centralized monitoring and control of geographically dispersed equipment. Operators can view equipment status (open/closed, alarms), collect historical trend data, and remotely operate breakers and switches from a control room. Fault protection is performed by local protective relays, not by SCADA.',
 'SCADA monitors and supervises — it does not provide primary fault protection. Protective relays do that.',
 'generated', 'exam_simulation'),

('systems-commissioning', 'scada-dcs', 3, 'conceptual', 3, 1,
 'A distributed control system (DCS) differs from a SCADA system primarily because a DCS:',
 '{"a":"Uses wireless communication while SCADA requires dedicated fiber optic cables","b":"Places control intelligence locally at each process unit for tightly coupled continuous processes; SCADA supervises geographically dispersed equipment from a central location","c":"Cannot operate field devices remotely — operators must be present at each local panel","d":"Is limited to generation facilities and cannot be used in transmission substations"}',
 'b',
 'DCS distributes control processors to each process unit (chemical reactors, turbine control). This suits tightly coupled continuous processes where fast local response is critical. SCADA uses a central host computer to supervise field equipment spread across large geographic areas (transmission grid, pipeline, distribution substations). Response time requirements and geographic scope distinguish them.',
 NULL,
 'generated', 'exam_simulation'),

('systems-commissioning', 'power-quality-monitoring', 3, 'conceptual', 2, 1,
 'Total Harmonic Distortion (THD) of a voltage waveform is defined as:',
 '{"a":"The magnitude of the largest harmonic component divided by the fundamental frequency magnitude","b":"The arithmetic sum of all harmonic component amplitudes as a percentage of the fundamental","c":"The RMS value of all harmonic components divided by the RMS value of the fundamental, expressed as a percentage","d":"The peak instantaneous voltage distortion measured over a 10-minute window"}',
 'c',
 'THD(%) = [√(V₂² + V₃² + V₅² + ...)] / V₁ × 100. It is the RMS of all harmonic components (combined via root-sum-square) divided by the fundamental RMS. IEEE 519 establishes THD limits at the point of common coupling based on the short-circuit ratio at the facility.',
 'THD uses RMS addition (root-sum-square), not arithmetic sum of harmonics.',
 'generated', 'exam_simulation'),

('systems-commissioning', 'power-quality-monitoring', 3, 'conceptual', 2, 1,
 'Per IEEE/IEC power quality definitions, a voltage sag is:',
 '{"a":"A sustained reduction in RMS voltage below 90% of nominal lasting more than 1 minute","b":"A momentary reduction of RMS voltage to between 10% and 90% of nominal, lasting from 0.5 cycles to 1 minute","c":"A momentary increase in RMS voltage to between 110% and 180% of nominal","d":"A complete loss of voltage below 10% of nominal for any duration"}',
 'b',
 'IEEE 1159 definitions: Voltage sag = RMS drops to 10–90% of nominal, duration 0.5 cycles to 1 minute. Voltage swell = RMS rises to 110–180% nominal, same duration. Voltage interruption = RMS drops below 10% nominal. Sustained undervoltage (below 90% for > 1 minute) is called undervoltage, not a sag.',
 'Voltage sag is momentary (0.5 cycles to 1 min). Sustained low voltage is undervoltage — different term, different cause.',
 'generated', 'exam_simulation'),

('systems-commissioning', 'power-quality-monitoring', 3, 'conceptual', 2, 1,
 'Where should a power quality monitor be placed to assess whether harmonic distortion is originating from the utility supply versus being generated by facility equipment?',
 '{"a":"At each nonlinear load terminal to measure individual equipment harmonic injection","b":"At the point of common coupling (PCC) with the utility service entrance","c":"At the secondary of the service entrance transformer only","d":"At the facility main distribution board, downstream of all loads"}',
 'b',
 'The point of common coupling (PCC) is the boundary between the utility system and the customer facility. Monitoring at the PCC captures both utility-side disturbances (traveling inward) and the facility''s aggregate harmonic injection into the grid (traveling outward). IEEE 519 evaluates harmonic compliance at the PCC.',
 NULL,
 'generated', 'exam_simulation'),

('systems-commissioning', 'troubleshooting', 3, 'conceptual', 3, 1,
 'In a medium-voltage resistance-grounded system, a single line-to-ground fault occurs. What is the most likely system response?',
 '{"a":"Immediate overcurrent relay operation and breaker trip on the faulted phase","b":"Phase-to-phase voltage collapses to near zero on the faulted phase","c":"A ground fault alarm activates but the system continues to operate — the grounding resistor limits fault current","d":"The fuse on the faulted phase blows, isolating the fault automatically"}',
 'c',
 'Resistance-grounded systems limit single line-to-ground fault current to a low value (typically 1–10 A) through the neutral grounding resistor. The system can continue operating with the fault present while maintenance personnel locate and isolate it. The unfaulted phase voltages rise to approximately line-to-line voltage, and ground fault alarms activate.',
 'Students assume all faults cause immediate trips. Resistance-grounded systems allow continued operation on a ground fault — this is a design advantage for continuous-process industries.',
 'generated', 'exam_simulation'),

('systems-commissioning', 'troubleshooting', 3, 'conceptual', 3, 1,
 'During commissioning of a medium-voltage switchgear lineup, carbonized tracking is found across the internal insulation barriers between bus bars. The MOST likely cause is:',
 '{"a":"An arc flash incident during a previous switching operation or fault","b":"Prolonged moisture condensation combined with contamination causing leakage current","c":"Excessive tightening torque on bus bar bolted connections during installation","d":"Normal surface aging of the polymer insulation material over the service life"}',
 'b',
 'Surface tracking develops when moisture and contaminants (dust, salt, oil) form a conductive film on insulation surfaces. Combined with the electric field gradient, leakage current flows through the film and progressively carbonizes a conductive path. In switchgear, tracking is most common at areas where moisture can condense and contamination can accumulate. Cleaning and replacing tracked insulation is required.',
 NULL,
 'generated', 'exam_simulation'),

('systems-commissioning', 'sectionalizers-reclosers', 3, 'conceptual', 2, 1,
 'A sectionalizer differs from a recloser in that a sectionalizer:',
 '{"a":"Can interrupt fault current faster than a recloser on first operation","b":"Operates automatically during a de-energized interval by counting upstream fault interruptions, then opens to isolate the faulted section","c":"Provides inverse time-overcurrent coordination without requiring a source-side recloser","d":"Can reclose automatically to restore service after a temporary fault"}',
 'b',
 'A sectionalizer CANNOT interrupt fault current on its own — it is not a fault interrupting device. It counts the number of fault-current interruptions performed by an upstream recloser. After reaching a preset count (typically 2 or 3), it opens during a dead interval (while the recloser is open) to isolate the faulted section. The recloser then recloses and the healthy section is restored.',
 'Sectionalizer vs recloser: the recloser interrupts fault current — the sectionalizer does not. The sectionalizer opens only in a de-energized interval.',
 'generated', 'exam_simulation'),

('systems-commissioning', 'commissioning-process', 3, 'conceptual', 3, 1,
 'Before energizing a new electrical installation for the first time, which item is NOT a required pre-energization check per NETA ECS?',
 '{"a":"Verify correct phase rotation and phase sequence at all critical termination points","b":"Confirm all protective relay settings are entered and trip circuit continuity is verified","c":"Perform a continuous full-load thermal stability test lasting a minimum of four hours","d":"Physically confirm all personnel are clear and all tools and foreign materials are removed from the equipment"}',
 'c',
 'Full-load thermal testing requires the equipment to be energized and loaded — it cannot be a pre-energization check. Required pre-energization checks include: phase rotation verification, relay settings entry and trip circuit continuity, physical inspection completion, personnel and tools clear, conductor termination torque verification, and removal of all grounding switches or temporary grounds.',
 'Full-load thermal testing happens AFTER energization, not before.',
 'generated', 'exam_simulation'),

('systems-commissioning', 'commissioning-process', 3, 'conceptual', 2, 1,
 'Why is phase rotation verification performed during electrical commissioning of motors and generators?',
 '{"a":"To confirm that all three phases carry equal current under load","b":"To ensure correct A-B-C phase sequence reaches the equipment so motors rotate in the intended direction","c":"To verify transformer winding impedance matches the design coordination study","d":"To confirm protective relay phase elements are correctly wired to the correct phase CTs"}',
 'b',
 'Incorrect phase rotation (A-B-C vs A-C-B) causes three-phase motors to rotate in reverse, potentially damaging connected mechanical equipment, process machinery, or pumps. Phase rotation meters or oscilloscopes verify sequence during initial commissioning before energizing motor loads. Phase rotation is also verified after any maintenance that involves removing and reconnecting power cables.',
 NULL,
 'generated', 'exam_simulation'),

('systems-commissioning', 'neta-ecs', 3, 'conceptual', 2, 1,
 'The NETA Electrical Commissioning Specification (ECS) primarily serves to:',
 '{"a":"Define maintenance testing intervals for in-service electrical equipment","b":"Specify acceptance test voltage values and minimum resistance thresholds for new equipment","c":"Standardize the commissioning process to ensure electrical systems operate safely and as designed before occupancy or handover","d":"Establish licensing requirements for electrical commissioning engineers"}',
 'c',
 'NETA ECS provides a standardized process for commissioning electrical systems from design review through final acceptance. It ensures all components and integrated systems are inspected, tested, and verified to meet design intent before the owner takes possession. NETA ATS covers individual component acceptance testing; NETA MTS covers in-service maintenance testing.',
 'ECS = commissioning process. ATS = acceptance test values. MTS = maintenance test values. Three separate NETA publications.',
 'generated', 'exam_simulation'),

('systems-commissioning', 'one-line-diagrams', 3, 'conceptual', 2, 1,
 'On a power system one-line (single-line) diagram, the reason a transformer''s winding configuration (e.g., delta-wye vs delta-delta) is shown is primarily to:',
 '{"a":"Indicate the transformer''s kVA capacity and impedance percentage","b":"Show the 30° phase shift between primary and secondary voltages introduced by a delta-wye configuration","c":"Identify which winding connects to the utility versus the load side","d":"Indicate whether the transformer uses forced-air or oil cooling"}',
 'b',
 'A delta-wye transformer introduces a 30° phase shift between primary and secondary voltage phasors. This shift affects: CT wiring in differential relay schemes (must be compensated), paralleling of transformers (delta-delta and delta-wye units cannot be paralleled without a phase-shifting transformer), and system fault analysis. Delta-delta and wye-wye configurations have no phase shift.',
 NULL,
 'generated', 'exam_simulation'),

('systems-commissioning', 'commissioning-process', 3, 'conceptual', 2, 1,
 'The purpose of a load flow (power flow) study differs from a short circuit study in that a load flow study determines:',
 '{"a":"Protective relay coordination settings for each bus and feeder","b":"Available fault MVA at each bus for equipment interrupting rating verification","c":"Steady-state bus voltages, line current magnitudes, and real and reactive power flows under normal operating conditions","d":"Both studies provide identical information — they are different names for the same analysis"}',
 'c',
 'A load flow study solves for steady-state voltages (magnitude and angle), line loadings, and real/reactive power flows under specified generation and load conditions. Results identify overloaded conductors, buses outside voltage limits, and reactive power needs. A short circuit study calculates maximum fault current at each bus to verify equipment interrupting ratings and set protective relay pickup values.',
 NULL,
 'generated', 'exam_simulation'),

('systems-commissioning', 'commissioning-process', 3, 'conceptual', 2, 1,
 'Which documents are essential components of final electrical commissioning close-out deliverables?',
 '{"a":"Original equipment purchase orders and shipping invoices","b":"As-built drawings, completed test reports for all acceptance and functional testing, and relay settings records (as-left with coordination curves)","c":"Factory acceptance test reports only — field testing is the contractor''s internal record","d":"A single signed commissioning completion certificate stating all systems are operational"}',
 'b',
 'Final commissioning documentation must include: (1) as-built drawings reflecting actual installed conditions, (2) completed and signed test reports for all acceptance and functional tests performed, and (3) relay settings records showing as-left settings with coordination time-current curves. This package provides the owner with a baseline record and legal documentation of the system''s condition at handover, essential for future maintenance and incident investigation.',
 NULL,
 'generated', 'exam_simulation');
