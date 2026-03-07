-- Migration: Fix power-systems-calc domain + fill all domains to 50 exam_simulation questions
-- 1. Migrate 11 power-systems-calc questions → fundamentals-theory
-- 2. Add 37 safety-standards questions (→ 50 total)
-- 3. Add 27 fundamentals-theory questions (→ 50 total)
-- 4. Add 33 systems-commissioning questions (→ 50 total)

-- ── 1. Fix orphaned domain ──────────────────────────────────────────────────
UPDATE questions
  SET domain = 'fundamentals-theory'
WHERE domain = 'power-systems-calc'
  AND level = 3;

-- Also make sure those migrated questions are tagged exam_simulation
-- (they were already tagged in the 20260226 migration, but be safe)
UPDATE questions
  SET question_type = 'exam_simulation'
WHERE domain = 'fundamentals-theory'
  AND level = 3
  AND subdomain IN ('inductor-circuits','three-phase-power','fault-current');


-- ── 2. Safety-standards: 37 new exam_simulation questions ──────────────────

INSERT INTO questions (domain, subdomain, level, concept_type, difficulty, frequency_tier, question, options, correct_answer, explanation, trap_pattern, source, question_type) VALUES

-- Arc flash / incident energy
('safety-standards','incident-energy-analysis',3,'conceptual',2,1,
 'What does the incident energy analysis determine for an electrical worker?',
 '{"a":"The maximum voltage the worker can touch","b":"The appropriate PPE category and arc flash boundary for a specific work task","c":"The minimum insulation resistance required for safe work","d":"The fault current available at the work location"}',
 'b',
 'An incident energy analysis (per NFPA 70E) calculates the thermal energy released during an arcing fault at a specific location and determines the arc flash boundary (where the energy equals 1.2 cal/cm²) and the required PPE. It is task- and location-specific.',
 'Trap: fault current is an INPUT to the analysis, not the output. The OUTPUT is PPE requirements and boundaries.',
 'generated','exam_simulation'),

('safety-standards','incident-energy-analysis',3,'conceptual',3,1,
 'At what incident energy level is the arc flash boundary established?',
 '{"a":"1.2 cal/cm²","b":"4 cal/cm²","c":"8 cal/cm²","d":"40 cal/cm²"}',
 'a',
 'The arc flash boundary (AFB) is the distance at which the incident energy equals 1.2 cal/cm² — the onset of a second-degree burn on unprotected skin. This is standardized in NFPA 70E.',
 'Trap: 4 cal/cm² is PPE Category 1 minimum; 1.2 cal/cm² is specifically the boundary definition.',
 'generated','exam_simulation'),

('safety-standards','incident-energy-analysis',3,'calculation',4,2,
 'Which two factors most directly affect the calculated incident energy at a panel board?',
 '{"a":"Panel voltage and ambient temperature","b":"Arcing fault current and arcing duration (clearing time)","c":"Available fault current and conductor length","d":"PPE rating and distance from panel"}',
 'b',
 'Incident energy = f(arcing current, arcing duration, working distance). Arcing current determines the intensity; clearing time (how long the fault burns) determines duration. Both must be minimized to reduce incident energy.',
 null,
 'generated','exam_simulation'),

-- PPE
('safety-standards','ppe',3,'conceptual',2,1,
 'Which NFPA 70E PPE category is the minimum required for tasks with incident energy up to 4 cal/cm²?',
 '{"a":"PPE Category 0","b":"PPE Category 1","c":"PPE Category 2","d":"PPE Category 3"}',
 'b',
 'NFPA 70E Table 130.5(G): PPE Category 1 covers incident energies up to 4 cal/cm² and requires a minimum arc rating of 4 cal/cm² for clothing.',
 'Trap: Category 0 does not exist in current NFPA 70E (2021). Categories are 1–4.',
 'generated','exam_simulation'),

('safety-standards','ppe',3,'conceptual',2,1,
 'What is the minimum arc flash PPE rating (cal/cm²) for Category 2 PPE?',
 '{"a":"4 cal/cm²","b":"8 cal/cm²","c":"25 cal/cm²","d":"40 cal/cm²"}',
 'b',
 'NFPA 70E Category 2 minimum arc rating is 8 cal/cm². This covers work tasks with incident energies up to 12 cal/cm².',
 null,
 'generated','exam_simulation'),

('safety-standards','ppe',3,'conceptual',3,2,
 'A technician must work inside the restricted approach boundary on energized 480V equipment. What is required?',
 '{"a":"Rubber insulating gloves rated for 480V and leather protectors only","b":"Energized electrical work permit, appropriate PPE, and a qualified second person","c":"The equipment must be de-energized — work on 480V energized is never permitted","d":"OSHA 10 certification and a 30-day waiting period"}',
 'b',
 'NFPA 70E 130.2 requires: an energized electrical work permit, justified reason why de-energizing is not feasible, appropriate PPE rated for the incident energy, and procedures are established. A qualified second person (observer) is also required when working within the restricted approach boundary.',
 'Trap: Energized work on 480V IS permitted when justified — it just requires a permit and PPE.',
 'generated','exam_simulation'),

('safety-standards','ppe',3,'conceptual',2,1,
 'Which item of PPE is required when working within the limited approach boundary on energized electrical equipment?',
 '{"a":"Full arc flash suit at minimum Category 4","b":"Safety glasses with side shields as a minimum","c":"Rubber insulating gloves rated for the voltage","d":"Face shield and leather gloves"}',
 'b',
 'NFPA 70E 130.7: Working within the limited approach boundary requires at minimum safety glasses. Additional PPE is required based on the specific task and incident energy level. Rubber gloves are required only within the restricted approach boundary.',
 'Trap: The limited boundary is the outer boundary — minimum PPE applies here, not full arc flash kit.',
 'generated','exam_simulation'),

-- Lockout/Tagout
('safety-standards','lockout-tagout',3,'conceptual',2,1,
 'Under OSHA 29 CFR 1910.147, what must be verified AFTER energy-isolating devices have been locked and tagged?',
 '{"a":"The circuit breaker nameplate matches the one-line diagram","b":"The equipment cannot be restarted and stored energy has been released","c":"A second qualified person has countersigned the lockout log","d":"The facility safety officer has approved the LOTO permit"}',
 'b',
 'After applying LOTO, the worker must VERIFY that the equipment is truly de-energized: attempt to operate the equipment (turn on switch, press start), verify zero energy with a meter, and ensure all stored energy (capacitors, springs, elevated parts) has been safely released.',
 'Trap: Verification is an active step — you must attempt to start the machine and measure zero volts.',
 'generated','exam_simulation'),

('safety-standards','lockout-tagout',3,'conceptual',3,1,
 'During a complex NETA commissioning job, three different trades each need to lock out the same disconnect. What LOTO method is used?',
 '{"a":"The senior electrician holds the single lock while others work","b":"A group lockout hasp — each worker applies their own personal lock","c":"One tagout is sufficient with all workers'' names listed","d":"The LOTO is applied only during shift changes"}',
 'b',
 'OSHA 29 CFR 1910.147(f)(3): For group lockout, a hasp is placed on the energy-isolating device and each authorized employee applies their own lock. No one can remove another worker''s lock — each must remove their own when they finish.',
 'Trap: One lock for multiple workers is a lockout violation — each worker needs their own lock.',
 'generated','exam_simulation'),

('safety-standards','lockout-tagout',3,'conceptual',2,1,
 'What is the key difference between a lockout and a tagout under OSHA LOTO standards?',
 '{"a":"Lockout is for high voltage; tagout is for low voltage","b":"A lock physically prevents re-energization; a tag is only a warning and cannot prevent re-energization","c":"Tagout requires two workers; lockout requires only one","d":"They are equivalent — either method alone meets OSHA requirements"}',
 'b',
 'A lockout device physically restrains the energy-isolating device. A tagout device only provides a warning — it CAN be removed or bypassed. OSHA requires lockout wherever possible. Tagout alone is only acceptable when the equipment design prevents lockout.',
 'Trap: They are NOT equivalent — lockout is always preferred and required when possible.',
 'generated','exam_simulation'),

('safety-standards','lockout-tagout',3,'conceptual',3,2,
 'When must an energy control procedure (LOTO procedure) be re-certified or reviewed?',
 '{"a":"Every 5 years","b":"Whenever equipment is modified or the procedure changes, and at least annually through audits","c":"Only when an incident occurs","d":"When a new employee joins the crew"}',
 'b',
 'OSHA 1910.147(c)(6): Annual inspections (audits) of energy control procedures are required. Additionally, any modification to equipment or the procedure triggers a review. The annual inspection must be performed by an authorized employee other than the one using the procedure.',
 null,
 'generated','exam_simulation'),

