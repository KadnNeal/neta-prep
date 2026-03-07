-- NETA Prep: Level 3 Tier 1 Question Bank Seed
-- Source: Recalled exam questions from 4 independent engineers (2020–2025)
-- Coverage: protective-relays, current-transformers, circuit-breakers,
--           cables-conductors, transformers, plus power-systems-calc (L3-specific)
-- Total: 80 questions

-- =============================================================================
-- PROTECTIVE RELAYS  (component-testing / protective-relays)
-- ~15% of L3 exam alone — the single largest sub-topic
-- =============================================================================

INSERT INTO public.questions
  (domain, subdomain, level, concept_type, difficulty, frequency_tier,
   question, options, correct_answer, explanation, trap_pattern, source)
VALUES

-- ── ANSI device number identification ────────────────────────────────────────

('component-testing', 'protective-relays', 3, 'conceptual', 2, 1,
 'What is the function of an ANSI device 21?',
 '{"a":"Distance relay","b":"Undervoltage relay","c":"Instantaneous overcurrent relay","d":"Differential relay"}',
 'a',
 'ANSI 21 is a distance relay. It measures impedance to determine the distance to a fault and trips when impedance falls below a set threshold. Used on transmission lines for zone protection.',
 NULL, 'recalled'),

('component-testing', 'protective-relays', 3, 'conceptual', 2, 1,
 'ANSI device number 27 represents which type of relay?',
 '{"a":"Overvoltage relay","b":"Undervoltage relay","c":"Directional overcurrent relay","d":"Lockout relay"}',
 'b',
 'ANSI 27 is an undervoltage relay. It operates when voltage drops below a set threshold. Do not confuse 27 (under) with 59 (over).',
 'Device confusion: 27 (undervoltage) vs 59 (overvoltage). Students swap these.',
 'recalled'),

('component-testing', 'protective-relays', 3, 'conceptual', 2, 1,
 'Which ANSI device number represents an overvoltage relay?',
 '{"a":"27","b":"52","c":"59","d":"86"}',
 'c',
 'ANSI 59 is the overvoltage relay. Do not confuse with 27 (undervoltage), 52 (AC circuit breaker), or 86 (lockout relay).',
 'Device confusion: 59 (overvoltage) vs 27 (undervoltage).',
 'recalled'),

('component-testing', 'protective-relays', 3, 'conceptual', 2, 1,
 'What does ANSI device number 47 represent?',
 '{"a":"Instantaneous overcurrent relay","b":"Phase sequence voltage relay","c":"Directional overcurrent relay","d":"Frequency relay"}',
 'b',
 'ANSI 47 is a phase sequence (negative sequence) voltage relay. It detects phase reversal or unbalanced voltage conditions, protecting motors from reverse rotation.',
 NULL, 'recalled'),

('component-testing', 'protective-relays', 3, 'conceptual', 2, 1,
 'What is the difference between ANSI device 50 and ANSI device 51?',
 '{"a":"50 is time overcurrent; 51 is instantaneous overcurrent","b":"50 is instantaneous overcurrent; 51 is time overcurrent","c":"50 is ground fault; 51 is phase fault","d":"50 is voltage relay; 51 is current relay"}',
 'b',
 'ANSI 50 is instantaneous overcurrent (no intentional time delay). ANSI 51 is time overcurrent (inverse time-current characteristic). They are commonly paired as 50/51 on the same device.',
 NULL, 'recalled'),

('component-testing', 'protective-relays', 3, 'conceptual', 3, 1,
 'What does an ANSI 50G relay protect against?',
 '{"a":"Time overcurrent on ground faults","b":"Instantaneous overcurrent on ground faults","c":"Voltage unbalance","d":"Insulation failure"}',
 'b',
 'ANSI 50G is an instantaneous overcurrent relay for ground fault detection. Do not confuse with 51G (time overcurrent — ground) or 64 (ground detector relay).',
 'Device confusion: 50G (instantaneous ground OC) vs 51G (time ground OC) vs 64 (ground detector).',
 'recalled'),

('component-testing', 'protective-relays', 3, 'conceptual', 2, 1,
 'ANSI device number 52 represents:',
 '{"a":"A protective relay","b":"An AC circuit breaker","c":"A lockout relay","d":"A reclosing relay"}',
 'b',
 'ANSI 52 is an AC circuit breaker — the switching device, NOT a relay. It appears in trip sequences but is the breaker that gets tripped, not a relay that does the tripping.',
 'Device confusion: 52 is the breaker, not a relay.',
 'recalled'),

