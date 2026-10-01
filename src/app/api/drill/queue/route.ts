import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isActivePro } from "@/lib/stripe";
import type { ProfileSubscription } from "@/lib/stripe";
import { paidOptionExplanations } from "@/lib/explanations";

const QUEUE_LIMIT = 20;

// option_explanations / answer_key_flag (S43) and the billing columns aren't in the
// generated types yet, so query results are cast to these shapes.
interface QueueItem {
  id: string | null;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_date: string | null;
  last_score: number | null;
  question_id: string;
  questions: Record<string, unknown> | null;
}
type ProfileRow = ProfileSubscription & { neta_target_level: number | null };
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
    const { data: profileRaw } = await supabase
      .from("profiles")
      .select("neta_target_level, subscription_tier, subscription_status, subscription_expires_at, stripe_customer_id")
      .eq("id", user.id)
      .single();

    const profile = profileRaw as unknown as ProfileRow | null;
    const targetLevel = profile?.neta_target_level ?? 3;
    const isPro = !!profile && isActivePro(profile);
    const today = new Date().toISOString().split("T")[0];

    // 1. Due review cards: join user_question_stats with questions,
    //    filter by next_review_date <= today, order by frequency_tier then date
    const { data: dueRaw, error: dueError } = await supabase
      .from("user_question_stats")
      .select(`
        id,
        ease_factor,
        interval_days,
        repetitions,
        next_review_date,
        last_score,
        question_id,
        questions!inner (
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
          trap_pattern,
          option_explanations,
          answer_key_flag
        )
      `)
      .eq("user_id", user.id)
      .lte("next_review_date", today)
      .eq("questions.question_type", "exam_simulation")
      .eq("questions.level", targetLevel)
      .limit(QUEUE_LIMIT);

    if (dueError) {
      return NextResponse.json({ error: dueError.message }, { status: 500 });
    }
    const dueCards = (dueRaw ?? []) as unknown as QueueItem[];

    // Sort in application code: frequency_tier ASC (tier 1 first),
    // then next_review_date ASC (oldest overdue first)
    const sortedDue = dueCards.sort((a, b) => {
      const qA = a.questions;
      const qB = b.questions;
      const tierA = (qA?.frequency_tier as number) ?? 3;
      const tierB = (qB?.frequency_tier as number) ?? 3;
      if (tierA !== tierB) return tierA - tierB;
      return (a.next_review_date ?? "").localeCompare(b.next_review_date ?? "");
    });

    // 2. New questions the user hasn't seen yet (fill remaining slots)
    const remaining = QUEUE_LIMIT - sortedDue.length;

    let newQuestions: QueueItem[] = [];
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
        .eq("question_type", "exam_simulation")
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
      newQuestions = ((unseen ?? []) as unknown as Record<string, unknown>[]).map((q) => ({
        id: null,
        ease_factor: 2.5,
        interval_days: 1,
        repetitions: 0,
        next_review_date: today,
        last_score: null,
        question_id: q.id as string,
        questions: q,
      }));
    }

    // Per-choice explanations are Pro-only (S43): resolve them server-side and drop the
    // raw columns, so free users never receive them (new questions use select("*")).
    function withPaidExplanations(item: QueueItem): QueueItem {
      const q = item.questions;
      if (!q) return item;
      const { option_explanations, answer_key_flag, ...rest } = q;
      return {
        ...item,
        questions: {
          ...rest,
          option_explanations: paidOptionExplanations(
            { option_explanations, answer_key_flag: answer_key_flag as string | null },
            isPro,
          ),
        },
      };
    }

    const due = sortedDue.map(withPaidExplanations);
    const fresh = newQuestions.map(withPaidExplanations);

    return NextResponse.json({
      due,
      new: fresh,
      total: due.length + fresh.length,
      isPro,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