-- Electrically Safe Work Condition
('safety-standards','electrically-safe-work-condition',3,'conceptual',2,1,
 'Which standard defines the six steps for establishing an Electrically Safe Work Condition?',
 '{"a":"OSHA 29 CFR 1926","b":"NFPA 70E Article 120","c":"NETA ATS-2023","d":"IEEE 1584"}',
 'b',
 'NFPA 70E Article 120 defines the process for establishing an Electrically Safe Work Condition. The six steps include: determine sources, interrupt load, open disconnecting means, LOTO, release stored energy, and verify absence of voltage.',
 null,
 'generated','exam_simulation'),

('safety-standards','electrically-safe-work-condition',3,'conceptual',3,1,
 'After opening a disconnect and applying lockout, what is the LAST step before beginning work on electrical equipment?',
 '{"a":"Sign the energized work permit","b":"Verify absence of voltage using a properly rated test instrument","c":"Don arc flash PPE","d":"Notify the utility"}',
 'b',
 'NFPA 70E 120.6: The final step before touching conductors is to TEST for absence of voltage using a CAT III or CAT IV rated voltmeter at the work location. Testing must be done at each conductor — a locked-out breaker is not sufficient proof of de-energization.',
 'Trap: PPE must be worn DURING testing — but the act of verifying is the final confirmation step.',
 'generated','exam_simulation'),

('safety-standards','electrically-safe-work-condition',3,'conceptual',2,2,
 'A voltage detector (non-contact tick tracer) shows a voltage indication on a circuit that should be de-energized. What must the technician do?',
 '{"a":"Ignore it — non-contact testers are unreliable and often give false readings","b":"Treat the circuit as energized until a properly rated voltmeter confirms zero voltage","c":"Apply another LOTO lock and continue work","d":"Use a different non-contact tester to confirm"}',
 'b',
 'Any voltage indication must be treated as real until proven otherwise with a properly rated voltmeter. NFPA 70E and NETA both require using a verified, rated instrument. Non-contact testers can give false positives (capacitively coupled voltage), but they cannot be dismissed — use a rated contact voltmeter to confirm.',
 'Trap: Do not dismiss a voltage indication — always investigate with a contact voltmeter.',
 'generated','exam_simulation'),

-- Risk Assessment
('safety-standards','risk-assessment',3,'conceptual',2,2,
 'In the NFPA 70E risk assessment process, which hierarchy of risk controls is listed as most effective?',
 '{"a":"PPE","b":"Administrative controls (procedures)","c":"Elimination of the hazard","d":"Engineering controls"}',
 'c',
 'The NFPA 70E hierarchy of risk controls (from most to least effective): 1. Elimination, 2. Substitution, 3. Engineering controls, 4. Awareness, 5. Administrative controls, 6. PPE. De-energizing equipment (elimination of the electrical hazard) is always the most effective control.',
 'Trap: PPE is the LAST line of defense, not the primary control.',
 'generated','exam_simulation'),

('safety-standards','risk-assessment',3,'conceptual',3,2,
 'Before performing a NETA acceptance test on a new medium-voltage switchgear lineup, what hazard assessment must be completed?',
 '{"a":"Only a written LOTO permit is required","b":"An arc flash hazard analysis and shock risk assessment per NFPA 70E","c":"A ground resistance test of the switchgear enclosure","d":"A megger test on all bus conductors"}',
 'b',
 'NFPA 70E 130.5 requires performing both a shock risk assessment and an arc flash risk assessment before any energized electrical work. For new switchgear, this typically means reviewing the engineer''s short-circuit study and incident energy analysis.',
 null,
 'generated','exam_simulation'),

-- Approach boundaries
('safety-standards','approach-boundaries',3,'conceptual',2,1,
 'For 15kV class equipment, what is the nominal restricted approach boundary for a qualified person (uninsulated body part)?',
 '{"a":"1 inch","b":"7 inches","c":"2 feet 2 inches","d":"6 feet"}',
 'b',
 'NFPA 70E Table 130.4(D)(a): At 15kV (14.1–17.5kV phase-to-phase range), the restricted approach boundary is 7 inches. This is the distance within which only qualified persons with appropriate insulated tools may work.',
 'Trap: The limited approach boundary at 15kV is 2 ft 2 in — a common mix-up. Restricted = 7 in.',
 'generated','exam_simulation'),

('safety-standards','approach-boundaries',3,'conceptual',2,1,
 'Who is permitted to enter the arc flash boundary during energized electrical work?',
 '{"a":"Any OSHA-trained employee","b":"Only qualified persons wearing PPE rated for the incident energy","c":"Any worker wearing a hard hat and safety glasses","d":"Unqualified persons if supervised by a qualified worker"}',
 'b',
 'NFPA 70E 130.5(B): Only qualified persons wearing PPE with an arc rating greater than or equal to the incident energy may enter the arc flash boundary. Unqualified persons must stay outside the limited approach boundary unless directly supervised.',
 null,
 'generated','exam_simulation'),

-- Confined space
('safety-standards','confined-space',3,'conceptual',2,2,
 'A utility vault containing electrical equipment has one access point and requires forced ventilation to maintain safe oxygen levels. How is this space classified?',
 '{"a":"Non-permit required confined space","b":"Permit-required confined space","c":"Restricted access work area — no special permit needed","d":"Hazardous location, Class I Division 2"}',
 'b',
 'OSHA 29 CFR 1910.146: A permit-required confined space (PRCS) has at least one of: hazardous atmosphere, engulfment hazard, internal configuration that could trap a person, or any other recognized safety hazard. Utility vaults with oxygen deficiency risk qualify as PRCS.',
 null,
 'generated','exam_simulation'),

-- Isolation and grounding
('safety-standards','isolation-grounding',3,'conceptual',3,1,
 'When must temporary protective grounds (TPGs) be applied during a NETA electrical test?',
 '{"a":"Only when working on overhead lines above 69kV","b":"Whenever conductors are de-energized but could become energized from any source, including induction","c":"Only after the megger test is complete","d":"When the cable length exceeds 100 feet"}',
 'b',
 'NETA MTS and NFPA 70E both require temporary grounds whenever conductors are de-energized but back-feed, induced voltage, or re-energization from ANY source (including capacitive or inductive coupling) is possible. Grounds must be applied as close as possible to the work location.',
 'Trap: TPGs are required even on short cables if there is any possibility of induced or back-fed voltage.',
 'generated','exam_simulation'),

('safety-standards','isolation-grounding',3,'conceptual',3,2,
 'In what order must temporary protective grounds be applied and removed?',
 '{"a":"Apply from line side to load side; remove in same order","b":"Apply from load side to line side; remove load side first","c":"Apply ground-end first, then line-end; remove line-end first","d":"Apply simultaneously using a hot stick to both ends at once"}',
 'c',
 'The safe sequence for temporary grounds: APPLY the ground connection (earth) first, then connect the line conductor — so if the conductor is live, current flows to ground through the clamp, not through the worker. REMOVE line connection first, then the ground. This is the standard ''ground first, remove last'' rule.',
 'Trap: The ground (earth) end connects first and disconnects last — opposite of what seems intuitive.',
 'generated','exam_simulation'),

-- Codes and standards
('safety-standards','codes-standards',3,'conceptual',2,2,
 'NETA ATS (Acceptance Testing Specifications) is published by which organization?',
 '{"a":"IEEE","b":"OSHA","c":"InterNational Electrical Testing Association (NETA)","d":"NFPA"}',
 'c',
 'NETA (InterNational Electrical Testing Association) publishes the ATS (Acceptance Testing Specifications for Electrical Power Equipment and Systems). It is the primary standard used by electrical testing technicians for acceptance testing of new installations.',
 null,
 'generated','exam_simulation'),

('safety-standards','codes-standards',3,'conceptual',2,2,
 'Which standard provides the minimum test values for electrical insulation resistance testing of power equipment?',
 '{"a":"NFPA 70E","b":"NETA ATS Table 100.1","c":"IEEE 43","d":"OSHA 1910.147"}',
 'b',
 'NETA ATS Table 100.1 provides minimum acceptable insulation resistance values by equipment voltage class. IEEE 43 provides the method for motor/generator winding tests. NETA ATS is the go-to reference for test pass/fail criteria.',
 'Trap: IEEE 43 covers the METHOD; NETA ATS Table 100.1 covers the MINIMUM VALUES for equipment IR testing.',
 'generated','exam_simulation'),

('safety-standards','codes-standards',3,'conceptual',3,2,
 'What does IEEE 1584 specifically govern?',
 '{"a":"Insulation resistance testing procedures","b":"Arc flash hazard calculations","c":"Ground resistance testing","d":"Transformer acceptance testing"}',
 'b',
 'IEEE 1584 is the industry standard for calculating arc flash incident energy and arc flash boundaries. It provides the empirical equations used in arc flash software to determine PPE requirements based on system parameters.',
 null,
 'generated','exam_simulation'),