('component-testing', 'protective-relays', 3, 'conceptual', 2, 1,
 'What is the primary function of an ANSI 86 lockout relay?',
 '{"a":"Provide time-delayed tripping for coordination","b":"Lock out equipment after a trip, requiring manual reset before re-energization","c":"Monitor bus voltage and lock out loads during undervoltage","d":"Provide differential protection for transformers"}',
 'b',
 'ANSI 86 is a lockout relay. After a protective relay operates, the 86 trips the breaker AND locks out the equipment, preventing automatic reclosing until an operator manually resets it.',
 NULL, 'recalled'),

('component-testing', 'protective-relays', 3, 'conceptual', 2, 1,
 'ANSI device 87 represents which type of relay?',
 '{"a":"Distance relay","b":"Lockout relay","c":"Differential relay","d":"Directional overcurrent relay"}',
 'c',
 'ANSI 87 is a differential relay. It compares current entering and leaving a protected zone. If the difference exceeds a threshold, it indicates an internal fault and trips.',
 NULL, 'recalled'),

('component-testing', 'protective-relays', 3, 'conceptual', 2, 1,
 'What is the purpose of the ANSI 67 directional overcurrent relay?',
 '{"a":"Detects overcurrent regardless of direction","b":"Detects overcurrent only when current flows in a specified direction","c":"Monitors voltage direction on bus sections","d":"Provides instantaneous ground fault protection"}',
 'b',
 'ANSI 67 is a directional overcurrent relay. It operates only when fault current flows in a predetermined direction — essential in looped or networked power systems.',
 NULL, 'recalled'),

-- ── Buchholz relay — confirmed by ALL FOUR recalled sources ──────────────────

('component-testing', 'protective-relays', 3, 'conceptual', 3, 1,
 'ANSI device 63 (Buchholz relay) detects what condition in a transformer?',
 '{"a":"Overvoltage on secondary windings","b":"Oil temperature exceeding rated limits","c":"Gas accumulation and oil surge from internal faults","d":"Winding insulation resistance below minimum"}',
 'c',
 'The Buchholz relay (device 63) detects gas accumulation AND oil surge in liquid-filled transformers, indicating internal arcing or overheating. It does NOT measure — it operates mechanically on gas collection and oil flow. Confirmed by all four recalled sources.',
 NULL, 'recalled'),

('component-testing', 'protective-relays', 3, 'conceptual', 3, 1,
 'A Buchholz relay operates based on which physical principle?',
 '{"a":"Measuring dielectric strength of transformer oil","b":"Detecting dissolved gas via chemical analysis","c":"Mechanical operation from gas collection and oil flow displacement","d":"Monitoring oil pressure via electronic transducer"}',
 'c',
 'The Buchholz relay is purely mechanical. Slow gas accumulation (minor faults) collects in the upper chamber and tilts a float — alarm. Sudden oil surge (major fault) displaces a vane — trip. No electronic measurement.',
 NULL, 'recalled'),

-- ── 87 relay + 2nd harmonic — confirmed by ALL FOUR recalled sources ─────────

('component-testing', 'protective-relays', 3, 'conceptual', 4, 1,
 'Why is 2nd harmonic restraint used in transformer differential (87) relays?',
 '{"a":"To detect harmonic distortion from nonlinear loads","b":"To prevent false tripping during transformer energization (inrush current)","c":"To compensate for CT saturation during external faults","d":"To filter harmonics generated by VFDs"}',
 'b',
 'Transformer inrush current during energization is rich in 2nd harmonics. The differential relay uses 2nd harmonic restraint to recognize inrush (not a fault) and block the trip. Without it, the relay would false-trip on every energization. Confirmed by all four sources.',
 NULL, 'recalled'),

('component-testing', 'protective-relays', 3, 'conceptual', 4, 1,
 'CT saturation during an external fault can cause a differential relay to:',
 '{"a":"Fail to operate for internal faults","b":"Falsely operate due to unbalanced current measurement","c":"Increase its pickup setting automatically","d":"Switch to time overcurrent mode"}',
 'b',
 'When a CT saturates during an external fault, it under-reports current on one side. The relay sees a difference and may falsely interpret it as an internal fault, causing misoperation.',
 NULL, 'recalled'),

-- ── Relay trip sequence — documented trap ────────────────────────────────────

('component-testing', 'protective-relays', 3, 'conceptual', 3, 1,
 'What is the correct sequence when a time overcurrent relay detects a fault?',
 '{"a":"52 trips → 86 locks out → 51 resets","b":"51 operates → 52 trips → 86 locks out","c":"51 operates → 86 lockout → 52 trips","d":"86 locks out → 51 operates → 52 trips"}',
 'c',
 'Correct trip sequence: 51 (time OC relay) operates → 86 (lockout relay) energizes → 52 (breaker) trips open. The lockout relay is the intermediary. "What trips first?" = the 86 lockout, NOT the breaker.',
 'Relay trip sequence: 51→86→52. Students think the breaker (52) trips directly from the 51.',
 'recalled'),

