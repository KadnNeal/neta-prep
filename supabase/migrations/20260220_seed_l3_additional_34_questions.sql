-- NETA Prep: Level 3 Additional Question Bank Seed (34 questions)
-- Source: Derived from real exam analysis in CLAUDE.md + NETA domain taxonomy
-- Coverage: protective-relays (5), ev-chargers (5), sf6-gas-equipment (3),
--           batteries-dc (4), grounding-electrodes (4), motor-protection (4),
--           surge-arresters (2), safety-standards (4), harmonics (3)
-- Total: 34 questions — brings L3 bank to 100

INSERT INTO public.questions
  (domain, subdomain, level, concept_type, difficulty, frequency_tier,
   question, options, correct_answer, explanation, trap_pattern, source)
VALUES

-- =============================================================================
-- PROTECTIVE RELAYS — 5 additional questions
-- (component-testing / protective-relays)
-- =============================================================================

('component-testing', 'protective-relays', 3, 'conceptual', 3, 1,
 'What is the primary advantage of a numeric (digital) protective relay over an electromechanical relay?',
 '{"a":"Faster mechanical trip speed","b":"Integrated event logging, oscillography, and self-diagnostics","c":"No need for secondary CT connections","d":"Lower burden on CT circuits"}',
 'b',
 'Numeric relays store event records, fault oscillography, and relay targets in memory. They also perform continuous self-diagnostics. These functions require no additional equipment and reduce post-fault investigation time. Trip speed is comparable to modern electromechanical designs.',
 NULL, 'generated'),

('component-testing', 'protective-relays', 3, 'conceptual', 3, 1,
 'A 51 relay with an inverse time characteristic is coordinating with an upstream 51 relay. The downstream relay should have:',
 '{"a":"A longer time dial than the upstream relay","b":"A shorter time dial and/or lower pickup than the upstream relay","c":"The same pickup but opposite polarity","d":"No time delay — only instantaneous elements"}',
 'b',
 'For proper coordination the downstream (closer to load) relay must operate faster than the upstream relay for the same fault current. Lower time dial and/or lower pickup achieves this, giving the downstream relay an opportunity to clear local faults before the upstream relay trips.',
 NULL, 'generated'),

('component-testing', 'protective-relays', 3, 'schematic', 4, 1,
 'In a transformer differential scheme, why are the CTs on the delta winding of a delta-wye transformer connected in wye?',
 '{"a":"To match the secondary burden","b":"To compensate for the 30° phase shift and zero-sequence current introduced by the transformer","c":"To increase the CT ratio","d":"To provide redundant metering"}',
 'b',
 'The delta-wye transformer introduces a 30° phase shift between primary and secondary currents. Connecting the delta-side CTs in wye (and vice versa) provides the compensating 30° shift so the relay compares matching current phasors. The wye connection also blocks zero-sequence current, preventing false trips on external ground faults.',
 NULL, 'generated'),

('component-testing', 'protective-relays', 3, 'conceptual', 3, 1,
 'An ANSI 51N relay differs from an ANSI 51G relay in what way?',
 '{"a":"51N is faster; 51G is slower","b":"51N measures neutral current directly at a CT; 51G measures residual (sum) of phase CTs","c":"51N detects phase faults; 51G detects ground faults only","d":"There is no functional difference"}',
 'b',
 '51N uses a dedicated neutral CT installed on the grounded neutral conductor. 51G typically uses a residual connection — the vectorial sum of the three phase CTs — to derive ground current without a separate CT. 51N is more sensitive and accurate for high-resistance ground faults.',
 'Device confusion: 51N vs 51G — both detect ground faults but via different measurement methods.',
 'generated'),

('component-testing', 'protective-relays', 3, 'conceptual', 4, 1,
 'During commissioning, a differential relay is operating on a new transformer but a phase fault has not occurred. What test verifies the differential scheme is wired correctly?',
 '{"a":"Megohmmeter test across all CT windings","b":"Load tap changer test","c":"Current injection into each CT circuit to verify proper restraint and operate element response","d":"Timing test at 300% pickup"}',
 'c',
 'Primary injection or secondary injection testing sends known current into each CT circuit. The relay''s restraint and operate coil currents are measured and compared against calculated values. This verifies CT polarity, wiring, and ratio — the most common commissioning errors in differential schemes.',
 NULL, 'generated'),