('safety-standards','codes-standards',3,'conceptual',2,2,
 'NFPA 70E is the standard for:',
 '{"a":"Electrical installation requirements (NEC)","b":"Electrical safety in the workplace","c":"Grounding and bonding of electrical systems","d":"Arc flash PPE manufacturing specifications"}',
 'b',
 'NFPA 70E — Standard for Electrical Safety in the Workplace — establishes requirements for safe work practices, PPE, approach boundaries, and energized electrical work permits. The NEC (NFPA 70) covers installation. These are two different standards.',
 'Trap: NFPA 70 (NEC) ≠ NFPA 70E. Installation vs. safe work practices.',
 'generated','exam_simulation'),

-- Safety equipment
('safety-standards','safety-equipment',3,'conceptual',2,2,
 'Rubber insulating gloves must be electrically tested at what maximum interval when in service?',
 '{"a":"Monthly","b":"Every 6 months","c":"Annually","d":"Every 2 years"}',
 'b',
 'ASTM F496 and OSHA 1910.137: Rubber insulating gloves in service must be electrically tested every 6 months. Gloves that have been out of service for more than 6 months must be tested before returning to use.',
 'Trap: Visual inspection is done every use — electrical testing is the 6-month requirement.',
 'generated','exam_simulation'),

('safety-standards','safety-equipment',3,'conceptual',2,2,
 'What class of rubber insulating glove is required for work on 15kV systems?',
 '{"a":"Class 00 (500V max)","b":"Class 0 (1,000V max)","c":"Class 2 (17,000V max)","d":"Class 4 (40,000V max)"}',
 'c',
 'ASTM F696 / OSHA 1910.137: Class 2 rubber insulating gloves are rated for use up to 17,000V AC (17kV). For 15kV class equipment, Class 2 is the minimum required glove class.',
 'Trap: Class 1 is rated 7,500V — not sufficient for 15kV. Class 2 covers up to 17kV.',
 'generated','exam_simulation'),

('safety-standards','safety-equipment',3,'conceptual',2,2,
 'What is the purpose of leather protector gloves worn over rubber insulating gloves?',
 '{"a":"To increase the voltage rating of the rubber gloves","b":"To protect the rubber gloves from mechanical damage (cuts, punctures)","c":"To provide grip when using hand tools","d":"To satisfy OSHA minimum PPE requirements at low voltages"}',
 'b',
 'Leather protectors are worn over rubber insulating gloves to protect the rubber from physical damage — punctures, cuts, and abrasion that could compromise the dielectric properties. They do NOT increase the electrical rating of the rubber gloves.',
 'Trap: Leather protectors do not add voltage protection — they only protect the rubber gloves physically.',
 'generated','exam_simulation'),

-- Additional lockout/safety mix
('safety-standards','lockout-tagout',3,'conceptual',3,2,
 'An authorized employee leaves the job site unexpectedly at end of shift with their personal lock still applied. Per OSHA, who may remove the lock?',
 '{"a":"The supervisor, using their own key after attempting to contact the worker","b":"Only the employee who applied the lock","c":"The employer may remove the lock following a procedure that includes contacting the employee and documenting the removal","d":"Any other authorized electrician with a bolt cutter in an emergency"}',
 'c',
 'OSHA 1910.147(e)(3): If the authorized employee who applied the lock is not available, the employer may remove it ONLY by following a documented procedure that includes: verifying the employee is not in the hazardous area, making all reasonable efforts to contact the employee, and ensuring the employee knows the lock was removed before resuming work.',
 'Trap: Only the employer with a documented procedure — NOT just any supervisor or co-worker.',
 'generated','exam_simulation'),

('safety-standards','electrically-safe-work-condition',3,'conceptual',3,2,
 'A NETA technician is testing the control wiring in a de-energized MCC with power locked out. The 120V control power transformer is also locked out. Is the IR test on control wiring exempt from LOTO?',
 '{"a":"Yes — IR testing uses safe low voltages from the megger and does not require LOTO","b":"No — the megger output can be hazardous; all precautions including LOTO and PPE still apply","c":"Yes — control wiring under 150V is excluded from OSHA LOTO","d":"Only if the IR test voltage is set below 50V"}',
 'b',
 'Megger (insulation resistance) test voltages are often 500–1000V DC — potentially lethal. LOTO must still be in place to prevent accidental re-energization from the supply side. Testing itself is a defined task within the LOTO procedure, not an exemption from it.',
 'Trap: Megger output voltage can be hazardous — LOTO protects against supply re-energization, not the test instrument.',
 'generated','exam_simulation'),

('safety-standards','ppe',3,'conceptual',2,2,
 'Which face protection is required when performing a visual inspection inside an open MV switchgear cabinet at the limited approach boundary?',
 '{"a":"No face protection required for visual inspection only","b":"Safety glasses only","c":"Arc-rated face shield or arc flash suit hood","d":"Safety glasses with side shields at minimum"}',
 'd',
 'NFPA 70E Table 130.7(C)(15)(a): At the limited approach boundary during a visual inspection of energized equipment, safety glasses with side shields are the minimum required face protection. An arc-rated face shield may be required depending on the specific task and incident energy.',
 'Trap: Safety glasses alone (without side shields) are not compliant.',
 'generated','exam_simulation'),

('safety-standards','risk-assessment',3,'conceptual',3,3,
 'The available fault current at a 480V panel is reduced by a utility change. How does this affect the arc flash incident energy?',
 '{"a":"Lower fault current always reduces incident energy","b":"Incident energy may increase because lower arcing current can extend the fault clearing time beyond the protective device''s instantaneous range","c":"Incident energy is unaffected by fault current changes","d":"Lower fault current reduces arcing current, which always reduces incident energy"}',
 'b',
 'Counterintuitively, reduced available fault current can INCREASE incident energy. If the arcing current drops below a breaker''s instantaneous trip setting, the fault clears on the time-overcurrent curve instead — potentially burning for seconds instead of milliseconds. Always re-run the arc flash study when fault current changes.',
 'Trap: Lower fault current ≠ lower incident energy. Clearing time is equally important.',
 'generated','exam_simulation'),

('safety-standards','isolation-grounding',3,'conceptual',2,2,
 'What is the minimum size copper grounding conductor permitted for temporary protective grounding at a 15kV substation?',
 '{"a":"#12 AWG","b":"#4 AWG","c":"2/0 AWG","d":"Determined by the available fault current and clearing time"}',
 'd',
 'Temporary protective ground conductor sizing is determined by the available fault current and the time the protective device takes to clear. ASTM F855 and IEEE 1246 provide sizing tables. Using an undersized ground is a life-safety hazard — the cable can burn off before the fault clears.',
 'Trap: There is no one-size-fits-all — it depends on the fault current and clearing time at that specific location.',
 'generated','exam_simulation'),

('safety-standards','codes-standards',3,'conceptual',3,3,
 'A NETA acceptance test report must be retained by the owner for how long per NETA MTS?',
 '{"a":"1 year","b":"3 years","c":"The life of the equipment","d":"10 years"}',
 'c',
 'NETA MTS (Maintenance Testing Specifications) requires test records to be maintained for the life of the equipment. These records are essential for trending, warranty claims, and regulatory compliance.',
 null,
 'generated','exam_simulation'),

('safety-standards','electrically-safe-work-condition',3,'conceptual',2,1,
 'Which of the following qualifies as stored energy that must be relieved before establishing an Electrically Safe Work Condition?',
 '{"a":"Capacitor banks charged to system voltage","b":"Only energy from the utility supply","c":"Mechanical energy in conveyor springs only","d":"Energy in battery systems does not need to be addressed"}',
 'a',
 'NFPA 70E 120.5(7): ALL forms of stored energy must be addressed — capacitors (electrical), springs (mechanical), pneumatic (air), hydraulic, thermal, chemical, and gravitational. Capacitor banks remain hazardous long after power is removed and must be discharged.',
 'Trap: Stored energy goes far beyond the supply voltage — capacitors, springs, etc. are all included.',
 'generated','exam_simulation'),

('safety-standards','ppe',3,'conceptual',2,2,
 'Arc-rated clothing must have a minimum arc thermal performance value (ATPV) equal to or greater than:',
 '{"a":"4 cal/cm² regardless of location","b":"The calculated incident energy for the specific task and work location","c":"40 cal/cm² for all MV equipment","d":"The voltage class of the equipment"}',
 'b',
 'NFPA 70E 130.5(G): The arc rating of PPE (expressed as ATPV or Ebt in cal/cm²) must be greater than or equal to the incident energy calculated for that specific task. One-size-fits-all PPE levels are not compliant — the calculation drives the PPE requirement.',
 null,
 'generated','exam_simulation');


-- ── 3. Fundamentals-theory: 27 new exam_simulation questions ───────────────

INSERT INTO questions (domain, subdomain, level, concept_type, difficulty, frequency_tier, question, options, correct_answer, explanation, trap_pattern, source, question_type) VALUES

