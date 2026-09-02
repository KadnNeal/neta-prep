# NETA Prep — Project Brain for Claude Code

## What This App Is
A LeetCode-style study and interview prep platform for NETA electrical testing
technicians. Users study for NETA ETT Level 1–4 certification exams using
spaced repetition, adaptive drilling, exam simulations, and AI-powered interview
prep. The goal is not just passing the exam — it's getting hired and certified.

Primary competitor: testguy.net (static quiz bank + forum, no intelligence)
Our edge: adaptive learning engine, interview mode, career path progression,
readiness score that guarantees exam readiness before the user sits the test.

Key insight: Our question bank is built from REAL recalled exam questions from
engineers who actually sat the tests — not just NETA's published study guide.
This is the content moat TestGuy cannot replicate.

---

## Tech Stack

- **Framework:** Next.js 14+ (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **AI Layer:** Anthropic API (Claude) — for interview mode + scenario evaluation
- **Deployment:** Vercel
- **Package manager:** npm

---

## Common Commands

```bash
npm run dev          # start local dev server (localhost:3000)
npm run build        # production build
npm run lint         # run ESLint
npm run typecheck    # tsc --noEmit
npx supabase start   # start local Supabase instance
npx supabase db push # push schema migrations
npx supabase gen types typescript --local > lib/supabase/types.ts
```

> Always run typecheck before considering a feature complete.
> Always run lint before committing.

---

## Project Structure

```
neta-prep/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   │   ├── dashboard/       # readiness radar + streak
│   │   ├── drill/           # daily SM-2 drill session
│   │   ├── exam/            # timed exam simulation
│   │   ├── interview/       # AI interview prep mode
│   │   └── scenarios/       # field scenario mode
│   └── api/
│       ├── drill/           # SM-2 queue + answer submission
│       ├── interview/       # Anthropic API evaluation
│       └── progress/        # readiness score calculation
├── components/
│   ├── ui/                  # reusable primitives
│   ├── drill/               # question card, answer input, feedback
│   ├── dashboard/           # radar chart, streak, readiness bar
│   └── exam/                # timer, navigator, results screen
├── lib/
│   ├── sm2.ts               # SM-2 spaced repetition algorithm (core)
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts         # generated — never edit manually
│   ├── anthropic.ts         # Anthropic API client + interview evaluator
│   └── neta-domains.ts      # domain taxonomy + exam weight constants
├── supabase/
│   └── migrations/
├── docs/
│   ├── neta-domains.md
│   ├── sm2-algorithm.md
│   ├── exam-analysis/
│   │   └── level3-real-questions.md   # compiled from real engineer recalls
│   └── roadmap.md
└── CLAUDE.md
```

---

## Database Schema

```sql
profiles (
  id uuid references auth.users primary key,
  username text,
  neta_target_level int,       -- 1, 2, 3, or 4
  exam_date date,              -- OPTIONAL: used for study velocity calc only
  created_at timestamptz
)

questions (
  id uuid primary key,
  domain text,                 -- top-level domain key (see taxonomy below)
  subdomain text,              -- component sub-topic (e.g. 'protective-relays')
  level int,                   -- NETA level (2, 3, or 4)
  concept_type text,           -- 'calculation' | 'conceptual' | 'table-lookup'
                               -- | 'schematic' | 'safety-standards'
  difficulty int,              -- 1–5
  frequency_tier int,          -- 1=high-freq, 2=moderate, 3=low (real exam data)
  question text,
  options jsonb,               -- {a, b, c, d} for MCQ; null for free-text
  correct_answer text,
  explanation text,
  trap_pattern text,           -- null, or description of the known wrong-answer trap
  prerequisites uuid[],
  source text,                 -- 'recalled' | 'official' | 'generated'
  question_type text,          -- 'exam_simulation' | 'practice'
                               -- exam_simulation: counts toward the 100-Q exam pool
                               -- practice: supplemental/educational questions
  parent_question_id uuid,     -- for practice Qs linked to a specific exam question
  created_at timestamptz
)

user_question_stats (
  id uuid primary key,
  user_id uuid references profiles,
  question_id uuid references questions,
  ease_factor float default 2.5,
  interval_days int default 1,
  repetitions int default 0,
  next_review_date date,
  last_score int,              -- 0–5 SM-2 quality rating
  time_spent_ms int,
  updated_at timestamptz
)

exam_attempts (
  id uuid primary key,
  user_id uuid references profiles,
  level int,
  started_at timestamptz,
  completed_at timestamptz,
  score_percent float,
  domain_scores jsonb,         -- {domain: score_percent}
  subdomain_scores jsonb,      -- {subdomain: score_percent} for deep diagnostics
  passed boolean
)

interview_sessions (
  id uuid primary key,
  user_id uuid references profiles,
  question text,
  user_answer text,
  ai_feedback text,
  score int,                   -- 1–10
  domain text,
  subdomain text,
  created_at timestamptz
)
```

---

## The SM-2 Algorithm (lib/sm2.ts) — Never Break This

```
Input:  quality (0–5), ease_factor, interval, repetitions
Output: new ease_factor, new interval, new repetitions, next_review_date

Rules:
- quality < 3:  reset repetitions=0, interval=1 (failed — review tomorrow)
- quality >= 3:
    repetitions==0 → interval=1
    repetitions==1 → interval=6
    repetitions>1  → interval=round(interval * ease_factor)
- ease_factor = ease_factor + (0.1 - (5-quality) * (0.08 + (5-quality) * 0.02))
- ease_factor minimum: 1.3
- repetitions++
- next_review_date = today + interval days
```

Quality score UI mapping:
- 0 = "Complete blackout"
- 1 = "Wrong, familiar"
- 2 = "Wrong, easy to recall"
- 3 = "Correct, hard"
- 4 = "Correct, some hesitation"
- 5 = "Perfect recall"

Drill queue priority: frequency_tier=1 questions get boosted. When two questions
have the same next_review_date, serve tier 1 first.

---

## NETA Official Exam Structure

All exams: 100 questions (Level 4: 65 questions), 2 hours, closed book.
Passing score: 410 on a 200–500 scale. Administered by Pearson VUE.

### Official Domain Weights by Level

Source: 2022_DCO_2_24_23.pdf (official NETA Level 3 blueprint). L2/L4 are estimates.

| Domain | Level 2 | Level 3 (official) | Level 4 |
|--------|---------|---------|---------|
| Safety | ~15% | **13%** | ~10% |
| Electrical Testing Fundamentals & Theory | ~25% | **23%** | ~15% |
| Component Testing | ~55% | **47%** | ~55% |
| Systems & Commissioning | ~5% | **17%** | ~20% |

Note: Level 3 uses exact official weights from PDF. Power Systems & Calculations
was a legacy 5th domain — the official blueprint absorbs those topics into
Fundamentals & Theory (same questions, updated domain tag).

---

## NETA Domain Taxonomy (lib/neta-domains.ts)

Every question MUST have both a `domain` (top-level) and `subdomain`.
Domain structure matches official NETA Level 3 blueprint (2022_DCO_2_24_23.pdf).

```typescript
export const NETA_DOMAINS = {

  'safety-standards': {
    label: 'Safety',
    examWeight: { L2: 15, L3: 13, L4: 10 },
    subdomains: [
      // Official (2022 DCO)
      'risk-assessment',
      'electrically-safe-work-condition',
      'lockout-tagout',
      'ppe',
      'safety-equipment',
      'confined-space',
      'isolation-grounding',
      'incident-energy-analysis',
      'codes-standards',
      // Legacy slugs (existing question bank)
      'arc-flash-ppe', 'loto', 'approach-boundaries',
    ]
  },

  'fundamentals-theory': {
    label: 'Electrical Testing Fundamentals & Theory',
    examWeight: { L2: 25, L3: 23, L4: 15 },
    subdomains: [
      // Official (2022 DCO)
      'fundamentals-electricity',
      'electrical-calculations',
      'ac-dc-circuits',
      'insulation-systems',
      'resistance-testing',
      'thermographic-survey',
      'current-injection',
      'system-tests-analysis',
      // Calculation topics — officially in Fundamentals (absorbed from old power-systems-calc)
      'fault-current',           // I_fault = I_FLA / %Z
      'three-phase-power',       // S=√3VI, P=S×PF, Q=√(S²-P²)
      'inductor-circuits',       // series/parallel L — VERY HIGH FREQUENCY on L3
      'harmonics',               // 2nd/3rd/5th/7th, VFD, 2nd harmonic restraint
      // Legacy slugs
      'ct-ratio-math', 'transformer-calcs', 'ohms-law-dc',
      'ac-theory', 'power-triangle', 'logic-gates', 'inductance-capacitance',
    ]
  },

  'component-testing': {
    label: 'Component Testing',
    examWeight: { L2: 55, L3: 47, L4: 55 },
    subdomains: [
      // Official (2022 DCO)
      'switchgear-switchboard', 'transformers', 'cables-conductors', 'busways',
      'switches', 'circuit-breakers', 'circuit-switchers', 'network-protectors',
      'protective-relays',       // TIER 1 — ~15% of L3 exam alone
      'instrument-transformers', 'metering-devices', 'regulating-apparatus',
      'grounding-systems', 'ground-fault-protection',
      'rotating-machinery', 'motor-control', 'adjustable-speed-drives',
      'dc-systems', 'surge-arresters', 'capacitors-reactors', 'outdoor-bus',
      'emergency-systems', 'reclosers-sectionalizers', 'fiber-optic',
      'ev-chargers',             // TIER 2 — NEW 2024-25, 3-4 questions
      'insulating-liquids-gases', 'fuses',
      // Legacy slugs (existing question bank)
      'current-transformers',    // TIER 1
      'sf6-gas-equipment',       // TIER 2
      'batteries-dc',            // TIER 2
      'reactors', 'grounding-electrodes', 'motor-protection', 'switchgear', 'busway',
    ]
  },

  'systems-commissioning': {
    label: 'Systems & Commissioning',
    examWeight: { L2: 5, L3: 17, L4: 20 },
    subdomains: [
      // Official (2022 DCO)
      'troubleshooting',
      'scada-dcs',
      'functional-testing',
      'commissioning-process',
      'power-quality-monitoring',
      // Legacy slugs
      'commissioning-phases', 'neta-ecs', 'scada-hmi',
      'one-line-diagrams', 'sectionalizers-reclosers',
    ]
  },

} as const

export type NETADomain = keyof typeof NETA_DOMAINS
```

---

## REAL EXAM ANALYSIS — Level 3

**Source:** 4 independent engineers recalled questions after sitting NETA Level 3
(2020–2025 test administrations). ~120–140 distinct topics from a 100-question exam.
This data drives our frequency_tier tagging and question bank seed priority.

### Tier 1 — HIGH FREQUENCY (3–6 questions each)

**Protective Relays (~15% of total exam, 8–15 questions)**
Single largest sub-topic. Goes deep — not just definitions.

- ANSI device numbers to know COLD:

| # | Function | Exam Notes |
|---|----------|------------|
| 21 | Distance relay | Asked directly |
| 27 | Undervoltage relay | Trap: confuse with 59 |
| 47 | Phase sequence voltage relay | Asked directly |
| 50 | Instantaneous overcurrent | Common |
| 50G | Instantaneous OC — ground | Asked directly; trap vs 51G/64 |
| 51 | Time overcurrent | Common, paired with 50 |
| 51G | Time OC — ground | Distractor for 50G |
| 52 | AC circuit breaker | This is the BREAKER, not a relay |
| 59 | Overvoltage relay | Answer = 59, not 27/52/86 |
| 63 | Buchholz / pressure relay | Asked by ALL FOUR recalled sources |
| 67 | Directional overcurrent | Asked directly |
| 86 | Lockout relay | Very common in schematic questions |
| 87 | Differential relay | Very common — know 2nd harmonic restraint |

- Buchholz relay (63): Detects gas accumulation AND oil surge in liquid-filled
  transformers. Does NOT "measure" — operates on gas collection and oil flow.
  Asked by ALL FOUR recalled sources.
- 87 relay + 2nd harmonic restraint: Prevents trip on transformer inrush current.
  Inrush is rich in 2nd harmonics; relay recognizes this and blocks the trip.
  Asked by ALL FOUR recalled sources.
- Relay trip sequence trap: 51 operates → 86 lockout → 52 trips.
  "What trips first?" = the 86 lockout, NOT the breaker.
- CT saturation from external faults can fool differential relays.

**Current Transformers (~5%, ~5 questions)**
- CT ratio math: Each loop of conductor through CT = 1 additional turn.
  Given 3000:5 CT and test gear max 500A — calculate loops needed.
- CT secondary grounding: One point only, solidly grounded.
- Ground on wrong side of CT = relay won't operate (trip failure).
- Burden testing: Establish burden BEFORE energizing the core.

**Circuit Breakers (~5%, ~5 questions)**
- Vacuum bottle integrity: Hi-pot test per manufacturer guidelines.
- Raised filaments on MV contacts = arcing/erosion.
- 5kV ACB contact resistance: ~50 µΩ — memorize this NETA table value.

**Cables & Conductors (~5%, ~5 questions)**
- Hi-pot test voltages: Know NETA Table 100.1 and 100.6 (new vs. service-aged).
- Control wiring IR minimum: 2 MΩ.
- Cable layer anatomy (outside → inside):
  jacket → metallic shield → insulation shield → insulation →
  conductor shield → conductor
- 100% vs 133% insulation level ratings.

**Transformers (~5%, ~5 questions)**
- Dry-type rated temperature rise: 150°C (Class F) most common.
  Also 80°C, 115°C. TRICKY — flagged by multiple sources.
- Conservator tank: Allows oil expansion, keeps oil sealed from atmosphere.
- ASTM oil test units to memorize:

| Test | Measures | Units |
|------|----------|-------|
| D877/D1816 | Dielectric breakdown | kV |
| D974 | Acid number | mg KOH/g |
| D971 | Interfacial tension (IFT) | mN/m (dynes/cm) |
| D924 | Power factor | % |
| D1533 | Moisture (Karl Fischer) | ppm |
| D1298 | Specific gravity | unitless |
| D3612 | Dissolved gas analysis | ppm |

- FLA calculation: Given MVA + Delta-Wye config + primary/secondary voltage.
- Fault current: I_fault = I_FLA / %Z

### Tier 2 — MODERATE FREQUENCY (1–3 questions each)

**EV Chargers — NEW, 3–4 questions on 2024–2025 exams**
- Level 2 EV charger: 240V, NEMA 14-50R receptacle.
- Floating ground symptom: 90V positive-to-ground, -40V negative-to-ground =
  missing/floating neutral or ground reference issue.

**SF6 Gas / GIS (2–3 questions)**
- Purity must be >97%.
- Analysis measures: purity (%), moisture (dew point), decomposition byproducts (SO2, HF).

**Batteries & DC Systems (2–3 questions)**
- Sulfation cause: Excessive undercharging.
- Cell voltage variation spec: ~0.5V.

**Ground Resistance & Electrodes (2–3 questions)**
- Lower grid resistance: Add more electrodes (not bigger diameter — minimal effect).
- Electrode spacing: At least equal to rod length.
- Fall-of-potential: Know what correct plateau curve looks like.

**Motor Protection (2–3 questions)**
- R-rated fuses: SHORT CIRCUIT only. NOT overload. Confirmed exam trap.
- VFD vs soft starter: VFD = frequency + voltage. Soft starter = voltage only.

**Surge Arresters (1–2 questions)**
- Protect against transient overvoltages ONLY.
- Trap: They do NOT reduce harmonics.

### Tier 3 — LOWER FREQUENCY (1 question, confirmed)

- OTDR: Uses light pulses to find breaks in fiber optic cable.
- Busway hi-pot trip: Caused by high capacitance (long busduct acts as capacitor).
- Sectionalizer vs recloser: Sectionalizer counts interruptions, opens during
  dead time. Recloser actually interrupts fault current.
- PI testing: If interrupted after 8 hours, ground specimen 2–4 min before restart.

### Power Systems Calculations — Level 3 Specific

```
Series/Parallel Inductors (3–5 questions — VERY HIGH FREQUENCY)
  Parallel: 1/L_total = 1/L1 + 1/L2 + 1/L3
  Series:   L_total = L1 + L2 + ...

3-Phase Power Triangle (3–5 questions)
  S = √3 × V × I           (apparent power, kVA)
  P = √3 × V × I × PF      (real power, kW)
  Q = √(S² - P²)            (reactive power, kVAR)

Fault Current (2–3 questions)
  I_fault = I_FLA / %Z_pu
  Given MVA + voltage + %Z → calculate fault current.

CT Ratio Math (1–2 questions)
  Each conductor pass through CT = 1 turn = multiplies apparent current.
  2 passes = doubles current seen by relay.

Leading/Lagging Current (1–2 questions)
  Current peaks AFTER voltage = LAGS (inductive load)
  Current peaks BEFORE voltage = LEADS (capacitive load)
```

### Real Exam Question Format Breakdown

```
~30%  Conceptual     ("What does X do?", "What is the purpose of Y?")
~25%  Table/spec     ("Per NETA ATS, what is the IR value for...?")
~20%  Calculations   (inductor circuits, fault current, power triangle)
~15%  Schematic      (relay logic, LOTO isolation, cable anatomy, waveforms)
~10%  Safety/stds    (PPE, NFPA 70E, commissioning procedures)
```

### Confirmed Trap Patterns (tag these in trap_pattern field)

1. **Device confusion**: 27 (undervoltage) vs 59 (overvoltage).
   50G vs 51G vs 64.
2. **R-rated fuses**: Short circuit ONLY, NOT overload.
3. **Surge arresters**: Protect against transients ONLY, NOT harmonics.
4. **Relay trip sequence**: 51→86→52. First to "trip" = 86 lockout.
5. **CT grounding**: Wrong side = relay won't operate. One point only.
6. **VFD vs soft starter**: VFD = frequency+voltage. Soft starter = voltage only.
7. **Busway hi-pot**: Cause is capacitance, not resistance or impedance.

---

## Study Modes

| Mode | Key Behavior |
|------|-------------|
| `daily-drill` | SM-2 due cards only, tier 1 prioritized, ~15–20 min |
| `domain-deep-dive` | Target one subdomain, boss question finale |
| `exam-simulation` | Timed, locked, domain+subdomain diagnostic after |
| `interview` | Free text, Claude evaluates accuracy + trap awareness |
| `field-scenario` | Multi-step judgment, no MCQ |

---

## Readiness Score Logic

Exam Ready badge unlocks ONLY when ALL met:
1. Every subdomain >= 80% mastery (SM-2 ease_factor averages)
2. Tier 1 subdomains (protective-relays, transformers, fundamentals) >= 90%
3. At least one full exam simulation completed
4. Exam simulation score >= 75%
5. All exam simulation failures reviewed at least once

Display as a radar chart at the subdomain level, not just top-level domains.
Weight radar segments by real exam frequency (protective-relays gets more visual
weight than surge-arresters). Never show one aggregate score alone.

---

## Anthropic API Usage (Interview Mode)

Model: `claude-sonnet-4-5-20250929`
Max tokens: 1000

```typescript
const systemPrompt = `You are a senior NETA Level 4 electrical testing engineer
evaluating a technician candidate's answer. Be precise, technical, constructive.
Score 1–10. Return ONLY valid JSON, no other text.`

const userPrompt = `
Question: ${question}
Domain: ${domain} / ${subdomain}
Candidate answer: ${userAnswer}

Evaluate: technical accuracy, completeness, safety awareness, communication clarity.
Return: {
  "score": number,
  "feedback": string,
  "missed_points": string[],
  "trap_triggered": boolean,
  "trap_description": string | null
}`
```

Parse responses as JSON. Never display raw AI output. Show "evaluation
unavailable" on error — never a broken UI state.

---

## Code Style Rules

- TypeScript strict mode — no `any` types, ever
- Functional components only, no class components
- Server Components by default — `'use client'` only when needed
- Named exports — except page.tsx files
- Every async function gets try/catch, errors surface to UI
- Tailwind only, no inline styles
- Always use generated types from `lib/supabase/types.ts`
- Never hardcode keys — always `process.env.`

---

## Environment Variables

```bash
# .env.local — never commit
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # server-only
ANTHROPIC_API_KEY=             # server-only
```

---

## Scope Guardrails (MVP)

- Responsive web only (no native mobile app)
- No video content
- No payment system
- NETA ETT only (no NICET for MVP)
- exam_date is OPTIONAL — used for study velocity only, never required

---

## Session Log

| Session | Feature | Status |
|---------|---------|--------|
| 0 | CLAUDE.md + project init | ✅ Done |
| 1 | Supabase schema + auth | ✅ Done |
| 2 | SM-2 algorithm + drill queue | ✅ Done |
| 3 | Question bank seed (L3 Tier 1 first) | ✅ Done |
| 4 | Daily Drill UI | ✅ Done |
| 4.5 | Auth UI for testing | ✅ Done |
| 5 | Domain radar + readiness dashboard | ✅ Done |
| 6 | Exam simulation mode | ✅ Done |
| 6.5 | Fix domain structure to match official NETA blueprint | ✅ Done |
| 6.6 | Fix dashboard and exam results domain display | ✅ Done |
| 6.7 | Fix exam question distribution and results format | ✅ Done |
| 7 | Interview mode (Anthropic API) | — |
| 8 | Audit + generate exam-style questions to 100 total | ✅ Done |
| 9 | Practice questions table + educational question set | — |
| 11 | Level 1 roadmap — 9 modules, 76 questions, roadmap + module quiz pages | ✅ Done |
| 12 | NeetCode-style visual tree UI + fix scoring bug (client-side reveal) | ✅ Done |
| 13 | Learn-before-quiz flow — rich content, quick checks, worked examples, learn-complete API | ✅ Done |
| 14 | Auth & onboarding — middleware level guard, NETA 2-only select-level page, password validation, login/signup redirects, removed diagnostic flow | ✅ Done |
| 15 | Dashboard UI restructure — remove radar, 4 domain cards (2×2) with collapsible subdomain detail, reorder layout, no red/orange colors | ✅ Done |
| 16 | Dashboard quick access + CTA fix — 3 cards (Roadmap, Drill, Exam), CTA → Begin Roadmap, remove Interview Mode | ✅ Done |
| 17 | Dashboard & nav fixes — independent domain card expand state, sticky SiteNav, more prominent dashboard button | ✅ Done |
| 18 | Daily drill — restrict to exam_simulation questions + user's NETA level only (due reviews + new questions both filtered) | ✅ Done |
| 19 | Light/dark mode toggle (Sun/Moon in SiteNav, localStorage, default dark) + amber-orange accent system replacing blue + typography bump (16px base, 18px question stems, 20px section headers) | ✅ Done |
| 20 | Google OAuth (login + signup, /auth/callback route) + /settings page (Profile, Change Password, Change Email, Appearance toggle, Subscription placeholder, Danger Zone delete) + Settings gear icon in navbar | ✅ Done |
| 21 | Practice Mode — /practice domain selector + count picker, per-question instant feedback, AI explanation (Anthropic API) with skeleton loader, bookmark toggle, results screen, bookmarked_questions table, Practice link in SiteNav + Dashboard quick access (4th card, 2×2 grid) | ✅ Done |
| 22 | Practice Mode Polish — count options 10/15/25, answer option design overhaul (1px borders, green/red rgb bg, no greying unselected), bookmarked questions section on results screen + Retake Bookmarked flow, L2 domain weights corrected to 15/25/55/5 | ✅ Done |
| 23 | Revert answer colors to S21 green-500/10 + red-500/10 style (keep S22 border/hover/unselected improvements); exam start route audit — confirmed L2 distribution 15/25/55/5 correct, default level 2→3 fixed, added per-domain count logging, added hard error on domain shortfall (removed silent surplus fill) | ✅ Done |
| 24 | AI explanation redesign — structured CORRECT/WRONG_A-D API format, parseExplanation parser, InlineMarkdown bold renderer, WrongAccordion with CSS grid expand animation, amber left-border card, "Explanation" label + "Why X is correct" always-visible header | ✅ Done |
| 25 | Domain mastery → accuracy-based formula (last_score≥3 / answered, joins user_question_stats×questions); 85% threshold tick marker on progress bars; grey/amber/green color states (0-49/50-84/85+); ✓ Exam Ready badge next to domain name + footer label per card; hide Practice from SiteNav when on dashboard | ✅ Done |
| 26 | Correct answer redistribution — redistribute_answers.py shuffles correct_answer + option texts uniformly; 1000 exam_simulation L2 questions updated (was A=5% B=46% C=39% D=10%, now A=23% B=28% C=25% D=24%); --dry-run flag, batch-of-50, DB verification | ✅ Done |
| 27 | Stripe payment integration — /pricing page (4 tiers: Free/Monthly/90-Day/Annual), checkout + webhook + portal API routes, free tier enforcement (roadmap locked to M1, practice 15/day cap, AI explanations hidden, exam simulator gated), SiteNav Upgrade link for free users, settings subscription section with real billing data | ✅ Done |
| 28 | Pricing page polish — 90-Day button → amber outline (matches Monthly), remove supervisor justification copy box, add expense nudge line above cards | ✅ Done |
| 29 | Roadmap restructure — 28-module NETA 2 curriculum across 5 phases, flat list UI with phase headers + domain badges, remove 80% unlock gate, free tier gates phases 2-5, "Start here" badge for new users, phase completion %, dashboard card → "28 modules across 5 phases" | ✅ Done |
| 30 | Roadmap learn pages — new RoadmapLearnContent schema (overview/sections/key_values/exam_tips/summary), LearnPageContent server component, learn page rewrite with coming-soon fallback, generate_roadmap_content.py (claude-sonnet-4-6, resume support, --dry-run), Learn+Quiz buttons on module rows | ✅ Done |


---

## Key Decisions Log

- **App Router over Pages Router:** Server components, better DX, Vercel edge.
- **Supabase over alternatives:** Built-in auth, real-time, generous free tier.
- **SM-2 over FSRS:** Simpler, sufficient for exam prep, well understood.
- **exam_date optional:** Lowers signup friction. Used for velocity calc only.
- **frequency_tier field:** 1/2/3 from real recalled exam data. Tier 1 questions
  get boosted priority in the daily drill queue.
- **subdomain over domain for radar:** Domain is too coarse. Subdomain gives
  actionable gap analysis ("you're weak on protective-relays" vs "component testing").
- **trap_pattern field:** Stores the known wrong-answer trap for each question.
  Surfaced in post-answer explanations and used in interview mode evaluation.
- **source field on questions:** 'recalled' = real engineer exam memory (highest
  value), 'official' = NETA published materials, 'generated' = AI-created.
  Recalled questions are surfaced preferentially in drill queue.