-- =============================================================================
-- EV CHARGERS — 5 questions (NEW 2024–25 exam content, TIER 2)
-- (component-testing / ev-chargers)
-- =============================================================================

('component-testing', 'ev-chargers', 3, 'conceptual', 2, 2,
 'What voltage and connector type is standard for a Level 2 electric vehicle (EV) charger?',
 '{"a":"120V AC, NEMA 5-15R","b":"240V AC, NEMA 14-50R","c":"480V AC, three-phase","d":"208V AC, NEMA 6-30R"}',
 'b',
 'Level 2 EV chargers operate at 240V AC single-phase and commonly use NEMA 14-50R receptacles. Level 1 is 120V. Level 3 (DC fast charge) is typically 480V DC or higher. Level 2 provides 20–80 mile range per hour of charging.',
 NULL, 'generated'),

('component-testing', 'ev-chargers', 3, 'conceptual', 3, 2,
 'A Level 2 EV charger is tested and shows +90V positive-to-ground and −40V negative-to-ground on the DC bus. What does this indicate?',
 '{"a":"Normal DC bus operation","b":"Ground fault on the positive bus","c":"Missing or floating neutral/ground reference","d":"Failed rectifier diode"}',
 'c',
 'Correct DC bus voltages should be symmetric around ground. An unequal split (+90V / −40V) indicates a floating or missing neutral/ground reference. The total 130V is reasonable for a ~120V DC bus but the asymmetry reveals the grounding fault.',
 'Floating ground symptom: unequal positive and negative bus voltages to ground.',
 'generated'),

('component-testing', 'ev-chargers', 3, 'table-lookup', 3, 2,
 'Per NEC Article 625, EV charging equipment must be installed at a minimum height above the floor or grade level of:',
 '{"a":"12 inches","b":"18 inches","c":"24 inches","d":"No minimum height requirement"}',
 'b',
 'NEC 625 requires EV supply equipment receptacles and connectors to be installed at a minimum of 18 inches above the floor or grade. This prevents drive-over damage to the charging cable and connector.',
 NULL, 'generated'),

('component-testing', 'ev-chargers', 3, 'conceptual', 3, 2,
 'What is the difference between an EVSE (Electric Vehicle Supply Equipment) and the EV onboard charger?',
 '{"a":"The EVSE converts AC to DC; the onboard charger controls the communication protocol","b":"The EVSE supplies AC power and communication; the onboard charger converts AC to DC inside the vehicle","c":"The EVSE is installed outdoors; the onboard charger is installed indoors","d":"There is no functional difference — they are the same device"}',
 'b',
 'EVSE (the wall unit) supplies AC power, monitors ground continuity via the pilot wire, and communicates with the vehicle via the control pilot signal (J1772 protocol). The actual AC-to-DC conversion occurs inside the vehicle in the onboard charger. This is a common source of confusion on the exam.',
 'EVSE vs onboard charger: The wall box does NOT convert to DC — the vehicle does.',
 'generated'),

('component-testing', 'ev-chargers', 3, 'conceptual', 3, 2,
 'What is the purpose of the control pilot circuit in a J1772 Level 2 EV charging connector?',
 '{"a":"Carry the main charging current","b":"Sense ground continuity, communicate available current, and sequence the charging connection","c":"Provide a 12V auxiliary supply to the vehicle","d":"Control the thermal management of the battery"}',
 'b',
 'The J1772 control pilot is a low-voltage PWM signal that: verifies the cable is connected (changes voltage states), communicates the maximum available current (via duty cycle), and confirms ground continuity before allowing high-voltage charging current to flow. It is a safety interlock, not a power conductor.',
 NULL, 'generated'),

-- =============================================================================
-- SF6 GAS EQUIPMENT — 3 questions (TIER 2)
-- (component-testing / sf6-gas-equipment)
-- =============================================================================