('component-testing', 'protective-relays', 3, 'conceptual', 3, 1,
 'When testing a protective relay, what must be verified FIRST before injecting test current?',
 '{"a":"The relay firmware version","b":"That the relay is isolated from the tripping circuit","c":"The relay communication protocol","d":"The relay event log is cleared"}',
 'b',
 'Before injecting test current, verify the relay is isolated from the tripping circuit to prevent unintended breaker operations. Fundamental safety step.',
 NULL, 'recalled'),

-- =============================================================================
-- CURRENT TRANSFORMERS  (component-testing / current-transformers)
-- =============================================================================

('component-testing', 'current-transformers', 3, 'calculation', 4, 1,
 'A 3000:5 CT is tested with equipment that outputs a maximum of 500A. How many times must the conductor be looped through the CT window?',
 '{"a":"2","b":"3","c":"6","d":"10"}',
 'c',
 'CT ratio = 3000:5 = 600:1. Each loop = 1 effective primary turn. Need 3000/500 = 6 loops so 6 × 500A = 3000A effective primary current.',
 NULL, 'recalled'),

('component-testing', 'current-transformers', 3, 'calculation', 3, 1,
 'A conductor is passed through a 600:5 CT window twice. What is the effective CT ratio?',
 '{"a":"600:5","b":"300:5","c":"1200:5","d":"600:10"}',
 'b',
 'With 2 passes, effective primary current doubles: ratio becomes 600/2 = 300:5. The CT reads as if 300A primary produces 5A secondary.',
 NULL, 'recalled'),

('component-testing', 'current-transformers', 3, 'calculation', 3, 1,
 'A 2000:5 CT has a primary conductor passed through it 4 times. What is the effective ratio?',
 '{"a":"2000:5","b":"500:5","c":"8000:5","d":"2000:20"}',
 'b',
 'With 4 passes: effective ratio = 2000/4 = 500:5. This technique is used when primary current is too low for accurate measurement at nameplate ratio.',
 NULL, 'recalled'),

('component-testing', 'current-transformers', 3, 'conceptual', 3, 1,
 'How many grounding points should a CT secondary circuit have?',
 '{"a":"None — CT secondaries should float","b":"One point only, solidly grounded","c":"Two points — one at CT, one at relay","d":"Grounded at every junction box"}',
 'b',
 'CT secondary must be grounded at exactly ONE point, solidly (no fuses or switches). Multiple grounds create parallel paths with measurement errors. No ground leaves the secondary floating at dangerous voltages.',
 NULL, 'recalled'),

('component-testing', 'current-transformers', 3, 'conceptual', 4, 1,
 'What happens if the CT secondary ground is on the wrong side (load side instead of relay side)?',
 '{"a":"The relay reads double the actual current","b":"The relay reads half the actual current","c":"The relay will not operate — current bypasses it through the ground","d":"No effect — grounding location does not matter"}',
 'c',
 'If grounded between the CT and the relay, fault current flows through the ground path instead of through the relay. The relay sees no current — trip failure. Ground must be on the relay side.',
 'CT grounding: Wrong side = relay won''t operate. One ground point only.',
 'recalled'),

('component-testing', 'current-transformers', 3, 'conceptual', 3, 1,
 'What is the danger of opening a CT secondary circuit while the primary is energized?',
 '{"a":"The CT will demagnetize","b":"Dangerously high voltage develops across the secondary terminals","c":"The primary fuse will blow","d":"The CT ratio becomes inaccurate"}',
 'b',
 'An open CT secondary forces all primary flux into the core without demagnetizing secondary current. This produces extremely high voltages (potentially thousands of volts) — lethal shock and fire hazard. Always short the secondary before disconnecting.',
 NULL, 'recalled'),

('component-testing', 'current-transformers', 3, 'conceptual', 3, 1,
 'When performing CT burden testing, what must be established BEFORE energizing the core?',
 '{"a":"The relay settings","b":"The connected burden","c":"The power factor of the load","d":"The ambient temperature"}',
 'b',
 'Burden (total secondary circuit impedance) must be connected BEFORE energizing the CT core. Testing with open or incorrect burden produces dangerous voltages and inaccurate results.',
 NULL, 'recalled'),

