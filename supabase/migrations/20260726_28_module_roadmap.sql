-- Session 29: 28-module NETA Level 2 roadmap restructure
-- Step 1: Run schema alters first (if not already done via Supabase SQL Editor)
alter table roadmap_modules add column if not exists phase int;
alter table roadmap_modules add column if not exists phase_title text;
alter table roadmap_modules add column if not exists domain text;
alter table roadmap_modules add column if not exists neta_reference text;
alter table roadmap_modules add column if not exists content_sections jsonb;
alter table roadmap_modules add column if not exists estimated_minutes int;

-- Clear existing data
delete from user_roadmap_progress;
delete from roadmap_modules;

-- Step 2: Seed 28 modules
-- Phase 1 — Foundation
insert into roadmap_modules (id, phase, phase_title, order_in_phase, title, description, domain, neta_reference, estimated_minutes, neta_level, is_published, passing_score, total_questions)
values
  (gen_random_uuid(), 1, 'Foundation', 1, 'What is NETA & the ETT Program',
   'Understand the NETA organization, certification levels, and what it means to be a Level 2 ETT in the field.',
   'Fundamentals & Theory', 'ANSI/NETA ETT, ECS Section 3', 20, 2, true, 80, 0),

  (gen_random_uuid(), 1, 'Foundation', 2, 'Safety, OSHA & NFPA 70E',
   'Arc flash, PPE requirements, LOTO procedures, approach boundaries, and OSHA 29 CFR 1910 requirements every field tech must know.',
   'Safety', 'NFPA 70E, OSHA 29 CFR 1910, ECS 5.1', 35, 2, true, 80, 0),

  (gen_random_uuid(), 1, 'Foundation', 3, 'Electrical Fundamentals & Calculations',
   'Ohm''s law, kVA, kW, kVAR, power factor, three-phase power, and the calculations that show up on the NETA exam.',
   'Fundamentals & Theory', 'ANSI/NETA ATS Section 6', 40, 2, true, 80, 0),

  (gen_random_uuid(), 1, 'Foundation', 4, 'Test Equipment & Calibration',
   'Meggars, DLROs, power factor test sets, calibration requirements, and instrument suitability per NETA standards.',
   'Fundamentals & Theory', 'ECS 5.2, 5.3', 30, 2, true, 80, 0),

  (gen_random_uuid(), 1, 'Foundation', 5, 'Reading Drawings & Nameplates',
   'Single-line diagrams, submittals, nameplate data, equipment ratings, and documentation review before any test begins.',
   'Fundamentals & Theory', 'ECS 5.4, 6.4', 25, 2, true, 80, 0),

-- Phase 2 — The Commissioning Process
  (gen_random_uuid(), 2, 'The Commissioning Process', 1, 'Division of Responsibility',
   'Owner''s representative vs. commissioning organization — who provides what, and what the commissioning org is accountable for.',
   'Systems & Commissioning', 'ECS Section 4', 20, 2, true, 80, 0),

  (gen_random_uuid(), 2, 'The Commissioning Process', 2, 'The Commissioning Plan',
   'OPR, Basis of Design, commissioning plan structure, and how acceptance testing feeds into baseline maintenance records.',
   'Systems & Commissioning', 'ECS Section 6', 25, 2, true, 80, 0),

  (gen_random_uuid(), 2, 'The Commissioning Process', 3, 'Pre-Energization Procedures',
   'The complete pre-energization checklist for low and medium voltage systems — what must be verified before any equipment is energized.',
   'Systems & Commissioning', 'ECS 7.1A, 7.2A', 35, 2, true, 80, 0),

  (gen_random_uuid(), 2, 'The Commissioning Process', 4, 'Energization & Post-Energization',
   'Energization sequence, verification steps, post-energization testing, thermographic surveys, and commissioning report requirements.',
   'Systems & Commissioning', 'ECS 7.1B/C, 7.2B/C, Section 9', 30, 2, true, 80, 0),