('component-testing', 'sf6-gas-equipment', 3, 'conceptual', 3, 2,
 'What minimum purity level is required for SF6 gas in new or reconditioned GIS equipment?',
 '{"a":"90%","b":"95%","c":"97%","d":"99.5%"}',
 'c',
 'SF6 purity must be >97% for new fill or after reconditioning. Below this threshold, decomposition products and air/moisture contamination reduce dielectric strength and arc interruption capability.',
 NULL, 'generated'),

('component-testing', 'sf6-gas-equipment', 3, 'conceptual', 3, 2,
 'When analyzing SF6 gas quality, which three properties are measured?',
 '{"a":"Voltage breakdown, viscosity, and color","b":"Purity (%), moisture (dew point), and decomposition byproducts (SO₂, HF)","c":"pH, density, and flash point","d":"Molecular weight, temperature, and pressure"}',
 'b',
 'SF6 gas analysis measures: (1) purity in percent (confirms SF6 content), (2) moisture as dew point (moisture accelerates decomposition), and (3) decomposition byproducts such as SO₂ and HF, which indicate arcing activity and are toxic.',
 NULL, 'generated'),

('component-testing', 'sf6-gas-equipment', 3, 'safety-standards', 4, 2,
 'Why is SF6 gas an environmental concern, and what precaution is required during maintenance?',
 '{"a":"It is flammable at atmospheric pressure","b":"It is a potent greenhouse gas — must be captured and recycled, never vented","c":"It reacts with oxygen to form acid","d":"It causes ozone depletion at high altitude"}',
 'b',
 'SF6 has a global warming potential approximately 23,500 times that of CO₂. EPA and international regulations prohibit intentional venting. During maintenance, SF6 must be recovered using certified reclaim equipment (IEC 60480). Decomposition products (from arcing) are also toxic — respiratory protection required.',
 NULL, 'generated'),

-- =============================================================================
-- BATTERIES & DC SYSTEMS — 4 questions (TIER 2)
-- (component-testing / batteries-dc)
-- =============================================================================

('component-testing', 'batteries-dc', 3, 'conceptual', 3, 2,
 'What condition causes sulfation in a lead-acid battery?',
 '{"a":"Excessive overcharging","b":"Chronic undercharging or extended discharge state","c":"High ambient temperature","d":"Rapid charge cycling"}',
 'b',
 'Sulfation occurs when lead sulfate crystals form on the battery plates during prolonged discharge or chronic undercharging. These hard crystals reduce active plate area and increase internal resistance, reducing capacity. Severe sulfation is irreversible.',
 'Sulfation cause: Students often guess overcharging. Correct answer is undercharging/deep discharge.',
 'generated'),

('component-testing', 'batteries-dc', 3, 'conceptual', 3, 2,
 'Per IEEE 450, what is the maximum allowable cell-to-cell voltage variation during float charging of a vented lead-acid battery?',
 '{"a":"0.05V","b":"0.5V","c":"1.0V","d":"2.0V"}',
 'b',
 'IEEE 450 allows a maximum cell-to-cell voltage variation of approximately 0.5V during float charge. Greater variation indicates a failing or weak cell that may need replacement.',
 NULL, 'generated'),

('component-testing', 'batteries-dc', 3, 'conceptual', 2, 2,
 'What is the purpose of a battery load test?',
 '{"a":"Verify the battery charger output voltage","b":"Determine actual battery capacity versus rated capacity","c":"Measure insulation resistance of battery cables","d":"Verify specific gravity of the electrolyte"}',
 'b',
 'A load test discharges the battery at a controlled rate (often C/8 over 8 hours) while monitoring voltage. Capacity is determined by comparing actual ampere-hours delivered to rated capacity before voltage drops below the end voltage.',
 NULL, 'generated'),

('component-testing', 'batteries-dc', 3, 'table-lookup', 3, 2,
 'During a PI (polarization index) test on battery cable insulation, the test is interrupted and must be resumed. What is the required discharge time before restarting?',
 '{"a":"30 seconds","b":"2–4 minutes","c":"10 minutes","d":"1 hour"}',
 'b',
 'Per NETA procedures, if a PI test is interrupted after 8 hours (or any extended period), the specimen must be grounded for 2–4 minutes before restarting to discharge polarization capacitance. Failure to do so results in artificially elevated initial IR reading.',
 NULL, 'generated'),