('component-testing', 'current-transformers', 3, 'conceptual', 3, 1,
 'What is the primary purpose of CT ratio testing per NETA ATS?',
 '{"a":"To verify fault current withstand","b":"To verify nameplate ratio and polarity are correct","c":"To measure secondary circuit burden","d":"To determine the saturation curve"}',
 'b',
 'CT ratio testing verifies correct secondary current for given primary current, matching the nameplate ratio, and confirms polarity. Ratio or polarity errors cause relay misoperation or failure to trip.',
 NULL, 'recalled'),

('component-testing', 'current-transformers', 3, 'conceptual', 4, 1,
 'What does a CT saturation curve (excitation curve) reveal?',
 '{"a":"Maximum primary fault current the CT can carry","b":"The knee point where secondary output becomes nonlinear","c":"The insulation resistance of CT windings","d":"The thermal rating of the CT"}',
 'b',
 'The excitation curve plots secondary voltage vs. excitation current. The knee point is where the curve bends — above it, the core saturates and secondary current no longer accurately represents primary current. Critical for determining if the CT can drive its burden at fault levels.',
 NULL, 'recalled'),

-- =============================================================================
-- CIRCUIT BREAKERS  (component-testing / circuit-breakers)
-- =============================================================================

('component-testing', 'circuit-breakers', 3, 'conceptual', 3, 1,
 'What is the standard test for verifying vacuum bottle integrity on a medium-voltage vacuum circuit breaker?',
 '{"a":"Contact resistance test","b":"Hi-pot test per manufacturer guidelines","c":"Insulation resistance test at 500V","d":"Power factor test"}',
 'b',
 'Vacuum bottle integrity is verified by hi-pot (dielectric withstand) test across the open contacts per manufacturer''s specified voltage. Failure indicates loss of vacuum — the breaker cannot interrupt fault current.',
 NULL, 'recalled'),

('component-testing', 'circuit-breakers', 3, 'conceptual', 3, 1,
 'What do raised filaments on the contacts of a medium-voltage circuit breaker indicate?',
 '{"a":"Normal wear from mechanical operation","b":"Arcing damage and contact erosion","c":"Contamination from SF6 gas decomposition","d":"Manufacturing defect"}',
 'b',
 'Raised filaments (frosting/pitting) on MV breaker contacts indicate arcing erosion. Each fault interruption arcs between contacts as they open, eroding contact material and raising resistance. Severe erosion requires replacement.',
 NULL, 'recalled'),

('component-testing', 'circuit-breakers', 3, 'table-lookup', 3, 1,
 'What is the approximate contact resistance value for a 5kV air circuit breaker per NETA specifications?',
 '{"a":"~5 µΩ","b":"~50 µΩ","c":"~500 µΩ","d":"~5000 µΩ"}',
 'b',
 'Per NETA tables, contact resistance for a 5kV ACB is approximately 50 microohms (µΩ). Memorize this value. Higher readings indicate deterioration, contamination, or insufficient contact pressure.',
 NULL, 'recalled'),

('component-testing', 'circuit-breakers', 3, 'conceptual', 3, 1,
 'When performing a circuit breaker timing test, what parameters are measured?',
 '{"a":"Voltage drop across contacts during operation","b":"Open time, close time, and contact bounce/rebound","c":"Arc flash energy during operation","d":"Insulation resistance between phases"}',
 'b',
 'Timing tests measure open (trip) time, close time, and contact bounce/rebound. These must fall within manufacturer specs to ensure proper relay coordination and safe fault interruption.',
 NULL, 'recalled'),

('component-testing', 'circuit-breakers', 3, 'conceptual', 3, 1,
 'What is the primary purpose of contact resistance testing on a circuit breaker?',
 '{"a":"Verify dielectric withstand capability","b":"Detect high-resistance connections that could cause overheating under load","c":"Measure speed of contact operation","d":"Verify trip coil resistance"}',
 'b',
 'Contact resistance testing (DLRO) measures resistance across closed contacts. Elevated resistance indicates oxidation, pitting, misalignment, or insufficient pressure — all causing localized overheating under load.',
 NULL, 'recalled'),

('component-testing', 'circuit-breakers', 3, 'table-lookup', 3, 1,
 'Per NETA ATS, what minimum insulation resistance test voltage is used for equipment rated 1001V–5000V?',
 '{"a":"500V DC","b":"1000V DC","c":"2500V DC","d":"5000V DC"}',
 'c',
 'Per NETA ATS Table 100.1, equipment rated 1001V to 5000V requires insulation resistance testing at minimum 2500V DC.',
 NULL, 'recalled'),

