import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const QUEUE_LIMIT = 20;
const NEW_QUESTIONS_LIMIT = 5;

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's target level
    const { data: profile } = await supabase
      .from("profiles")
      .select("neta_target_level")
      .eq("id", user.id)
      .single();

    const targetLevel = profile?.neta_target_level ?? 3;
    const today = new Date().toISOString().split("T")[0];

    // 1. Due review cards: join user_question_stats with questions,
    //    filter by next_review_date <= today, order by frequency_tier then date
    const { data: dueCards, error: dueError } = await supabase
      .from("user_question_stats")
      .select(`
        id,
        ease_factor,
        interval_days,
        repetitions,
        next_review_date,
        last_score,
        question_id,
        questions (
          id,
          domain,
          subdomain,
          level,
          concept_type,
          difficulty,
          frequency_tier,
          question,
          options,
          correct_answer,
          explanation,
          trap_pattern
        )
      `)
      .eq("user_id", user.id)
      .lte("next_review_date", today)
      .limit(QUEUE_LIMIT);

    if (dueError) {
      return NextResponse.json({ error: dueError.message }, { status: 500 });
    }

    // Sort in application code: frequency_tier ASC (tier 1 first),
    // then next_review_date ASC (oldest overdue first)
    const sortedDue = (dueCards ?? []).sort((a, b) => {
      const qA = a.questions as Record<string, unknown> | null;
      const qB = b.questions as Record<string, unknown> | null;
      const tierA = (qA?.frequency_tier as number) ?? 3;
      const tierB = (qB?.frequency_tier as number) ?? 3;
      if (tierA !== tierB) return tierA - tierB;
      return (a.next_review_date ?? "").localeCompare(b.next_review_date ?? "");
    });

    // 2. New questions the user hasn't seen yet (fill remaining slots)
    const remaining = QUEUE_LIMIT - sortedDue.length;

    let newQuestions: typeof dueCards = [];
    if (remaining > 0) {
      // Get IDs of questions the user already has stats for
      const { data: seenIds } = await supabase
        .from("user_question_stats")
        .select("question_id")
        .eq("user_id", user.id);

      const seenQuestionIds = (seenIds ?? []).map((s) => s.question_id);

      let query = supabase
        .from("questions")
        .select("*")
        .eq("level", targetLevel)
        .order("frequency_tier", { ascending: true })
        .order("difficulty", { ascending: true })
        .limit(Math.min(remaining, NEW_QUESTIONS_LIMIT));

      if (seenQuestionIds.length > 0) {
        // Filter out questions already seen — use .not with 'in' operator
        query = query.not(
          "id",
          "in",
          `(${seenQuestionIds.join(",")})`
        );
      }

      const { data: unseen, error: unseenError } = await query;

      if (unseenError) {
        return NextResponse.json(
          { error: unseenError.message },
          { status: 500 }
        );
      }

      // Wrap new questions in the same shape as due cards for consistency
      newQuestions = (unseen ?? []).map((q) => ({
        id: null as unknown as string,
        ease_factor: 2.5,
        interval_days: 1,
        repetitions: 0,
        next_review_date: today,
        last_score: null,
        question_id: q.id,
        questions: q,
      }));
    }

    return NextResponse.json({
      due: sortedDue,
      new: newQuestions,
      total: sortedDue.length + (newQuestions?.length ?? 0),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