-- Inductor circuits (very high frequency)
('fundamentals-theory','inductor-circuits',3,'calculation',3,1,
 'Three inductors — L1=6H, L2=3H, L3=2H — are connected in parallel. What is the total inductance?',
 '{"a":"11 H","b":"1 H","c":"3 H","d":"0.91 H"}',
 'b',
 '1/L_total = 1/6 + 1/3 + 1/2 = 1/6 + 2/6 + 3/6 = 6/6 = 1. Therefore L_total = 1 H.',
 null,
 'generated','exam_simulation'),

('fundamentals-theory','inductor-circuits',3,'calculation',3,1,
 'Two inductors (L1=8H and L2=8H) are connected in parallel with no mutual coupling. What is the total inductance?',
 '{"a":"16 H","b":"8 H","c":"4 H","d":"2 H"}',
 'c',
 '1/L_total = 1/8 + 1/8 = 2/8. L_total = 8/2 = 4 H. For two equal inductors in parallel, L_total = L/2.',
 'Trap: Series would give 16H; parallel of two equal inductors gives L/2 = 4H.',
 'generated','exam_simulation'),

('fundamentals-theory','inductor-circuits',3,'calculation',3,1,
 'Four 12H inductors are connected in series. What is the total inductance?',
 '{"a":"3 H","b":"12 H","c":"48 H","d":"144 H"}',
 'c',
 'For series inductors (no mutual coupling): L_total = L1+L2+L3+L4 = 12+12+12+12 = 48H.',
 'Trap: Series adds inductances — it does NOT divide like parallel resistance.',
 'generated','exam_simulation'),

-- Three-phase power
('fundamentals-theory','three-phase-power',3,'calculation',3,1,
 'A balanced three-phase load draws 200A from a 4160V system. What is the apparent power (kVA)?',
 '{"a":"832 kVA","b":"1,441 kVA","c":"2,498 kVA","d":"4,157 kVA"}',
 'b',
 'S = √3 × V_LL × I = 1.732 × 4,160 × 200 = 1,441,254 VA ≈ 1,441 kVA.',
 null,
 'generated','exam_simulation'),

('fundamentals-theory','three-phase-power',3,'calculation',3,1,
 'A 500 kVA load has a power factor of 0.8 lagging. What is the reactive power (kVAR)?',
 '{"a":"300 kVAR","b":"400 kVAR","c":"500 kVAR","d":"625 kVAR"}',
 'a',
 'P = S × PF = 500 × 0.8 = 400 kW. Q = √(S²-P²) = √(500²-400²) = √(250,000-160,000) = √90,000 = 300 kVAR.',
 'Trap: 400kW is real power, not reactive. Reactive = √(S²-P²).',
 'generated','exam_simulation'),

('fundamentals-theory','three-phase-power',3,'calculation',4,1,
 'A 2,400V single-phase load draws 50kW at 0.9 power factor lagging. What current does it draw?',
 '{"a":"18.5A","b":"20.6A","c":"23.1A","d":"27.8A"}',
 'c',
 'P = V × I × PF. I = P / (V × PF) = 50,000 / (2,400 × 0.9) = 50,000 / 2,160 = 23.15A ≈ 23.1A.',
 null,
 'generated','exam_simulation'),

-- Fault current
('fundamentals-theory','fault-current',3,'calculation',4,1,
 'A 100 kVA, 13.8kV/480V transformer has 5% impedance. What is the maximum three-phase fault current at the 480V secondary terminals (assume infinite bus)?',
 '{"a":"601A","b":"2,406A","c":"12,028A","d":"20,047A"}',
 'b',
 'I_FLA (secondary) = S / (√3 × V) = 100,000 / (1.732 × 480) = 120.3A. I_fault = I_FLA / %Z = 120.3 / 0.05 = 2,406A.',
 'Trap: Use %Z as a decimal (0.05), not the whole number (5). Divide I_FLA by 0.05.',
 'generated','exam_simulation'),

('fundamentals-theory','fault-current',3,'calculation',3,1,
 'A transformer with a secondary FLA of 800A has a nameplate impedance of 4%. What is the maximum three-phase fault current at the secondary terminals?',
 '{"a":"3,200A","b":"8,000A","c":"20,000A","d":"32,000A"}',
 'c',
 'I_fault = I_FLA / %Z = 800A / 0.04 = 20,000A. This assumes infinite bus (utility impedance = 0).',
 'Trap: 4% = 0.04, not 4.0. Divide I_FLA by the decimal form of %Z.',
 'generated','exam_simulation'),

-- Harmonics
('fundamentals-theory','harmonics',3,'conceptual',3,2,
 'Why does the 87 (differential) transformer protection relay use second harmonic restraint?',
 '{"a":"To prevent tripping during normal load surges","b":"To distinguish inrush current (rich in 2nd harmonics) from a true fault current, preventing a false trip","c":"To detect CT saturation on the primary side","d":"To measure the phase angle between primary and secondary current"}',
 'b',
 'Transformer inrush current at energization is high-magnitude and contains significant 2nd harmonic content (approximately 20% or more). The 87 relay''s 2nd harmonic restraint detects this signature and blocks the trip, preventing false operations. True fault current has very little harmonic content.',
 null,
 'generated','exam_simulation'),

('fundamentals-theory','harmonics',3,'conceptual',3,2,
 'A VFD (Variable Frequency Drive) generates voltage and current harmonics. Which harmonic orders are most commonly produced by a 6-pulse VFD?',
 '{"a":"2nd and 4th","b":"5th and 7th","c":"3rd and 9th","d":"1st and 3rd"}',
 'b',
 'A 6-pulse VFD (the most common type) produces characteristic harmonics at orders: 6n±1 = 5th, 7th, 11th, 13th... The 5th and 7th are the largest and most problematic. Zero-sequence triplen harmonics (3rd, 9th) are common in single-phase nonlinear loads, not 3-phase VFDs.',
 'Trap: Three-phase VFDs produce 5th/7th (not 3rd) because the balanced three-phase system cancels triplen harmonics.',
 'generated','exam_simulation'),

-- AC/DC circuits
('fundamentals-theory','ac-dc-circuits',3,'conceptual',3,2,
 'In an AC circuit, current lags the voltage by 45°. What does this indicate about the circuit impedance?',
 '{"a":"The circuit is purely resistive","b":"The circuit is purely inductive","c":"The circuit has equal resistance and inductive reactance (R = XL)","d":"The circuit is capacitive with PF of 0.707"}',
 'c',
 'A 45° lagging phase angle means the circuit is inductive and the power factor = cos(45°) = 0.707. A 45° lag means R = XL (the resistive and inductive components are equal). Purely inductive = 90° lag; purely resistive = 0°.',
 null,
 'generated','exam_simulation'),

('fundamentals-theory','ac-dc-circuits',3,'calculation',3,2,
 'A resistor (R=8Ω) and inductor (XL=6Ω) are connected in series. What is the circuit impedance?',
 '{"a":"14Ω","b":"10Ω","c":"7.2Ω","d":"2Ω"}',
 'b',
 'Z = √(R²+XL²) = √(64+36) = √100 = 10Ω. Series R-L impedance uses the Pythagorean theorem — you cannot simply add R and XL.',
 'Trap: R+XL = 14Ω only for DC or in-phase quantities. For AC, use Z=√(R²+XL²).',
 'generated','exam_simulation'),

-- Insulation systems
('fundamentals-theory','insulation-systems',3,'conceptual',2,2,
 'What is the Polarization Index (PI), and what minimum value indicates acceptable insulation for a rotating machine?',
 '{"a":"PI = 1-min IR / 10-min IR; minimum acceptable PI is 4.0","b":"PI = 10-min IR / 1-min IR; minimum acceptable PI is 2.0","c":"PI = 10-min IR / 1-min IR; minimum acceptable PI is 1.0","d":"PI = 30-min IR / 10-min IR; minimum acceptable PI is 1.5"}',
 'b',
 'Per IEEE 43: PI = (IR at 10 minutes) / (IR at 1 minute). For class A insulation, PI ≥ 2.0 is the minimum acceptable value. A PI close to 1.0 indicates contaminated or deteriorated insulation.',
 'Trap: PI is 10-min divided by 1-min (not the reverse). Minimum is 2.0 for rotating machines.',
 'generated','exam_simulation'),

('fundamentals-theory','insulation-systems',3,'conceptual',2,2,
 'A transformer winding IR test reads 5,000 MΩ at the start of testing and 50,000 MΩ after 10 minutes. What does this trend indicate?',
 '{"a":"The insulation is failing — resistance should decrease over time","b":"Normal and good — resistance increasing over time indicates dry, clean insulation","c":"The test instrument is malfunctioning","d":"The winding is contaminated with moisture"}',
 'b',
 'In a healthy, dry insulation system, IR rises with time as the capacitive charging current dissipates and only leakage current remains. Insulation resistance that increases over time indicates clean, uncontaminated insulation. A flat or declining curve indicates contamination or moisture.',
 'Trap: Increasing IR over time = GOOD. Flat or decreasing = problem.',
 'generated','exam_simulation'),

