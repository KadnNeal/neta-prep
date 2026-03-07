import { createClient } from "@/lib/supabase/server";
import type { NETADomain } from "@/lib/neta-domains";
import type { Database } from "@/lib/supabase/types";
import { NextResponse } from "next/server";

// ── Domain distribution by exam level ────────────────────────────────────────
// L3: official NETA 2022 DCO blueprint (13%/23%/47%/17% of 100 questions)
// L2: approximate NETA weights × 100 questions
// L4: approximate NETA weights × 65 questions (must sum to EXAM_TOTAL[4] = 65)
const DOMAIN_DISTRIBUTION: Record<number, Record<NETADomain, number>> = {
  2: {
    "safety-standards": 15,
    "fundamentals-theory": 25,
    "component-testing": 55,
    "systems-commissioning": 5,
  },
  3: {
    "safety-standards": 13,
    "fundamentals-theory": 23,
    "component-testing": 47,
    "systems-commissioning": 17,
  },
  4: {
    "safety-standards": 7,
    "fundamentals-theory": 10,
    "component-testing": 35,
    "systems-commissioning": 13,
  },
};

const EXAM_TOTAL: Record<number, number> = { 4: 65 };
const DEFAULT_EXAM_TOTAL = 100;

// ── Types ─────────────────────────────────────────────────────────────────────
// question_type was added in migration 20260226 — not yet in generated types.
// We include it in the SELECT and cast through unknown.
export interface ExamQuestion {
  id: string;
  question: string;
  options: { a: string; b: string; c: string; d: string } | null;
  domain: string;
  subdomain: string;
  concept_type: string;
  difficulty: number;
  frequency_tier: number;
}

interface RawRow extends ExamQuestion {
  question_type: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Route ─────────────────────────────────────────────────────────────────────
export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("neta_target_level")
      .eq("id", user.id)
      .single();

    const targetLevel = profile?.neta_target_level ?? 3;
    const totalNeeded = EXAM_TOTAL[targetLevel] ?? DEFAULT_EXAM_TOTAL;
    const distribution = DOMAIN_DISTRIBUTION[targetLevel];

    // Single query — include question_type so we can filter exam_simulation
    const { data: rawData, error: qError } = await supabase
      .from("questions")
      .select(
        "id, question, options, domain, subdomain, concept_type, difficulty, frequency_tier, question_type"
      )
      .eq("level", targetLevel);

    if (qError) {
      return NextResponse.json({ error: qError.message }, { status: 500 });
    }

    const allRows = (rawData ?? []) as unknown as RawRow[];

    // Partition into exam_simulation (by domain) and everything else (fallback)
    const byDomain = new Map<string, ExamQuestion[]>();
    const fallbackPool: ExamQuestion[] = [];

    for (const { question_type, ...q } of allRows) {
      if (question_type === "exam_simulation") {
        const list = byDomain.get(q.domain) ?? [];
        list.push(q);
        byDomain.set(q.domain, list);
      } else {
        fallbackPool.push(q);
      }
    }

    if (byDomain.size === 0 && fallbackPool.length === 0) {
      return NextResponse.json(
        { error: "No questions available for this level" },
        { status: 404 }
      );
    }

    const selected: ExamQuestion[] = [];
    const surplus: ExamQuestion[] = [];

    if (distribution) {
      // ── Domain-weighted selection ──────────────────────────────────────────
      for (const [domain, target] of Object.entries(distribution) as [NETADomain, number][]) {
        const pool = shuffle(byDomain.get(domain) ?? []);
        selected.push(...pool.slice(0, target));
        // Excess questions from over-stocked domains go to surplus
        if (pool.length > target) {
          surplus.push(...pool.slice(target));
        }
      }

      // Fill any shortfall (domain doesn't have enough exam_simulation questions)
      const shortfall = totalNeeded - selected.length;
      if (shortfall > 0) {
        // Prefer surplus from other domains first, then fall back to practice Qs
        const fromSurplus = shuffle(surplus).slice(0, shortfall);
        selected.push(...fromSurplus);

        const stillShort = totalNeeded - selected.length;
        if (stillShort > 0) {
          selected.push(...shuffle(fallbackPool).slice(0, stillShort));
        }
      }
    } else {
      // No distribution for this level — shuffle all available and slice
      const all = shuffle([
        ...Array.from(byDomain.values()).flat(),
        ...fallbackPool,
      ]);
      selected.push(...all.slice(0, totalNeeded));
    }

    if (selected.length === 0) {
      return NextResponse.json(
        { error: "No questions available for this level" },
        { status: 404 }
      );
    }

    // Final shuffle so domains aren't grouped sequentially
    const finalSelection = shuffle(selected);
    const selectedIds = finalSelection.map((q) => q.id);

    // Actual distribution for metadata (overwritten by scores on submit)
    const actualDistribution: Record<string, number> = {};
    for (const q of finalSelection) {
      actualDistribution[q.domain] = (actualDistribution[q.domain] ?? 0) + 1;
    }

    type AttemptInsert = Database["public"]["Tables"]["exam_attempts"]["Insert"];

    const { data: attempt, error: insertError } = await supabase
      .from("exam_attempts")
      .insert({
        user_id: user.id,
        level: targetLevel,
        question_ids: selectedIds,
        domain_scores: actualDistribution,
      } as unknown as AttemptInsert)
      .select("id")
      .single();

    if (insertError || !attempt) {
      return NextResponse.json(
        { error: insertError?.message ?? "Failed to create exam attempt" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      attemptId: attempt.id,
      questions: finalSelection,
      level: targetLevel,
      totalQuestions: finalSelection.length,
      distribution: actualDistribution,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
