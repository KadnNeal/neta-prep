import { createClient } from "@/lib/supabase/server";

// ── Domain config ─────────────────────────────────────────────────────────────

const L2_WEIGHTS: Record<string, number> = {
  "safety-standards":      15,
  "fundamentals-theory":   25,
  "component-testing":     55,
  "systems-commissioning":  5,
};

const DOMAIN_LABELS: Record<string, string> = {
  "safety-standards":      "Safety",
  "fundamentals-theory":   "Electrical Testing Fundamentals & Theory",
  "component-testing":     "Component Testing",
  "systems-commissioning": "Systems & Commissioning",
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DomainActivity {
  domain: string;
  label: string;
  examWeight: number;
  totalAnswered: number;
  recentAccuracy: number | null; // null if fewer than 10 answered in domain
  recentCount: number;           // how many of the last 25 exist
}

export interface DashboardData {
  examReadiness: {
    score: number | null;            // null if < 25 exam sim answered
    totalExamSimAnswered: number;
  };
  domainActivity: DomainActivity[];
  streak: number;
  totalAnswered: number;           // all modes, all time
  sessionsCompleted: number;       // distinct days with activity
  targetLevel: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function computeStreak(dates: Set<string>): number {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (!dates.has(todayStr) && !dates.has(yesterdayStr)) return 0;

  let cursor = dates.has(todayStr) ? todayStr : yesterdayStr;
  let streak = 0;
  while (dates.has(cursor)) {
    streak++;
    const d = new Date(cursor);
    d.setDate(d.getDate() - 1);
    cursor = d.toISOString().slice(0, 10);
  }
  return streak;
}

// ── Main fetch ────────────────────────────────────────────────────────────────

/** Server-only. Call from Server Components or API Route Handlers. */
export async function getDashboardData(): Promise<DashboardData | null> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("neta_target_level")
      .eq("id", user.id)
      .single();

    const targetLevel = profile?.neta_target_level ?? 2;

    // All user stats joined with question metadata, newest first
    type StatRow = {
      last_score: number | null;
      updated_at: string;
      questions: { domain: string; question_type: string; level: number };
    };

    const { data: statsRaw } = await supabase
      .from("user_question_stats")
      .select("last_score, updated_at, questions!inner(domain, question_type, level)")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    const allStats = (statsRaw ?? []) as unknown as StatRow[];

    // ── Streak & sessions ─────────────────────────────────────────────────────
    const activityDates = new Set(allStats.map((s) => s.updated_at.slice(0, 10)));
    const streak = computeStreak(activityDates);
    const sessionsCompleted = activityDates.size;
    const totalAnswered = allStats.length;

    // ── Exam readiness ────────────────────────────────────────────────────────
    // Uses only exam_simulation questions at the user's target level
    const examSimStats = allStats.filter(
      (s) =>
        s.questions.question_type === "exam_simulation" &&
        s.questions.level === targetLevel
    );

    const totalExamSimAnswered = examSimStats.length;
    let examScore: number | null = null;

    if (totalExamSimAnswered >= 25) {
      const last100 = examSimStats.slice(0, 100);

      // Per-domain accuracy in that window
      const domainBuckets = new Map<string, { correct: number; total: number }>();
      for (const s of last100) {
        const domain = s.questions.domain;
        const bucket = domainBuckets.get(domain) ?? { correct: 0, total: 0 };
        bucket.total++;
        if ((s.last_score ?? 0) >= 3) bucket.correct++;
        domainBuckets.set(domain, bucket);
      }

      // Weighted score — domains with no data in the window contribute 0
      let weighted = 0;
      for (const [domain, weight] of Object.entries(L2_WEIGHTS)) {
        const bucket = domainBuckets.get(domain);
        if (bucket && bucket.total > 0) {
          weighted += (weight / 100) * (bucket.correct / bucket.total);
        }
      }
      examScore = Math.round(weighted * 100);
    }

    // ── Domain activity ───────────────────────────────────────────────────────
    // All question types at the user's target level, newest first (already ordered)
    const targetLevelStats = allStats.filter(
      (s) => s.questions.level === targetLevel
    );

    const domainActivity: DomainActivity[] = Object.keys(L2_WEIGHTS).map(
      (domain) => {
        const rows = targetLevelStats.filter(
          (s) => s.questions.domain === domain
        );
        const last25 = rows.slice(0, 25);
        const recentCorrect = last25.filter(
          (s) => (s.last_score ?? 0) >= 3
        ).length;

        return {
          domain,
          label: DOMAIN_LABELS[domain] ?? domain,
          examWeight: L2_WEIGHTS[domain],
          totalAnswered: rows.length,
          recentAccuracy:
            last25.length >= 10
              ? Math.round((recentCorrect / last25.length) * 100)
              : null,
          recentCount: last25.length,
        };
      }
    );

    return {
      examReadiness: { score: examScore, totalExamSimAnswered },
      domainActivity,
      streak,
      totalAnswered,
      sessionsCompleted,
      targetLevel,
    };
  } catch {
    return null;
  }
}