('component-testing', 'circuit-breakers', 3, 'conceptual', 4, 1,
 'A circuit breaker fails to open within the specified trip time. What is the most likely cause?',
 '{"a":"Low control voltage to the trip coil","b":"High ambient temperature","c":"Incorrect relay settings","d":"Open CT secondary"}',
 'a',
 'Low control voltage (weak battery, high-resistance connections, undersized wiring) is the most common cause of slow or failed tripping. The trip coil needs adequate voltage to generate sufficient magnetic force to release the latch.',
 NULL, 'recalled'),

-- =============================================================================
-- CABLES & CONDUCTORS  (component-testing / cables-conductors)
-- =============================================================================

('component-testing', 'cables-conductors', 3, 'table-lookup', 3, 1,
 'Per NETA specifications, what is the minimum acceptable insulation resistance for control wiring?',
 '{"a":"0.5 MΩ","b":"1 MΩ","c":"2 MΩ","d":"5 MΩ"}',
 'c',
 'Minimum acceptable insulation resistance for control wiring is 2 MΩ per NETA. Values below indicate insulation degradation and potential control circuit failure.',
 NULL, 'recalled'),

('component-testing', 'cables-conductors', 3, 'schematic', 3, 1,
 'What is the correct layer order of a medium-voltage power cable from OUTSIDE in?',
 '{"a":"Conductor → insulation → jacket","b":"Jacket → insulation → metallic shield → conductor shield → conductor","c":"Jacket → metallic shield → insulation shield → insulation → conductor shield → conductor","d":"Jacket → conductor shield → insulation → metallic shield → conductor"}',
 'c',
 'Outside in: jacket → metallic shield → insulation shield (semi-con) → insulation (XLPE/EPR) → conductor shield (semi-con) → conductor. The semi-conducting shields smooth the electric field gradient at each insulation interface.',
 NULL, 'recalled'),

('component-testing', 'cables-conductors', 3, 'conceptual', 3, 1,
 'What is the difference between 100% and 133% insulation level ratings on MV cables?',
 '{"a":"133% cables are 33% thicker overall","b":"100% is for grounded systems with faults cleared <1 min; 133% is for faults that may persist up to 1 hour","c":"133% cables carry 33% more current","d":"100% is indoor only; 133% is outdoor"}',
 'b',
 '100% insulation: solidly grounded systems, faults cleared <1 minute. 133% insulation: systems where faults may persist up to 1 hour (resistance grounded, slower backup clearing).',
 NULL, 'recalled'),

('component-testing', 'cables-conductors', 3, 'table-lookup', 4, 1,
 'When hi-pot testing service-aged cable, which NETA table provides the correct (reduced) test voltage?',
 '{"a":"Table 100.1 only","b":"Table 100.6 — with reduced voltages compared to new cable","c":"Table 100.12","d":"No table — use 75% of nameplate rating"}',
 'b',
 'Table 100.1 = new cable acceptance voltages. Table 100.6 = reduced maintenance voltages for service-aged cable. Using new-cable levels on aged cable risks breakdown that would not have occurred in service.',
 NULL, 'recalled'),

('component-testing', 'cables-conductors', 3, 'conceptual', 3, 1,
 'What is the purpose of a shield continuity test on medium-voltage cable?',
 '{"a":"Verify cable ampacity","b":"Ensure the metallic shield is continuous and properly grounded for fault current return","c":"Measure insulation thickness","d":"Verify conductor resistance"}',
 'b',
 'Shield continuity testing verifies the metallic shield provides a continuous, low-resistance path for fault current return and for draining capacitive charging current. Broken shields cause overheating, voltage stress, and shock hazard.',
 NULL, 'recalled'),

('component-testing', 'cables-conductors', 3, 'conceptual', 3, 1,
 'During VLF (Very Low Frequency) hi-pot testing of cable, the test frequency is typically:',
 '{"a":"0.01 Hz","b":"0.1 Hz","c":"50/60 Hz","d":"1 kHz"}',
 'b',
 'VLF uses 0.1 Hz (vs 50/60 Hz power frequency). Low frequency dramatically reduces charging current for long cable runs, allowing smaller portable test sets. Preferred field method for service-aged cable.',
 NULL, 'recalled'),

('component-testing', 'cables-conductors', 3, 'conceptual', 3, 1,
 'What does a polarization index (PI) test measure on cable insulation?',
 '{"a":"Surge impedance","b":"Ratio of 10-minute to 1-minute IR, indicating insulation condition and moisture","c":"Capacitance per unit length","d":"Dielectric loss angle"}',
 'b',
 'PI = 10-min IR / 1-min IR. PI ≥ 2.0 indicates good, dry insulation. PI near 1.0 suggests moisture or deterioration — resistance does not increase over time as polarization currents should diminish in healthy insulation.',
 NULL, 'recalled'),