-- Resistance testing
('fundamentals-theory','resistance-testing',3,'conceptual',2,2,
 'What test method is used to measure the contact resistance of a circuit breaker main contacts?',
 '{"a":"Megger insulation resistance test at 2,500V","b":"Micro-ohmmeter (DLRO) using a calibrated DC current injection","c":"4-wire Kelvin resistance bridge at 60Hz","d":"Power factor test at rated voltage"}',
 'b',
 'Contact resistance (also called loop resistance or contact resistance) of circuit breaker main contacts is measured with a micro-ohmmeter (Digital Low Resistance Ohmmeter, DLRO) using the 4-wire Kelvin method and a known DC injection current (typically 10–100A or per manufacturer spec). The 4-wire method eliminates lead resistance.',
 'Trap: A megger measures insulation resistance — completely different purpose. DLRO measures milli-ohm to micro-ohm contact resistance.',
 'generated','exam_simulation'),

-- Thermographic survey
('fundamentals-theory','thermographic-survey',3,'conceptual',2,2,
 'Which load condition produces the most meaningful thermographic survey results?',
 '{"a":"At no-load to establish baseline temperatures","b":"At or near full load (minimum 40% of rated)","c":"During a scheduled outage with the equipment energized but unloaded","d":"Load level does not matter — thermal anomalies are detectable at any load"}',
 'b',
 'Thermographic surveys require the equipment to be carrying sufficient load to reveal thermal anomalies. NETA and NFPA 70B recommend minimum 40% of rated load, ideally at normal operating load. A loose connection or high-resistance joint produces negligible heat at low current.',
 'Trap: Thermal imaging at no-load or very low load misses resistance-related heating — current creates the heat.',
 'generated','exam_simulation'),

-- CT ratio math
('fundamentals-theory','ct-ratio-math',3,'calculation',3,1,
 'A 1,200:5 CT is connected in a test circuit. The actual current in the primary conductor is 600A. What current should the secondary meter read?',
 '{"a":"2.5A","b":"5A","c":"250A","d":"1,200A"}',
 'a',
 'CT secondary current = (primary current / CT ratio primary) × CT ratio secondary = (600/1200) × 5 = 0.5 × 5 = 2.5A.',
 'Trap: With 600A on a 1200:5 CT, the secondary reads 2.5A — not 5A (which would be full ratio at 1,200A primary).',
 'generated','exam_simulation'),

('fundamentals-theory','ct-ratio-math',3,'calculation',3,1,
 'A test technician needs to inject 100A through a 2000:5 ratio CT to verify relay operation. The test set can only produce a maximum of 25A. How many passes of the conductor through the CT window are required?',
 '{"a":"2 passes","b":"4 passes","c":"8 passes","d":"25 passes"}',
 'b',
 'Each pass through the CT window acts as an additional primary turn, multiplying the apparent current. Needed passes = Required primary current / Test set output = 100A / 25A = 4 passes. With 4 passes at 25A, the CT sees 100A equivalent.',
 null,
 'generated','exam_simulation'),

-- System tests
('fundamentals-theory','system-tests-analysis',3,'conceptual',2,2,
 'A Dielectric Absorption Ratio (DAR) is defined as:',
 '{"a":"IR at 30 seconds divided by IR at 60 seconds","b":"IR at 60 seconds divided by IR at 30 seconds","c":"IR at 1 minute divided by IR at 30 seconds","d":"IR at 30 seconds divided by IR at 1 minute"}',
 'b',
 'DAR = IR at 60 seconds / IR at 30 seconds. A DAR ≥ 1.25 typically indicates acceptable insulation. The DAR is a quick version of the PI test, taking only 1 minute total.',
 'Trap: DAR uses 60-second / 30-second (not 10-minute / 1-minute, which is PI).',
 'generated','exam_simulation'),

-- Current injection
('fundamentals-theory','current-injection',3,'conceptual',3,2,
 'Primary injection testing of a circuit breaker trip unit verifies which of the following?',
 '{"a":"Only the breaker contact resistance","b":"The complete trip circuit including CT, relay, wiring, and breaker trip mechanism","c":"Only the electronic trip unit programming","d":"The breaker frame interrupting rating"}',
 'b',
 'Primary injection tests flow current through the entire protection circuit — the CT, the protective relay (or trip unit), the wiring, and the breaker trip coil/mechanism — exactly as in a real fault. This end-to-end test verifies the complete system, not just the relay or breaker individually.',
 'Trap: Secondary injection only tests the relay. Primary injection tests the ENTIRE loop including CT and trip mechanism.',
 'generated','exam_simulation'),

-- Fundamentals of electricity
('fundamentals-theory','fundamentals-electricity',3,'conceptual',2,2,
 'What causes skin effect in AC conductors?',
 '{"a":"The resistance of the conductor increasing due to heat","b":"Alternating magnetic fields inducing opposing currents inside the conductor, driving current toward the outer surface","c":"Capacitive coupling between adjacent conductors","d":"The insulation preventing current from flowing through the conductor core"}',
 'b',
 'Skin effect occurs because the alternating current in a conductor creates an alternating magnetic field inside the conductor. This induces opposing eddy currents in the center, effectively increasing the resistance in the core and forcing current to flow near the outer surface (the ''skin''). At 60Hz, skin effect is significant in large conductors.',
 null,
 'generated','exam_simulation'),

('fundamentals-theory','fundamentals-electricity',3,'conceptual',2,2,
 'The RMS value of a sinusoidal AC voltage is the value that:',
 '{"a":"Equals the peak voltage divided by √2","b":"Produces the same heating effect in a resistor as an equivalent DC voltage of the same value","c":"Is the average of the positive half cycle","d":"Both A and B are correct"}',
 'd',
 'Both statements are correct. RMS = V_peak/√2 (approximately 0.707 × peak). Also, by definition, RMS voltage produces the same power dissipation (heating) in a pure resistor as an equivalent DC voltage. These are two ways to express the same relationship.',
 null,
 'generated','exam_simulation'),

-- Power factor / power triangle
('fundamentals-theory','power-triangle',3,'conceptual',2,2,
 'A power factor of 0.85 lagging means that:',
 '{"a":"The load is 85% capacitive","b":"Current lags voltage by cos⁻¹(0.85) ≈ 32°, indicating an inductive load","c":"85% of the power is lost as heat","d":"The reactive power is 85% of the apparent power"}',
 'b',
 'Power factor = cos(θ), where θ is the phase angle between current and voltage. PF=0.85 lagging means cos(θ)=0.85, so θ=31.8°. Lagging current = inductive load. PF represents the ratio of real power to apparent power (P/S), not an efficiency or loss percentage.',
 'Trap: "Lagging" means inductive — current lags voltage. Capacitive loads have leading power factor.',
 'generated','exam_simulation'),

('fundamentals-theory','power-triangle',3,'calculation',3,2,
 'A 100 kW load has a power factor of 0.6 lagging. What is the reactive power?',
 '{"a":"60 kVAR","b":"80 kVAR","c":"100 kVAR","d":"133 kVAR"}',
 'd',
 'S = P/PF = 100/0.6 = 166.7 kVA. Q = √(S²-P²) = √(166.7²-100²) = √(27,789-10,000) = √17,789 ≈ 133 kVAR.',
 'Trap: At PF=0.6, the reactive component is larger than the real power — the power triangle is dominated by reactive power.',
 'generated','exam_simulation'),

-- Leading/lagging
('fundamentals-theory','ac-dc-circuits',3,'conceptual',2,2,
 'On a waveform display, the current waveform crosses zero AFTER the voltage waveform. What does this indicate?',
 '{"a":"Capacitive load — current leads voltage","b":"Inductive load — current lags voltage","c":"Resistive load — unity power factor","d":"The circuit has harmonics"}',
 'b',
 'If current crosses zero AFTER voltage (i.e., current reaches its peaks later than voltage), current LAGS voltage — this is an inductive load. Memory aid: "ELI the ICE man" — in an inductor (L), voltage (E) leads current (I); in a capacitor (C), current (I) leads voltage (E).',
 'Trap: The one that comes FIRST is the one that LEADS. Current after voltage = current lags.',
 'generated','exam_simulation'),

-- Ohm''s law / DC fundamentals
('fundamentals-theory','ohms-law-dc',3,'calculation',2,2,
 'Three resistors (R1=10Ω, R2=20Ω, R3=30Ω) are connected in parallel across 120V. What is the total current drawn from the source?',
 '{"a":"2A","b":"6A","c":"20A","d":"22A"}',
 'd',
 'I_total = V/R1 + V/R2 + V/R3 = 120/10 + 120/20 + 120/30 = 12 + 6 + 4 = 22A. For parallel circuits, the total current is the sum of branch currents.',
 null,
 'generated','exam_simulation'),

