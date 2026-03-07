import { NETA_DOMAINS, TIER1_SUBDOMAINS } from "@/lib/neta-domains";
import { createClient } from "@/lib/supabase/server";

// ---- Types ----------------------------------------------------------------

export interface SubdomainMastery {
  mastery: number; // 0–100
  seen: number; // questions the user has answered
  total: number; // total questions in subdomain at user's level
  domain: string; // parent domain key
}

export interface ReadinessData {
  /** Per-subdomain mastery stats */
  subdomainMastery: Record<string, SubdomainMastery>;
  /** Per-domain aggregate mastery 0–100 */
  domainMastery: Record<string, number>;
  streak: number;
  totalAnswered: number;
  averageEaseFactor: number;
  examDate: string | null;
  targetLevel: number;
  isExamReady: boolean;
  examSimCount: number;
  bestSimScore: number | null;
}

// ---- Helpers ---------------------------------------------------------------

function computeMastery(
  questionIds: string[],
  statsMap: Map<string, number> // questionId → easeFactor
): { mastery: number; seen: number; total: number } {
  const total = questionIds.length;
  if (total === 0) return { mastery: 0, seen: 0, total: 0 };

  let seen = 0;
  let efSum = 0;
  for (const id of questionIds) {
    const ef = statsMap.get(id);
    if (ef !== undefined) {
      seen++;
      efSum += ef;
    }
  }

  // mastery = sum(easeFactor) / (total * 2.5) * 100
  // A question answered with default EF=2.5 contributes exactly 1/total.
  // Unseen questions contribute 0. Capped at 100.
  const mastery = Math.min(
    Math.round((efSum / (total * 2.5)) * 100),
    100
  );

  return { mastery, seen, total };
}

function computeStreak(updatedAts: string[]): number {
  const dates = new Set(updatedAts.map((ts) => ts.slice(0, 10)));

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  // Streak only counts if active today or yesterday (doesn't break mid-day)
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

// ---- Main fetch ------------------------------------------------------------

/** Server-only. Call from Server Components or API Route Handlers. */
export async function getReadinessData(): Promise<ReadinessData | null> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    // 1. Profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("neta_target_level, exam_date")
      .eq("id", user.id)
      .single();

    const targetLevel = profile?.neta_target_level ?? 3;

    // 2. Questions at target level
    const { data: questions, error: qError } = await supabase
      .from("questions")
      .select("id, subdomain, domain")
      .eq("level", targetLevel);

    if (qError) return null;

    // 3. User stats (all of them)
    const { data: stats } = await supabase
      .from("user_question_stats")
      .select("question_id, ease_factor, updated_at")
      .eq("user_id", user.id);

    // 4. Exam attempts (completed, for this level)
    const { data: exams } = await supabase
      .from("exam_attempts")
      .select("score_percent")
      .eq("user_id", user.id)
      .eq("level", targetLevel)
      .not("completed_at", "is", null)
      .order("score_percent", { ascending: false });

    // Build quick-lookup: questionId → easeFactor
    const efMap = new Map<string, number>();
    const updatedAts: string[] = [];
    for (const s of stats ?? []) {
      efMap.set(s.question_id, s.ease_factor);
      updatedAts.push(s.updated_at);
    }

    // Group question IDs by subdomain and domain
    const subdomainIds = new Map<string, string[]>();
    const domainIds = new Map<string, string[]>();

    for (const q of questions ?? []) {
      const sd = subdomainIds.get(q.subdomain) ?? [];
      sd.push(q.id);
      subdomainIds.set(q.subdomain, sd);

      const dd = domainIds.get(q.domain) ?? [];
      dd.push(q.id);
      domainIds.set(q.domain, dd);
    }

    // Compute subdomain mastery
    const subdomainMastery: Record<string, SubdomainMastery> = {};
    for (const [subdomain, ids] of subdomainIds.entries()) {
      // Find which domain this subdomain belongs to
      const parentDomain =
        Object.entries(NETA_DOMAINS).find(([, d]) =>
          (d.subdomains as readonly string[]).includes(subdomain)
        )?.[0] ?? "component-testing";

      const { mastery, seen, total } = computeMastery(ids, efMap);
      subdomainMastery[subdomain] = { mastery, seen, total, domain: parentDomain };
    }

    // Compute domain mastery for all 4 official domains
    const domainMastery: Record<string, number> = {};
    for (const [domain] of Object.entries(NETA_DOMAINS)) {
      const ids = domainIds.get(domain) ?? [];
      const { mastery } = computeMastery(ids, efMap);
      domainMastery[domain] = mastery;
    }

    // Aggregate stats
    const allStats = stats ?? [];
    const totalAnswered = allStats.length;
    const averageEaseFactor =
      totalAnswered > 0
        ? allStats.reduce((sum, s) => sum + s.ease_factor, 0) / totalAnswered
        : 0;

    // Streak
    const streak = computeStreak(updatedAts);

    // Exam simulations
    const examSimCount = (exams ?? []).length;
    const bestSimScore = exams?.[0]?.score_percent ?? null;

    // Exam Ready criteria
    const allSubdomainsMet = Object.values(subdomainMastery).every(
      (m) => m.total === 0 || m.mastery >= 80
    );
    const tier1Met = TIER1_SUBDOMAINS.every(
      (sd) => (subdomainMastery[sd]?.mastery ?? 0) >= 90
    );
    const simMet = examSimCount >= 1 && (bestSimScore ?? 0) >= 75;
    const isExamReady =
      totalAnswered > 0 && allSubdomainsMet && tier1Met && simMet;

    return {
      subdomainMastery,
      domainMastery,
      streak,
      totalAnswered,
      averageEaseFactor,
      examDate: profile?.exam_date ?? null,
      targetLevel,
      isExamReady,
      examSimCount,
      bestSimScore,
    };
  } catch {
    return null;
  }
}