-- =============================================================================
-- GROUND RESISTANCE & ELECTRODES — 4 questions (TIER 2)
-- (component-testing / grounding-electrodes)
-- =============================================================================

('component-testing', 'grounding-electrodes', 3, 'conceptual', 3, 2,
 'What is the most effective method to reduce a grounding electrode system resistance?',
 '{"a":"Use a larger diameter rod","b":"Drive the rod deeper","c":"Add additional rods and increase spacing between them","d":"Coat the rod with copper"}',
 'c',
 'Adding more electrodes in parallel reduces total resistance. Electrode spacing must be at least equal to rod length to avoid overlapping ground spheres. Increasing rod diameter has minimal effect — resistance is primarily determined by soil contact length.',
 'Ground resistance reduction: Rod diameter has minimal effect. Adding rods with proper spacing is the correct answer.',
 'generated'),

('component-testing', 'grounding-electrodes', 3, 'conceptual', 3, 2,
 'When installing multiple ground rods to reduce electrode resistance, what is the minimum recommended spacing between rods?',
 '{"a":"Equal to the rod diameter","b":"6 feet (2 m) minimum","c":"At least equal to the rod length","d":"10 feet regardless of rod length"}',
 'c',
 'Electrode spacing must be at least equal to the driven rod length. Rods placed too close overlap their effective soil contact spheres, providing less parallel resistance reduction than properly spaced rods.',
 NULL, 'generated'),

('component-testing', 'grounding-electrodes', 3, 'schematic', 4, 2,
 'In a fall-of-potential (FOP) ground resistance test, what does the correct resistance plateau in the distance-resistance curve indicate?',
 '{"a":"The soil has reached saturation resistance","b":"The current and potential probes are outside each other''s resistance area — this is the true electrode resistance","c":"The test equipment is malfunctioning","d":"The electrode is fully driven to maximum depth"}',
 'b',
 'When the potential probe is positioned between current probe zones of influence, the measured resistance reflects only the electrode under test. The plateau region on the distance-resistance curve is the correct measurement zone. An absence of plateau indicates probe spacing is insufficient.',
 NULL, 'generated'),

('component-testing', 'grounding-electrodes', 3, 'table-lookup', 3, 2,
 'Per NETA ATS, what is the maximum acceptable resistance for a driven ground rod in a substation grounding system?',
 '{"a":"1 Ω","b":"5 Ω","c":"10 Ω","d":"25 Ω"}',
 'c',
 'NETA ATS specifies 10 Ω as the maximum single-rod resistance threshold for acceptance testing. Better installations achieve 1–5 Ω. The overall grounding grid resistance requirement is typically much lower (< 1 Ω for transmission substations).',
 NULL, 'generated'),

-- =============================================================================
-- MOTOR PROTECTION — 4 questions (TIER 2–3)
-- (component-testing / motor-protection)
-- =============================================================================

('component-testing', 'motor-protection', 3, 'conceptual', 3, 2,
 'An R-rated fuse is selected for a motor circuit. What type of protection does it provide?',
 '{"a":"Overload AND short circuit protection","b":"Short circuit protection ONLY","c":"Ground fault protection only","d":"Overcurrent protection with inverse time delay"}',
 'b',
 'R-rated fuses are high-speed current-limiting fuses designed for short circuit protection ONLY. They do NOT provide overload protection. Overload protection must be provided by a separate overload relay or motor starter. This is a confirmed exam trap.',
 'R-rated fuses: Short circuit ONLY — not overload. Common confirmed exam trap.',
 'generated'),

('component-testing', 'motor-protection', 3, 'conceptual', 3, 2,
 'What is the fundamental difference between a VFD (Variable Frequency Drive) and a soft starter for motor starting?',
 '{"a":"A VFD uses DC injection braking; a soft starter does not","b":"A VFD controls both frequency and voltage; a soft starter controls voltage only","c":"A soft starter provides full speed range control; a VFD only adjusts startup speed","d":"A VFD is for 3-phase motors; a soft starter is for single-phase only"}',
 'b',
 'A VFD controls both output voltage AND frequency, providing full variable-speed operation throughout the motor''s speed range. A soft starter reduces voltage only during startup and is bypassed at full speed — it cannot vary motor speed during normal operation.',
 'VFD vs soft starter: VFD = frequency + voltage. Soft starter = voltage only. Common exam trap.',
 'generated'),