-- Resonance (RLC circuits)
('fundamentals-theory','inductance-capacitance',3,'conceptual',3,2,
 'In a series RLC circuit at resonance, what is the relationship between inductive reactance (XL) and capacitive reactance (XC)?',
 '{"a":"XL is twice XC","b":"XL equals XC — they cancel, leaving only resistance R in the circuit","c":"XL is zero; only XC and R remain","d":"XC is zero; only XL and R remain"}',
 'b',
 'At resonance, XL = XC. The inductive and capacitive reactances are equal in magnitude and opposite in effect, so they cancel. Total impedance Z = R only. Current is at maximum, power factor = 1.0.',
 'Trap: At resonance, BOTH XL and XC exist and are equal — they cancel each other, they do not disappear.',
 'generated','exam_simulation');


-- ── 4. Systems-commissioning: 33 new exam_simulation questions ─────────────

INSERT INTO questions (domain, subdomain, level, concept_type, difficulty, frequency_tier, question, options, correct_answer, explanation, trap_pattern, source, question_type) VALUES

-- Commissioning process
('systems-commissioning','commissioning-process',3,'conceptual',2,1,
 'What is the primary difference between an acceptance test and a maintenance test?',
 '{"a":"Acceptance tests use higher test voltages than maintenance tests","b":"Acceptance tests verify new equipment meets specifications before energization; maintenance tests verify continued serviceability of in-service equipment","c":"Maintenance tests require a utility shutdown; acceptance tests do not","d":"They are the same — only the name differs based on who performs the test"}',
 'b',
 'NETA ATS (Acceptance Testing Specifications) covers new equipment being commissioned. NETA MTS (Maintenance Testing Specifications) covers in-service equipment at periodic intervals. Acceptance tests typically use higher test voltages (new equipment standards); maintenance values are lower to avoid stressing aged insulation.',
 'Trap: Acceptance = new installation; Maintenance = in-service periodic testing. Test voltage levels differ.',
 'generated','exam_simulation'),

('systems-commissioning','commissioning-process',3,'conceptual',2,2,
 'During a NETA acceptance test of a new substation, what document records the as-found condition of all tested equipment?',
 '{"a":"The one-line diagram","b":"The test report","c":"The equipment nameplate","d":"The commissioning checklist only"}',
 'b',
 'The NETA test report documents: equipment identification, test conditions, as-found data, test results, and the technician''s signature. It becomes the baseline for all future maintenance tests. Without a baseline test report, trending is impossible.',
 null,
 'generated','exam_simulation'),

('systems-commissioning','commissioning-process',3,'conceptual',3,2,
 'What is the correct sequence of commissioning activities for a new medium-voltage transformer?',
 '{"a":"Energize, test, inspect, document","b":"Inspect (visual), test (de-energized), document, energize, verify (energized)","c":"Test at rated voltage, inspect contacts, de-energize, document","d":"Document nameplate data, energize, verify metering, perform insulation test"}',
 'b',
 'Standard commissioning sequence: 1) Visual inspection (de-energized), 2) De-energized tests (IR, TTR, contact resistance, etc.), 3) Document as-found results, 4) Energize, 5) Energized verification (metering, protection, function tests). Never energize before completing de-energized tests.',
 'Trap: Energize before testing is backwards — de-energized tests always precede energization.',
 'generated','exam_simulation'),

('systems-commissioning','commissioning-process',3,'conceptual',2,2,
 'What is the purpose of a pre-energization checklist before commissioning a new switchgear lineup?',
 '{"a":"To verify the equipment has been properly tested and all deficiencies resolved before applying power","b":"To document the hourly billing charges for the commissioning crew","c":"To satisfy the equipment warranty requirements only","d":"To establish the arc flash boundary for the equipment"}',
 'a',
 'The pre-energization checklist ensures all acceptance tests have been completed and passed, all identified deficiencies have been corrected, documentation is in order, and proper clearances have been obtained before applying power to the new equipment.',
 null,
 'generated','exam_simulation'),

-- Functional testing
('systems-commissioning','functional-testing',3,'conceptual',2,1,
 'A functional test of a protective relay system verifies:',
 '{"a":"Only that the relay trips at the correct pickup current","b":"That the complete protection scheme operates correctly end-to-end, including relay, wiring, breaker trip coil, and breaker mechanism","c":"That the relay panel is properly grounded","d":"Only that the relay settings match the coordination study"}',
 'b',
 'Functional (operational) testing proves that the entire protection system works as a system: the relay detects the fault condition, sends the trip signal, the wiring carries the signal, the trip coil energizes, and the breaker opens. Relay-only testing (secondary injection) does not verify the full chain.',
 null,
 'generated','exam_simulation'),

('systems-commissioning','functional-testing',3,'conceptual',3,2,
 'During a transformer differential relay functional test, a secondary current injection simulates a fault. The relay pickup is verified but the breaker does NOT trip. What is the most likely cause?',
 '{"a":"Incorrect relay settings","b":"An open circuit in the trip wiring or a failed breaker trip coil","c":"The CT ratio is wrong","d":"The relay is measuring voltage, not current"}',
 'b',
 'If the relay operates (picks up/targets) but the breaker does not trip, the issue is downstream of the relay — typically an open circuit in the trip wiring between relay contact and trip coil, or a burned/failed trip coil. The relay itself is working; the trip chain is broken.',
 'Trap: If relay picks up but breaker doesn''t trip, the relay is OK — investigate trip wiring and trip coil.',
 'generated','exam_simulation'),

('systems-commissioning','functional-testing',3,'conceptual',2,2,
 'What does a trip circuit supervision relay (TCSR) monitor?',
 '{"a":"The relay settings to verify they match the coordination study","b":"The continuity of the trip circuit wiring and trip coil under normal (non-fault) conditions","c":"The CT secondary currents for saturation","d":"The breaker mechanism spring charge status"}',
 'b',
 'A Trip Circuit Supervision Relay continuously monitors the trip circuit path (relay contacts, wiring, trip coil) for continuity. If an open develops in the trip circuit, the TCSR alarms before a fault occurs — preventing a situation where a fault occurs but the breaker cannot trip.',
 null,
 'generated','exam_simulation'),

-- Troubleshooting
('systems-commissioning','troubleshooting',3,'conceptual',3,1,
 'A circuit breaker fails to close remotely but closes correctly when operated manually from the breaker door. What is the most likely cause?',
 '{"a":"Defective main contacts","b":"An open circuit in the remote close wiring or a faulty close coil","c":"The breaker spring is not charged","d":"Incorrect relay settings preventing the close command"}',
 'b',
 'If manual operation works but remote close fails, the issue is in the remote control circuit — open wiring to the close coil, blown control fuse, or a failed close coil (solenoid). The breaker mechanism itself is functional since manual operation succeeds.',
 'Trap: Manual works = mechanism OK. Remote fails = investigate control circuit (wiring, fuse, coil).',
 'generated','exam_simulation'),

('systems-commissioning','troubleshooting',3,'conceptual',3,1,
 'A ground fault relay (51G) trips repeatedly on a feeder with no apparent load fault. What is the most likely cause?',
 '{"a":"The 51G pickup setting is correct but the feeder is overloaded","b":"Charged capacitance on a long cable feeder causes normal capacitive charging current to exceed the 51G pickup","c":"The 51G relay is detecting a phase-to-phase fault","d":"The instrument transformer ratio is mismatched"}',
 'b',
 'Long cables have significant capacitance. At energization or during normal operation, the capacitive charging current of a long cable flows in the ground path (zero sequence). If this charging current exceeds the sensitive 51G (time overcurrent ground) pickup setting, nuisance trips occur. Solution: raise the pickup or install a time delay.',
 'Trap: Ground current on a cable system with no fault = capacitive charging current is a known cause of 51G nuisance trips.',
 'generated','exam_simulation'),

('systems-commissioning','troubleshooting',3,'conceptual',3,2,
 'During commissioning, a megger test on a new cable reads 50 MΩ — much lower than expected for a new cable. What steps should be taken before concluding the cable is defective?',
 '{"a":"Replace the cable immediately","b":"Verify the test connections, check that the far end is open (not grounded), and confirm ambient temperature and humidity","c":"Increase the megger voltage to force the reading up","d":"Accept the reading — 50 MΩ is within spec for any cable"}',
 'b',
 'Low IR readings on a new cable often result from test errors: far end grounded, moisture on terminations, wet conditions, or connected equipment still attached. Always verify test setup before condemning new equipment. Temperature correction may also be required.',
 null,
 'generated','exam_simulation'),

-- SCADA / DCS
('systems-commissioning','scada-dcs',3,'conceptual',2,2,
 'What does SCADA stand for, and what is its primary function in an electrical substation?',
 '{"a":"System Control and Data Automation — controls relay settings remotely","b":"Supervisory Control and Data Acquisition — monitors and controls substation equipment from a remote control center","c":"Structured Control and Digital Analysis — analyzes power quality data","d":"Substation Control and Digital Automation — automates transformer tap changes only"}',
 'b',
 'SCADA (Supervisory Control and Data Acquisition) provides remote monitoring and control of substation equipment — breaker status, measurements, alarms — from a central control room. It does not replace local protection but adds remote visibility and control capability.',
 null,
 'generated','exam_simulation'),

