// Official NETA Level 3 domain structure per 2022 DCO blueprint.
// examWeight values: L3 = official PDF percentages.
// L2/L4 are best-available estimates (official L3 only sourced from PDF).
//
// Subdomains include both the official new slugs AND legacy slugs that existing
// questions in the DB use — so the dashboard subdomain breakdown continues to
// render correctly while the question bank migrates to official nomenclature.

export const NETA_DOMAINS = {

  "safety-standards": {
    label: "Safety",
    examWeight: { L2: 15, L3: 13, L4: 10 },
    subdomains: [
      // Official slugs (2022 DCO blueprint)
      "risk-assessment",
      "electrically-safe-work-condition",
      "lockout-tagout",
      "ppe",
      "safety-equipment",
      "confined-space",
      "isolation-grounding",
      "incident-energy-analysis",
      "codes-standards",
      // Legacy slugs (existing question bank)
      "arc-flash-ppe",
      "loto",
      "approach-boundaries",
    ],
  },

  "fundamentals-theory": {
    label: "Electrical Testing Fundamentals & Theory",
    examWeight: { L2: 25, L3: 23, L4: 15 },
    subdomains: [
      // Official slugs (2022 DCO blueprint)
      "fundamentals-electricity",
      "electrical-calculations",
      "ac-dc-circuits",
      "insulation-systems",
      "resistance-testing",
      "thermographic-survey",
      "current-injection",
      "system-tests-analysis",
      // Calculation subdomains — merged from old power-systems-calc domain
      // (official blueprint absorbs these into Fundamentals & Theory)
      "fault-current",           // I_fault = I_FLA / %Z
      "three-phase-power",       // S=√3VI, P=S×PF, Q=√(S²-P²)
      "inductor-circuits",       // series/parallel L — VERY HIGH FREQUENCY on L3
      "harmonics",               // 2nd/3rd/5th/7th, VFD, 2nd harmonic restraint
      // Legacy slugs (existing question bank)
      "ct-ratio-math",           // turns ratio, looping conductor through CT
      "transformer-calcs",       // FLA from MVA, fault current from %Z
      "ohms-law-dc",
      "ac-theory",               // leading/lagging, waveforms, power factor
      "power-triangle",          // P, Q, S
      "logic-gates",             // AND/OR/NOT/NAND/NOR
      "inductance-capacitance",  // series/parallel L and C
    ],
  },

  "component-testing": {
    label: "Component Testing",
    examWeight: { L2: 55, L3: 47, L4: 55 },
    subdomains: [
      // Official slugs (2022 DCO blueprint)
      "switchgear-switchboard",
      "transformers",
      "cables-conductors",
      "busways",
      "switches",
      "circuit-breakers",
      "circuit-switchers",
      "network-protectors",
      "protective-relays",       // TIER 1 — ~15% of L3 exam alone
      "instrument-transformers",
      "metering-devices",
      "regulating-apparatus",
      "grounding-systems",
      "ground-fault-protection",
      "rotating-machinery",
      "motor-control",
      "adjustable-speed-drives",
      "dc-systems",
      "surge-arresters",
      "capacitors-reactors",
      "outdoor-bus",
      "emergency-systems",
      "reclosers-sectionalizers",
      "fiber-optic",
      "ev-chargers",             // TIER 2 — NEW 2024-25, 3-4 questions
      "insulating-liquids-gases",
      "fuses",
      // Legacy slugs (existing question bank)
      "current-transformers",    // TIER 1 — maps to instrument-transformers
      "sf6-gas-equipment",       // TIER 2 — maps to insulating-liquids-gases
      "batteries-dc",            // TIER 2 — maps to dc-systems
      "reactors",                // maps to capacitors-reactors
      "grounding-electrodes",    // TIER 2 — maps to grounding-systems
      "motor-protection",        // TIER 3 — maps to motor-control / rotating-machinery
      "switchgear",              // maps to switchgear-switchboard
      "busway",                  // maps to busways / outdoor-bus
    ],
  },

  "systems-commissioning": {
    label: "Systems & Commissioning",
    examWeight: { L2: 5, L3: 17, L4: 20 },
    subdomains: [
      // Official slugs (2022 DCO blueprint)
      "troubleshooting",
      "scada-dcs",
      "functional-testing",
      "commissioning-process",
      "power-quality-monitoring",
      // Legacy slugs (existing question bank)
      "commissioning-phases",
      "neta-ecs",
      "scada-hmi",
      "one-line-diagrams",
      "sectionalizers-reclosers",
    ],
  },

} as const;

export type NETADomain = keyof typeof NETA_DOMAINS;

/** Tier 1 subdomains — must reach 90%+ for Exam Ready badge.
 *  Uses legacy slugs matching existing question bank. */
export const TIER1_SUBDOMAINS = [
  "protective-relays",
  "current-transformers",
  "circuit-breakers",
  "cables-conductors",
  "transformers",
] as const;

export function formatSubdomainLabel(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