('component-testing', 'motor-protection', 3, 'conceptual', 3, 2,
 'What type of motor protection does an ANSI 49 relay provide?',
 '{"a":"Undervoltage protection","b":"Differential protection","c":"Thermal overload protection based on current and time","d":"Phase reversal protection"}',
 'c',
 'ANSI 49 is the machine thermal relay. It models motor temperature based on current magnitude and duration, protecting against overloads that would damage winding insulation. More sophisticated than a simple overload relay — it accounts for thermal memory from previous loading.',
 NULL, 'generated'),

('component-testing', 'motor-protection', 3, 'conceptual', 4, 2,
 'A motor thermal overload relay trips during normal operation even though the motor is not overloaded. The most likely cause is:',
 '{"a":"Open circuit in one phase causing single-phasing","b":"Excessive ambient temperature around the relay","c":"The relay is installed in the wrong direction","d":"The supply voltage is too high"}',
 'a',
 'Loss of one phase (single-phasing) causes the remaining two phases to carry increased current — approximately 173% of normal full load. The overload relay detects this elevated current and trips. Single-phasing is a common cause of nuisance trips and motor failures.',
 NULL, 'generated'),

-- =============================================================================
-- SURGE ARRESTERS — 2 questions (TIER 3)
-- (component-testing / surge-arresters)
-- =============================================================================

('component-testing', 'surge-arresters', 3, 'conceptual', 2, 3,
 'What type of overvoltage do surge arresters protect against?',
 '{"a":"Sustained overvoltage from utility voltage regulation failures","b":"Transient overvoltages from lightning and switching surges","c":"Harmonic overvoltages from nonlinear loads","d":"Ferroresonance overvoltages in unloaded transformers"}',
 'b',
 'Surge arresters protect against transient (short-duration, high-magnitude) overvoltages from lightning strikes and switching operations. They do NOT protect against sustained overvoltages, harmonics, or ferroresonance.',
 'Surge arresters: Transients ONLY. NOT harmonics, NOT sustained overvoltage.',
 'generated'),

('component-testing', 'surge-arresters', 3, 'conceptual', 3, 3,
 'What is the primary test performed on a metal-oxide varistor (MOV) surge arrester during maintenance?',
 '{"a":"Power factor / tan-delta test","b":"Contact resistance measurement","c":"Hi-pot test at system voltage","d":"Turns ratio test"}',
 'a',
 'Power factor (tan-delta or watts loss) testing is the standard maintenance test for MOV surge arresters. An increase in watts loss compared to baseline indicates moisture ingress, degraded MOV discs, or contamination. Compare to factory or previous test values.',
 NULL, 'generated'),

-- =============================================================================
-- SAFETY & STANDARDS — 4 questions (TIER 1–2)
-- (safety-standards)
-- =============================================================================

('safety-standards', 'arc-flash-ppe', 3, 'table-lookup', 3, 1,
 'Per NFPA 70E, PPE Category 2 requires a minimum arc rating of:',
 '{"a":"4 cal/cm²","b":"8 cal/cm²","c":"25 cal/cm²","d":"40 cal/cm²"}',
 'b',
 'NFPA 70E PPE Categories: Cat 1 = 4 cal/cm² min, Cat 2 = 8 cal/cm² min, Cat 3 = 25 cal/cm² min, Cat 4 = 40 cal/cm² min. Memorize these values.',
 NULL, 'generated'),

('safety-standards', 'loto', 3, 'conceptual', 3, 1,
 'During an LOTO procedure, what is the LAST step before beginning work on de-energized equipment?',
 '{"a":"Apply the lockout device","b":"Notify affected employees","c":"Verify absence of voltage with a tested meter","d":"Drain stored energy"}',
 'c',
 'The final step before work begins is to verify zero energy state — test for absence of voltage at the point of work using a meter known to be functioning (test-before-touch on a known energized source, then test the isolated equipment, then test-after). Applying the lock is earlier in the sequence.',
 NULL, 'generated'),