-- =============================================================================
-- TRANSFORMERS  (component-testing / transformers)
-- =============================================================================

('component-testing', 'transformers', 3, 'table-lookup', 3, 1,
 'What is the standard rated temperature rise for a dry-type transformer with Class F insulation?',
 '{"a":"80°C","b":"115°C","c":"150°C","d":"180°C"}',
 'c',
 'Dry-type Class F insulation: 150°C rated temperature rise. Also know: 80°C (Class A), 115°C (Class B). Flagged by multiple sources as tricky.',
 'Temperature rise: Students confuse 80°C, 115°C, and 150°C. 150°C = Class F, most common modern dry-type.',
 'recalled'),

('component-testing', 'transformers', 3, 'conceptual', 3, 1,
 'What is the purpose of a conservator tank on an oil-filled transformer?',
 '{"a":"Filter impurities from oil","b":"Allow oil expansion/contraction while keeping oil sealed from atmosphere","c":"Provide additional cooling surface area","d":"Store backup oil for maintenance"}',
 'b',
 'The conservator provides expansion space for oil during load cycling. Keeps the main tank full while preventing direct oil-to-atmosphere contact (often via bladder), reducing moisture ingress and oxidation.',
 NULL, 'recalled'),

-- ── ASTM oil test standards — must memorize ──────────────────────────────────

('component-testing', 'transformers', 3, 'table-lookup', 3, 1,
 'ASTM D877/D1816 measures which property of transformer oil, and in what units?',
 '{"a":"Moisture content in ppm","b":"Dielectric breakdown voltage in kV","c":"Acid number in mg KOH/g","d":"Power factor in percent"}',
 'b',
 'ASTM D877/D1816 = dielectric breakdown voltage in kV. D877 uses disk electrodes; D1816 uses VDE electrodes and is more sensitive to moisture and particles.',
 NULL, 'recalled'),

('component-testing', 'transformers', 3, 'table-lookup', 3, 1,
 'ASTM D974 measures which property of transformer oil?',
 '{"a":"Dielectric breakdown voltage","b":"Interfacial tension","c":"Acid number (neutralization number)","d":"Dissolved gas content"}',
 'c',
 'D974 = acid number in mg KOH/g. Higher values indicate oil degradation from oxidation. Fresh oil has very low acid number.',
 NULL, 'recalled'),

('component-testing', 'transformers', 3, 'table-lookup', 3, 1,
 'Which ASTM standard measures interfacial tension (IFT) of transformer oil?',
 '{"a":"D877","b":"D971","c":"D974","d":"D924"}',
 'b',
 'D971 = interfacial tension (IFT) in mN/m (dynes/cm). IFT indicates polar contaminants and oxidation byproducts. Lower IFT = deteriorated oil. New oil typically > 40 mN/m.',
 NULL, 'recalled'),

('component-testing', 'transformers', 3, 'table-lookup', 3, 1,
 'ASTM D924 measures which property of transformer oil?',
 '{"a":"Dissolved gas content","b":"Specific gravity","c":"Power factor (dielectric dissipation factor)","d":"Moisture content"}',
 'c',
 'D924 = power factor (dissipation factor) in percent (%). High PF indicates contamination, moisture, or deterioration.',
 NULL, 'recalled'),

('component-testing', 'transformers', 3, 'table-lookup', 3, 1,
 'What does ASTM D1533 (Karl Fischer method) measure in transformer oil?',
 '{"a":"Acid number","b":"Dissolved gas content","c":"Moisture content in ppm","d":"Dielectric breakdown voltage"}',
 'c',
 'D1533 (Karl Fischer titration) = moisture content in ppm. Moisture accelerates insulation aging and reduces dielectric strength.',
 NULL, 'recalled'),

('component-testing', 'transformers', 3, 'table-lookup', 2, 1,
 'ASTM D3612 is used for which transformer oil test?',
 '{"a":"Dielectric breakdown","b":"Dissolved gas analysis (DGA)","c":"Acid number","d":"Interfacial tension"}',
 'b',
 'D3612 = dissolved gas analysis (DGA) in ppm. Detects gases from internal faults (arcing, overheating, partial discharge). Key gases: hydrogen, methane, ethylene, acetylene, CO.',
 NULL, 'recalled'),

('component-testing', 'transformers', 3, 'table-lookup', 2, 1,
 'ASTM D1298 measures which property of transformer oil?',
 '{"a":"Specific gravity (relative density)","b":"Viscosity","c":"Flash point","d":"Pour point"}',
 'a',
 'D1298 = specific gravity (unitless ratio). Oil must be lighter than water so water settles to the bottom for drainage.',
 NULL, 'recalled'),