-- Phase 3 — Component Testing
  (gen_random_uuid(), 3, 'Component Testing', 1, 'Cables — Low Voltage',
   'Insulation resistance testing, acceptance criteria, and test procedures for low-voltage cables up to 1,000V per NETA ATS.',
   'Component Testing', 'NETA ATS Section 7, Cables LV', 30, 2, true, 80, 0),

  (gen_random_uuid(), 3, 'Component Testing', 2, 'Cables — Medium & High Voltage',
   'Shielded cable testing, VLF, DC hipot, insulation resistance, and acceptance criteria for medium and high voltage cables.',
   'Component Testing', 'NETA ATS, Shielded Cables MV/HV', 35, 2, true, 80, 0),

  (gen_random_uuid(), 3, 'Component Testing', 3, 'Transformers — Dry Type',
   'Visual inspection, insulation resistance, TTR, and acceptance criteria for dry-type air-cooled transformers per NETA ATS.',
   'Component Testing', 'NETA ATS, Transformers Dry Type', 35, 2, true, 80, 0),

  (gen_random_uuid(), 3, 'Component Testing', 4, 'Transformers — Liquid Filled',
   'Insulating fluid sampling, dielectric strength, TTR, power factor, and liquid-filled transformer acceptance criteria.',
   'Component Testing', 'NETA ATS, Transformers Liquid-Filled', 35, 2, true, 80, 0),

  (gen_random_uuid(), 3, 'Component Testing', 5, 'Circuit Breakers — Molded Case & Low Voltage Power',
   'Contact resistance, insulation resistance, trip timing, and acceptance criteria for MCCB and LVPCB per NETA ATS.',
   'Component Testing', 'NETA ATS, CB Air MCCB/LVPCB', 35, 2, true, 80, 0),

  (gen_random_uuid(), 3, 'Component Testing', 6, 'Circuit Breakers — Medium Voltage',
   'Vacuum bottle integrity, contact resistance, timing tests, and acceptance criteria for medium voltage circuit breakers.',
   'Component Testing', 'NETA ATS, CB Air MV, CB Vacuum MV', 35, 2, true, 80, 0),

  (gen_random_uuid(), 3, 'Component Testing', 7, 'Switchgear & Switchboards',
   'Visual inspection, insulation resistance, contact resistance, and commissioning procedures for switchgear and switchboards.',
   'Component Testing', 'NETA ATS, Switchgear/Switchboard', 30, 2, true, 80, 0),

  (gen_random_uuid(), 3, 'Component Testing', 8, 'Grounding Systems',
   'Ground resistance testing methods, fall-of-potential, clamp-on testing, and acceptance criteria for grounding systems.',
   'Component Testing', 'NETA ATS, Grounding Systems', 30, 2, true, 80, 0),

  (gen_random_uuid(), 3, 'Component Testing', 9, 'Instrument Transformers — CTs & PTs',
   'Current transformer ratio, polarity, excitation, burden tests, and voltage transformer acceptance procedures per NETA ATS.',
   'Component Testing', 'NETA ATS, Instrument Transformers CT/PT', 30, 2, true, 80, 0),

  (gen_random_uuid(), 3, 'Component Testing', 10, 'Protective Relays',
   'Electromechanical, solid-state, and microprocessor-based relay testing, pickup and timing verification, and settings documentation.',
   'Component Testing', 'NETA ATS, Protective Relays 9.1/9.2', 40, 2, true, 80, 0),

  (gen_random_uuid(), 3, 'Component Testing', 11, 'Batteries & Battery Systems',
   'Flooded lead-acid, VRLA, and nickel-cadmium battery acceptance testing, capacity tests, float voltage, and charger verification.',
   'Component Testing', 'NETA ATS, Batteries 18.1-18.4', 30, 2, true, 80, 0),

  (gen_random_uuid(), 3, 'Component Testing', 12, 'Motors, Generators & Motor Starters',
   'Insulation resistance, polarization index, rotation verification, and acceptance testing for AC/DC motors and low/medium voltage starters.',
   'Component Testing', 'NETA ATS, Motors 15.1-15.3, Starters 16.1-16.2', 35, 2, true, 80, 0),

-- Phase 4 — Specialized Equipment
  (gen_random_uuid(), 4, 'Specialized Equipment', 1, 'Solar PV Systems',
   'PV system commissioning procedures, string testing, insulation resistance, anti-islanding, and inverter verification per ECS 8.1.',
   'Component Testing', 'ECS 8.1, NETA ATS Solar PV', 30, 2, true, 80, 0),

  (gen_random_uuid(), 4, 'Specialized Equipment', 2, 'UPS & Battery Energy Storage Systems',
   'UPS commissioning procedures, load testing, transfer time verification, and BESS acceptance testing requirements.',
   'Component Testing', 'ECS 8.2, NETA ATS BESS', 30, 2, true, 80, 0),

  (gen_random_uuid(), 4, 'Specialized Equipment', 3, 'Automatic Transfer Switches',
   'ATS commissioning, transfer time testing, coordination with protective devices, and load transfer verification per ECS 8.3.',
   'Component Testing', 'ECS 8.3, NETA ATS ATS', 25, 2, true, 80, 0),

  (gen_random_uuid(), 4, 'Specialized Equipment', 4, 'EV Charging Systems',
   'Electric vehicle charging system acceptance testing, insulation resistance, functional testing, and commissioning requirements.',
   'Component Testing', 'NETA ATS, EV Charging Systems', 25, 2, true, 80, 0),

-- Phase 5 — Advanced Testing & Documentation
  (gen_random_uuid(), 5, 'Advanced Testing & Documentation', 1, 'Thermographic Surveys',
   'Infrared survey procedures, temperature rise criteria, reporting requirements, and NETA ATS Table 100.18 acceptance criteria.',
   'Systems & Commissioning', 'ECS Section 9, NETA ATS Table 100.18', 25, 2, true, 80, 0),

  (gen_random_uuid(), 5, 'Advanced Testing & Documentation', 2, 'Surge Protection & Power Quality',
   'Surge protective device testing, power quality surveys, capacitor and reactor acceptance testing per NETA ATS.',
   'Component Testing', 'NETA ATS, SPD 19.1-19.2, Capacitors 20.1', 25, 2, true, 80, 0),

  (gen_random_uuid(), 5, 'Advanced Testing & Documentation', 3, 'Short Circuit, Coordination & Documentation',
   'Short circuit analysis basics, protective device coordination, commissioning report requirements, and turnover to owner per ECS Section 10.',
   'Systems & Commissioning', 'ECS 5.4, Section 10, ATS Section 6', 30, 2, true, 80, 0);