('safety-standards', 'approach-boundaries', 3, 'conceptual', 3, 1,
 'What is the difference between the Limited Approach Boundary (LAB) and the Restricted Approach Boundary (RAB) per NFPA 70E?',
 '{"a":"LAB applies to unqualified persons; RAB applies to qualified persons only","b":"LAB is for shock protection only; RAB is for arc flash only","c":"LAB and RAB are the same boundary at different voltage levels","d":"LAB applies outdoors; RAB applies indoors"}',
 'a',
 'The Limited Approach Boundary is the distance within which an unqualified person must not enter without escort by a qualified person. The Restricted Approach Boundary is closer to the conductor and applies to qualified workers — within the RAB, direct contact risk is high and additional PPE is required.',
 NULL, 'generated'),

('safety-standards', 'loto', 3, 'safety-standards', 4, 1,
 'When multiple contractors are working on the same equipment under LOTO, which procedure is used?',
 '{"a":"The senior technician applies one lock for all workers","b":"Group lockout/tagout — each worker applies their own personal lock to a hasp on the energy isolating device","c":"The facility owner applies the lock; contractors sign a logbook","d":"Only one lock is needed if everyone agrees verbally"}',
 'b',
 'Group lockout uses a hasp (multi-lock adapter) at the energy isolation point. Each worker — regardless of employer — applies their own personal lock. Work cannot proceed until every lock is applied; equipment cannot be re-energized until every worker removes their lock.',
 NULL, 'generated'),

-- =============================================================================
-- HARMONICS — 3 questions
-- (fundamentals-theory / harmonics)
-- =============================================================================

('fundamentals-theory', 'harmonics', 3, 'conceptual', 3, 2,
 'A VFD installation causes overheating in a nearby transformer. The most likely cause is:',
 '{"a":"The VFD reduces the motor load, causing the transformer to run underloaded","b":"Harmonic currents from the VFD increase transformer eddy-current and hysteresis losses","c":"The VFD power factor is too high","d":"VFD switching transients rupture transformer insulation"}',
 'b',
 'VFDs generate harmonic currents (5th, 7th, 11th, 13th for 6-pulse drives). Harmonic currents in transformer windings cause increased eddy-current losses that increase with the square of harmonic order (h² × I²). A transformer rated for sinusoidal loads may overheat with harmonic load — a K-rated or derating is required.',
 NULL, 'generated'),

('fundamentals-theory', 'harmonics', 3, 'conceptual', 3, 2,
 'What does the K-factor rating of a transformer indicate?',
 '{"a":"The transformer''s ability to withstand short circuit current","b":"The transformer''s ability to handle nonlinear (harmonic) loads without overheating","c":"The ratio of no-load to full-load losses","d":"The maximum allowable neutral current"}',
 'b',
 'K-factor (or K-rating) quantifies a transformer''s ability to serve nonlinear loads. K-1 is for linear loads only. A higher K-factor winding is designed with increased eddy-current loss tolerance — achieved through smaller conductor stranding, reducing skin-effect losses at harmonic frequencies.',
 NULL, 'generated'),

('fundamentals-theory', 'harmonics', 3, 'conceptual', 4, 2,
 'In a 3-phase 4-wire system with VFD loads, why does the neutral conductor often carry more current than a single phase conductor?',
 '{"a":"The neutral carries the unbalanced fundamental current only","b":"Triplen harmonics (3rd, 9th, 15th) add arithmetically in the neutral rather than canceling","c":"The neutral is typically undersized compared to phase conductors","d":"The VFD load is inherently single-phase"}',
 'b',
 'In balanced 3-phase systems, fundamental and most harmonics cancel in the neutral. However, triplen harmonics (3rd, 9th, 15th...) are zero-sequence quantities — they are in phase and add arithmetically in the neutral conductor. With heavy VFD loading, neutral current can reach 1.73× (√3) the phase current.',
 NULL, 'generated');