-- ── Transformer calculations ─────────────────────────────────────────────────

('component-testing', 'transformers', 3, 'calculation', 4, 1,
 'A 2500 kVA, 13.8kV/480V transformer: what is the FLA on the secondary?',
 '{"a":"2,108 A","b":"3,007 A","c":"3,650 A","d":"5,208 A"}',
 'b',
 'FLA = kVA / (√3 × kV) = 2500 / (1.732 × 0.480) = 2500 / 0.8314 = 3,007 A. Use the line voltage on the side being calculated.',
 NULL, 'recalled'),

('component-testing', 'transformers', 3, 'calculation', 4, 1,
 'A transformer with FLA of 3,007 A and impedance of 5.75%: what is the available fault current?',
 '{"a":"17,298 A","b":"28,900 A","c":"52,296 A","d":"75,175 A"}',
 'c',
 'I_fault = FLA / %Z(pu) = 3,007 / 0.0575 = 52,296 A. Assumes infinite bus on primary.',
 NULL, 'recalled'),

('component-testing', 'transformers', 3, 'conceptual', 3, 1,
 'During a transformer turns ratio test (TTR), a deviation from nameplate ratio indicates:',
 '{"a":"Normal manufacturing tolerance","b":"Possible shorted turns, open circuit, or tap changer problems","c":"Oil contamination","d":"Incorrect CT polarity"}',
 'b',
 'TTR deviation beyond ±0.5% tolerance indicates shorted turns, open winding, or damaged tap changer positions.',
 NULL, 'recalled'),

('component-testing', 'transformers', 3, 'conceptual', 3, 1,
 'What is the primary purpose of power factor testing on a transformer?',
 '{"a":"Verify turns ratio","b":"Measure winding resistance","c":"Assess insulation condition (moisture, contamination, deterioration)","d":"Verify load capacity"}',
 'c',
 'Power factor / tan-delta testing evaluates insulation condition. Elevated PF indicates moisture, deterioration, or conductive contaminants. Results are trended over time.',
 NULL, 'recalled'),

-- =============================================================================
-- POWER SYSTEMS CALCULATIONS  (power-systems-calc)
-- Very high frequency on Level 3 exam
-- =============================================================================

-- ── Series/parallel inductors (3–5 questions on real exam) ───────────────────

('power-systems-calc', 'inductor-circuits', 3, 'calculation', 3, 1,
 'Three inductors of 12 mH, 6 mH, and 4 mH are connected in parallel. What is the total inductance?',
 '{"a":"2 mH","b":"4 mH","c":"7.33 mH","d":"22 mH"}',
 'a',
 '1/L = 1/12 + 1/6 + 1/4 = 1/12 + 2/12 + 3/12 = 6/12 = 1/2 → L = 2 mH. Parallel inductors combine like parallel resistors.',
 NULL, 'recalled'),

('power-systems-calc', 'inductor-circuits', 3, 'calculation', 2, 1,
 'Two inductors of 10 mH and 15 mH are connected in series. Total inductance?',
 '{"a":"6 mH","b":"10 mH","c":"15 mH","d":"25 mH"}',
 'd',
 'Series: L_total = L1 + L2 = 10 + 15 = 25 mH. Series inductors simply add.',
 NULL, 'recalled'),

('power-systems-calc', 'inductor-circuits', 3, 'calculation', 2, 1,
 'Four 20 mH inductors in parallel. Total inductance?',
 '{"a":"5 mH","b":"10 mH","c":"20 mH","d":"80 mH"}',
 'a',
 'Equal inductors in parallel: L/N = 20/4 = 5 mH.',
 NULL, 'recalled'),

('power-systems-calc', 'inductor-circuits', 3, 'calculation', 3, 1,
 'An 8 mH and 24 mH inductor in parallel. Total inductance?',
 '{"a":"4 mH","b":"6 mH","c":"16 mH","d":"32 mH"}',
 'b',
 'Product-over-sum: (8×24)/(8+24) = 192/32 = 6 mH. Or: 1/L = 1/8 + 1/24 = 3/24 + 1/24 = 4/24 → L = 6 mH.',
 NULL, 'recalled'),

-- ── 3-phase power triangle (3–5 questions on real exam) ──────────────────────

('power-systems-calc', 'three-phase-power', 3, 'calculation', 3, 1,
 'A 3-phase system: 480V line voltage, 200A line current. Apparent power (S)?',
 '{"a":"96 kVA","b":"166.3 kVA","c":"192 kVA","d":"288 kVA"}',
 'b',
 'S = √3 × V × I = 1.732 × 480 × 200 = 166,277 VA ≈ 166.3 kVA.',
 NULL, 'recalled'),