('systems-commissioning','scada-dcs',3,'conceptual',2,2,
 'A SCADA system shows a circuit breaker as OPEN but field inspection confirms it is CLOSED. What is the most likely cause?',
 '{"a":"The breaker is internally damaged","b":"The breaker auxiliary contact (52a or 52b) indicating circuit is open or wired incorrectly","c":"SCADA databases always have a 15-minute lag","d":"The SCADA master station needs rebooting"}',
 'b',
 'Breaker status is conveyed to SCADA via auxiliary contacts (52a = closes when breaker closes; 52b = closes when breaker opens). A discrepancy between SCADA status and field position indicates a problem with the auxiliary contact circuit — open wiring, failed contact, or incorrect wiring (52a vs 52b mix-up).',
 'Trap: The breaker itself is fine if it physically operates — investigate the 52a/52b auxiliary contact circuit.',
 'generated','exam_simulation'),

-- Power quality monitoring
('systems-commissioning','power-quality-monitoring',3,'conceptual',2,2,
 'A power quality monitor records a sag to 70% of nominal voltage lasting 8 cycles. How is this event classified per IEEE 1159?',
 '{"a":"Interruption","b":"Voltage sag (dip)","c":"Undervoltage","d":"Transient"}',
 'b',
 'IEEE 1159: A voltage sag is a decrease in RMS voltage to 10–90% of nominal lasting 0.5 cycles to 1 minute. At 70% and 8 cycles (133ms), this is a sag. An interruption is <10%; undervoltage is a longer-duration steady-state reduction.',
 'Trap: Sag = 10-90% for 0.5 cycles to 1 min. Interruption = below 10%. Undervoltage = steady-state below nominal.',
 'generated','exam_simulation'),

('systems-commissioning','power-quality-monitoring',3,'conceptual',3,2,
 'What instrument is used to measure total harmonic distortion (THD) in a power system?',
 '{"a":"Clamp-on ammeter","b":"True RMS voltmeter","c":"Power quality analyzer or harmonic analyzer","d":"Megger insulation resistance tester"}',
 'c',
 'A power quality analyzer (harmonic analyzer) captures the waveform and performs a Fourier analysis to determine the magnitude of each harmonic component and calculates THD. A true RMS meter measures the combined effect of harmonics but cannot identify individual harmonic orders.',
 'Trap: True RMS meters measure the total RMS (including harmonics) but cannot analyze harmonic spectrum.',
 'generated','exam_simulation'),

-- One-line diagrams
('systems-commissioning','one-line-diagrams',3,'conceptual',2,2,
 'On a one-line diagram, what does a circle with an "X" inside typically represent?',
 '{"a":"A transformer","b":"A circuit breaker","c":"A fuse","d":"A motor"}',
 'c',
 'Standard one-line diagram symbols: fuse = circle with X (or rectangle with diagonal line), circuit breaker = rectangle or square, transformer = two circles (or interlocked circles). Conventions can vary by standard (ANSI/IEC), but the circle-X for fuse is very common in NETA test context.',
 null,
 'generated','exam_simulation'),

('systems-commissioning','one-line-diagrams',3,'conceptual',2,2,
 'A one-line diagram shows a 52 inside a box on a feeder. What does this represent?',
 '{"a":"A 52Ω impedance in the feeder","b":"An AC circuit breaker (ANSI device number 52)","c":"A current transformer with 52A rating","d":"A 52kV voltage class disconnect"}',
 'b',
 'ANSI device number 52 = AC circuit breaker. On one-line diagrams, ANSI device numbers are placed inside boxes to identify the function of the device. Device 52 is specifically an AC circuit breaker (not a disconnect or fuse).',
 'Trap: ANSI 52 = AC CIRCUIT BREAKER, not a voltage or impedance value.',
 'generated','exam_simulation'),

-- NETA ECS / standards
('systems-commissioning','neta-ecs',3,'conceptual',2,2,
 'NETA ECS (Electrical Commissioning Specifications) primarily covers:',
 '{"a":"Safety PPE requirements for commissioning crews","b":"Pre-energization inspections and tests for newly installed electrical systems","c":"Maintenance intervals for in-service electrical equipment","d":"Training requirements for NETA-certified technicians"}',
 'b',
 'NETA ECS (Electrical Commissioning Specifications for Electrical Power Equipment and Systems) focuses on the commissioning of newly installed equipment before energization — what to inspect, how to test, and what results constitute acceptance.',
 null,
 'generated','exam_simulation'),

-- Sectionalizers/reclosers
('systems-commissioning','sectionalizers-reclosers',3,'conceptual',3,2,
 'A distribution recloser is programmed for 2 fast operations followed by 2 delayed operations before lockout. A permanent fault occurs. How does the recloser respond?',
 '{"a":"It trips immediately to lockout without reclosing","b":"It performs 2 fast trip-reclose cycles, then 2 delayed trip-reclose cycles, then locks out open on the 5th trip","c":"It counts 4 fault interruptions and then locks out open","d":"It signals the substation breaker to trip instead"}',
 'b',
 'The recloser performs its programmed sequence: fast trip→reclose, fast trip→reclose, delayed trip→reclose, delayed trip→reclose. If the fault persists through all operations, it locks out on the final (5th) trip. A temporary fault should clear during one of the fast operations.',
 'Trap: The sequence is 2+2+lockout = 4 reclose attempts, 5th trip = lockout. Count carefully.',
 'generated','exam_simulation'),

('systems-commissioning','sectionalizers-reclosers',3,'conceptual',2,2,
 'How does a sectionalizer differ from a recloser in clearing a fault?',
 '{"a":"A sectionalizer trips faster than a recloser","b":"A sectionalizer interrupts fault current; a recloser only counts fault events","c":"A sectionalizer counts interruptions made by an upstream recloser and opens during the dead time — it cannot interrupt fault current","d":"They are functionally identical — only the manufacturer differs"}',
 'c',
 'A sectionalizer CANNOT interrupt fault current — it has no fault interrupting rating. Instead, it counts the number of fault current interruptions by an upstream recloser. After the programmed count is reached, it opens during the next dead time (when the recloser has opened and the circuit is de-energized), isolating the faulted section.',
 'Trap: Sectionalizer = count and isolate during dead time (no fault interrupting). Recloser = actually interrupts fault current.',
 'generated','exam_simulation'),

-- Commissioning phases
('systems-commissioning','commissioning-phases',3,'conceptual',2,2,
 'What is the purpose of the "witnessed energization" phase in substation commissioning?',
 '{"a":"To satisfy the utility interconnection agreement","b":"To verify that all protection, control, metering, and communication systems function correctly under live conditions with responsible parties present","c":"To allow the customer to sign the completion certificate","d":"To document any equipment damage from the construction phase"}',
 'b',
 'Witnessed energization involves the commissioning engineer, owner''s representative, and often the utility verifying live system operation: protection relay targets clear, metering reads correctly, communication to SCADA is confirmed, and all control operations (open/close breakers) function as designed.',
 null,
 'generated','exam_simulation'),

-- Troubleshooting (additional)
('systems-commissioning','troubleshooting',3,'conceptual',3,2,
 'After replacing a fuse in a motor control circuit, the motor runs briefly then trips on overload. The overload relay is within spec. What should the technician investigate?',
 '{"a":"Increase the overload relay setpoint","b":"Check for a mechanical load issue causing overcurrent — the motor may be overloaded","c":"Replace the overload relay","d":"Check power quality for voltage sags"}',
 'b',
 'If the relay setting is correct but the motor repeatedly trips on overload, the overcurrent is real — the motor is drawing too much current. The cause is typically mechanical: a jammed load, excessive friction, incorrect drive ratio, or process overload. Increasing the relay setpoint masks a real problem and can damage the motor.',
 'Trap: Correct relay setpoint + overload trip = real overload condition. Investigate the LOAD, not the relay.',
 'generated','exam_simulation'),

('systems-commissioning','troubleshooting',3,'conceptual',3,2,
 'A new installation of a 15kV cable tests at 800 MΩ IR during acceptance testing. Six months later, a maintenance test reads 2 MΩ. What does this indicate?',
 '{"a":"Normal aging — insulation resistance decreases slightly over time","b":"Significant insulation degradation — likely moisture ingress, contamination, or physical damage","c":"The maintenance test was performed with the wrong megger voltage","d":"Temperature difference between the two tests explains the change"}',
 'b',
 'A decrease from 800 MΩ to 2 MΩ (400x reduction) over 6 months is NOT normal aging. This rapid, dramatic decrease indicates a developing fault — most likely moisture ingress at a termination or splice, physical damage to the insulation, or contamination. Immediate further investigation (hi-pot, TDR, visual) is warranted.',
 'Trap: Temperature causes ~2x change per 10°C — not a 400x drop. This is a real problem.',
 'generated','exam_simulation'),

