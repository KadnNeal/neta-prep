import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isActivePro } from "@/lib/stripe";
import type { ProfileSubscription } from "@/lib/stripe";

const FREE_DAILY_LIMIT = 15;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get("domain");
    const rawCount = Math.min(50, Math.max(1, parseInt(searchParams.get("count") ?? "10", 10)));

    if (!domain) {
      return NextResponse.json({ error: "domain required" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profileRaw } = await supabase
      .from("profiles")
      .select("neta_target_level, subscription_tier, subscription_status, subscription_expires_at, stripe_customer_id, practice_questions_today, practice_count_date")
      .eq("id", user.id)
      .single();

    const profile = profileRaw as unknown as ProfileSubscription & {
      neta_target_level: number | null;
      practice_questions_today: number | null;
      practice_count_date: string | null;
    };

    const targetLevel = profile?.neta_target_level ?? 2;
    const isPro = isActivePro(profile ?? { subscription_tier: null, subscription_status: null, subscription_expires_at: null, stripe_customer_id: null });

    // ── Free tier daily cap ────────────────────────────────────────────────────
    let count = rawCount;
    if (!isPro) {
      const today = new Date().toISOString().slice(0, 10);
      const lastDate = profile?.practice_count_date ?? null;
      const usedToday = lastDate === today ? (profile?.practice_questions_today ?? 0) : 0;
      const remaining = FREE_DAILY_LIMIT - usedToday;

      if (remaining <= 0) {
        return NextResponse.json(
          { error: "daily_limit_reached", dailyLimit: FREE_DAILY_LIMIT },
          { status: 429 }
        );
      }
      count = Math.min(rawCount, remaining);
    }

    const { count: totalCount } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true })
      .eq("domain", domain)
      .eq("question_type", "exam_simulation")
      .eq("level", targetLevel);

    const total = totalCount ?? 0;
    if (total === 0) {
      return NextResponse.json({ questions: [], bookmarkedIds: [] });
    }

    // Fetch a random window (up to 150 rows) then shuffle and trim to count
    const fetchLimit = Math.min(150, total);
    const maxOffset = Math.max(0, total - fetchLimit);
    const offset = Math.floor(Math.random() * (maxOffset + 1));

    const { data: rows, error } = await supabase
      .from("questions")
      .select("id, question, options, correct_answer, explanation, domain, subdomain")
      .eq("domain", domain)
      .eq("question_type", "exam_simulation")
      .eq("level", targetLevel)
      .range(offset, offset + fetchLimit - 1);

    if (error) throw error;

    // Fisher-Yates shuffle
    const shuffled = [...(rows ?? [])];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const questions = shuffled.slice(0, count);

    // Update daily count for free users
    if (!isPro && questions.length > 0) {
      const today = new Date().toISOString().slice(0, 10);
      const lastDate = profile?.practice_count_date ?? null;
      const usedToday = lastDate === today ? (profile?.practice_questions_today ?? 0) : 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("profiles").update({
        practice_questions_today: usedToday + questions.length,
        practice_count_date: today,
      }).eq("id", user.id);
    }

    // Check which questions the user has already bookmarked
    const questionIds = questions.map((q) => q.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: bookmarks } = await (supabase as any)
      .from("bookmarked_questions")
      .select("question_id")
      .eq("user_id", user.id)
      .in("question_id", questionIds);

    const bookmarkedIds = (bookmarks ?? []).map(
      (b: { question_id: string }) => b.question_id
    );

    return NextResponse.json({
      questions,
      bookmarkedIds,
      isPro,
      dailyLimit: isPro ? null : FREE_DAILY_LIMIT,
    });
  } catch (err) {
    console.error("practice/questions error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