('power-systems-calc', 'three-phase-power', 3, 'calculation', 3, 1,
 'A 3-phase load draws 166.3 kVA at PF = 0.85. Real power (P)?',
 '{"a":"100 kW","b":"119.8 kW","c":"141.4 kW","d":"195.6 kW"}',
 'c',
 'P = S × PF = 166.3 × 0.85 = 141.4 kW. Real power ≤ apparent power always.',
 NULL, 'recalled'),

('power-systems-calc', 'three-phase-power', 3, 'calculation', 4, 1,
 'A 3-phase load: S = 200 kVA, P = 160 kW. Reactive power (Q)?',
 '{"a":"40 kVAR","b":"80 kVAR","c":"120 kVAR","d":"256 kVAR"}',
 'c',
 'Q = √(S² − P²) = √(40,000 − 25,600) = √14,400 = 120 kVAR. From the power triangle: S² = P² + Q².',
 NULL, 'recalled'),

('power-systems-calc', 'three-phase-power', 3, 'calculation', 3, 1,
 'A motor draws 50 kW real power with 62.5 kVA apparent power. Power factor?',
 '{"a":"0.60","b":"0.75","c":"0.80","d":"0.85"}',
 'c',
 'PF = P/S = 50/62.5 = 0.80.',
 NULL, 'recalled'),

-- ── Fault current (2–3 questions on real exam) ───────────────────────────────

('power-systems-calc', 'fault-current', 3, 'calculation', 4, 1,
 'A 1500 kVA, 480V secondary transformer with 5% impedance. Available fault current?',
 '{"a":"18,042 A","b":"36,084 A","c":"43,301 A","d":"52,042 A"}',
 'b',
 'FLA = 1500 / (1.732 × 0.480) = 1,804.2 A. I_fault = 1,804.2 / 0.05 = 36,084 A.',
 NULL, 'recalled'),

('power-systems-calc', 'fault-current', 3, 'calculation', 4, 1,
 'If transformer impedance increases from 5% to 6%, how does fault current change?',
 '{"a":"Increases by 20%","b":"Decreases by approximately 17%","c":"Unchanged","d":"Doubles"}',
 'b',
 'I_fault ∝ 1/%Z. Ratio: (1/0.06)/(1/0.05) = 0.05/0.06 = 0.833, so ~17% decrease. Higher impedance = lower fault current.',
 NULL, 'recalled'),

-- ── Leading/lagging current (1–2 questions) ──────────────────────────────────

('power-systems-calc', 'three-phase-power', 3, 'conceptual', 2, 1,
 'When current peaks AFTER voltage in an AC circuit, the current:',
 '{"a":"Leads the voltage (capacitive)","b":"Lags the voltage (inductive)","c":"Is in phase","d":"Is at unity power factor"}',
 'b',
 'Current peaking after voltage = lagging = inductive load. ELI the ICE man: in an inductor (L), voltage (E) leads current (I).',
 NULL, 'recalled'),

('power-systems-calc', 'three-phase-power', 3, 'conceptual', 2, 1,
 'A capacitive load causes current to:',
 '{"a":"Lag the voltage","b":"Lead the voltage","c":"Be in phase","d":"Be 180° out of phase"}',
 'b',
 'Capacitive loads cause current to lead voltage. ICE: in a capacitor (C), current (I) leads voltage (E).',
 NULL, 'recalled'),

-- =============================================================================
-- FUNDAMENTALS & THEORY — high-frequency items
-- =============================================================================

('fundamentals-theory', 'harmonics', 3, 'conceptual', 3, 1,
 'Which harmonic is most commonly associated with 6-pulse VFD output?',
 '{"a":"2nd","b":"3rd","c":"5th","d":"7th"}',
 'c',
 '6-pulse VFDs generate characteristic harmonics at 6n±1: 5th, 7th, 11th, 13th. The 5th is typically dominant.',
 NULL, 'recalled'),

('fundamentals-theory', 'harmonics', 3, 'conceptual', 4, 1,
 'Why do transformer differential relays use 2nd harmonic restraint specifically?',
 '{"a":"2nd harmonics damage insulation most","b":"Inrush current is rich in 2nd harmonics, distinguishing it from fault current","c":"2nd harmonics are easiest to measure","d":"ANSI requires 2nd harmonic restraint only"}',
 'b',
 'Inrush current has 20–70% 2nd harmonic content vs fundamental. Fault current does not. The relay uses this difference to block false tripping during energization.',
 NULL, 'recalled');