-- Functional testing (more)
('systems-commissioning','functional-testing',3,'conceptual',2,2,
 'During acceptance testing of a differential relay (87T), secondary injection is performed on only the X-side CT inputs. The relay should:',
 '{"a":"Trip immediately — any differential current should trip","b":"Not trip — there is restraint current from the H-side but no operating current; the relay should see a through-fault condition","c":"Alarm but not trip — 87T does not use secondary injection","d":"Trip if the injected current exceeds 10% of rated CT current"}',
 'b',
 'An 87 differential relay operates on the DIFFERENCE between H-side and X-side currents. If only the X-side is injected with matching restraint on H-side, the relay sees balanced currents (no differential) and should restrain. The relay should only trip if unbalanced current (differential/operating current) appears.',
 'Trap: 87T operates on differential (unbalanced) current — balanced injection = no trip.',
 'generated','exam_simulation'),

-- SCADA additional
('systems-commissioning','scada-hmi',3,'conceptual',2,2,
 'What is an HMI in the context of SCADA systems?',
 '{"a":"High Megaohm Insulator — used in IR testing","b":"Human-Machine Interface — the operator display and control screen for the SCADA system","c":"High-speed Motor Interlock — prevents motor restart after a fault","d":"Harmonic Mitigation Installation — filters for VFD harmonics"}',
 'b',
 'HMI (Human-Machine Interface) is the graphical display and operator interface of a SCADA system. Operators view system status, alarm conditions, and issue control commands through the HMI. Modern HMIs use PC-based touchscreen software.',
 null,
 'generated','exam_simulation'),

-- Power quality (more)
('systems-commissioning','power-quality-monitoring',3,'conceptual',3,2,
 'What is the IEEE 519 limit for total harmonic distortion (THD-I) at the point of common coupling (PCC) for a system with ISC/IL ratio greater than 100?',
 '{"a":"5%","b":"8%","c":"15%","d":"20%"}',
 'c',
 'IEEE 519-2022 Table 2: For systems with ISC/IL > 100 (large customer relative to utility fault capacity), the total demand distortion (TDD) limit is 15% at the PCC. For smaller customers (ISC/IL < 20), the limit is more restrictive at 5%.',
 null,
 'generated','exam_simulation'),

-- Commissioning process (additional)
('systems-commissioning','commissioning-process',3,'conceptual',2,2,
 'What document specifies the required tests, test procedures, and acceptance criteria for NETA acceptance testing?',
 '{"a":"IEEE C57.12 — Transformer Standards","b":"NETA ATS (Acceptance Testing Specifications)","c":"NFPA 70 (National Electrical Code)","d":"OSHA 1910.303"}',
 'b',
 'NETA ATS (Acceptance Testing Specifications for Electrical Power Equipment and Systems) is the defining document for acceptance testing. It specifies what equipment to test, what tests to perform, what procedures to use, and the minimum acceptable values (e.g., insulation resistance tables).',
 null,
 'generated','exam_simulation'),

('systems-commissioning','commissioning-process',3,'conceptual',3,3,
 'During acceptance testing of a new 13.2kV switchgear lineup, which test verifies that the equipment will withstand the BIL (Basic Insulation Level) requirement?',
 '{"a":"Insulation resistance test at 2,500V DC","b":"AC high-potential (hi-pot) test or DC hi-pot at the rated test voltage per NETA ATS","c":"Power factor test at rated voltage","d":"Contact resistance test at rated current"}',
 'b',
 'The high-potential (hi-pot) test applies a voltage substantially above operating voltage to verify the insulation can withstand overvoltage events (lightning, switching surges). Test voltages are specified in NETA ATS per equipment voltage class. The hi-pot is the primary proof test for BIL compliance.',
 null,
 'generated','exam_simulation'),

-- Troubleshooting additional
('systems-commissioning','troubleshooting',3,'conceptual',2,2,
 'A transformer protective relay system uses two CTs: one on the high-voltage side (H1) and one on the low-voltage side (X1). The 87T relay alarms with a residual differential. What is the most likely cause if all equipment is new?',
 '{"a":"The transformer has a developing internal fault","b":"Incorrect CT polarity on one side — one CT secondary lead is reversed","c":"The relay needs calibration","d":"The transformer tap changer is in the wrong position"}',
 'b',
 'With new equipment, an 87T differential relay alarm during initial commissioning is most commonly caused by a CT polarity error — one secondary lead is reversed. This causes the currents to add instead of cancel in the operating coil. This is a common commissioning error that must be corrected before energization.',
 'Trap: New equipment + 87 alarm = likely CT wiring/polarity error, not an internal fault.',
 'generated','exam_simulation'),

-- Commissioning documentation
('systems-commissioning','commissioning-process',3,'conceptual',2,2,
 'What must be included in a NETA acceptance test report for a circuit breaker?',
 '{"a":"Only the IR test result","b":"Equipment nameplate data, visual inspection findings, test data (IR, contact resistance, timing), trip test results, and technician''s signature","c":"Only the customer''s acceptance signature","d":"The cost of the test equipment used"}',
 'b',
 'A complete NETA acceptance test report for a circuit breaker includes: equipment ID (nameplate data), visual/mechanical inspection findings, all electrical test results (insulation resistance, contact resistance, over-current trip tests, timing), and the responsible technician''s signature. This report is the baseline for all future maintenance.',
 null,
 'generated','exam_simulation'),

-- Additional functional/commissioning
('systems-commissioning','functional-testing',3,'conceptual',3,2,
 'An overcurrent relay (51) is being commissioned. The pickup is set at 5A secondary with a time dial of 3. Secondary injection at 25A (5× pickup) causes the relay to operate in 3.2 seconds. The coordination study requires operation in 2.5 seconds maximum at 5× pickup. What action is required?',
 '{"a":"Replace the relay — it is defective","b":"Reduce the time dial setting and retest","c":"Increase the pickup setting","d":"Accept the result — 0.7 second difference is within tolerance"}',
 'b',
 'The relay is operating too slowly (3.2s vs 2.5s required at 5× pickup). Since pickup is correct, the time dial setting must be reduced. Time dial controls the overall speed of the time-overcurrent curve. A lower time dial produces faster operation at all multiples of pickup.',
 'Trap: Pickup controls WHEN the relay starts timing; time dial controls HOW FAST it operates. Fix the time dial, not the pickup.',
 'generated','exam_simulation'),

('systems-commissioning','troubleshooting',3,'conceptual',2,2,
 'During commissioning of a 480V motor control center, a feeder breaker trips immediately upon closing. The megger test on the feeder cable reads 25 MΩ (above NETA minimum). What is the next troubleshooting step?',
 '{"a":"Replace the feeder cable — 25 MΩ indicates failure","b":"Verify the cable is disconnected from all loads, then re-test; also check for a failed device connected to the feeder","c":"Increase the breaker rating","d":"Perform a hi-pot test at 2× rated voltage"}',
 'b',
 'A breaker that trips instantly (instantaneous trip, not overload) with acceptable IR indicates a bolted or low-impedance fault somewhere in the circuit. First verify the cable test was performed with all loads disconnected. Then systematically check connected devices (motors, drives, branch breakers) for a shorted device. The megger passed, but the fault may be in connected equipment, not the cable itself.',
 null,
 'generated','exam_simulation'),

('systems-commissioning','commissioning-process',3,'conceptual',3,3,
 'Why is a ground continuity test performed on the equipment enclosure during acceptance testing?',
 '{"a":"To verify the equipment frame is not carrying stray current from a wiring fault","b":"To ensure the equipment ground path has low enough impedance to allow protective devices to operate quickly during a ground fault","c":"To measure the soil resistivity around the substation","d":"To comply with NETA ATS Table 100.1 minimum values"}',
 'b',
 'The equipment grounding conductor provides the fault current return path. If the ground path has high impedance (loose connection, corroded lug), fault current is limited — protective devices may not operate, and dangerous touch voltages can exist on enclosures. Ground continuity testing verifies the ground path impedance is low.',
 null,
 'generated','exam_simulation'),

-- Coordination / selectivity
('systems-commissioning','troubleshooting',3,'conceptual',3,2,
 'During initial energization of a new 480V switchgear lineup, a phase-to-ground fault occurs on a feeder. The main breaker trips but the feeder breaker does NOT trip. What problem does this indicate?',
 '{"a":"The feeder breaker pickup is set too high","b":"A coordination (selectivity) failure — the main breaker operates faster than the feeder breaker at the available fault current","c":"The ground fault relay is not connected to the feeder breaker","d":"The feeder breaker has the wrong voltage rating"}',
 'b',
 'This is a coordination failure. The upstream main breaker trips before the downstream feeder breaker clears the fault — its time-overcurrent curve is faster than the feeder breaker''s curve at the available fault current. Correct coordination requires the feeder breaker to always trip first for faults on its feeder, preserving the rest of the switchgear. The protection coordination study must be reviewed and breaker settings corrected.',
 'Trap: A main breaker should NEVER trip for a fault on a sub-feeder if the protection is properly coordinated.',
 'generated','exam_simulation');
