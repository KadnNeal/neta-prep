import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { createClient } from "@/lib/supabase/server";
import { calculateSM2 } from "@/lib/sm2";

const submitSchema = z.object({
  questionId: z.uuid(),
  quality: z.int().min(0).max(5),
  timeSpentMs: z.int().min(0).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json();
    const parsed = submitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { questionId, quality, timeSpentMs } = parsed.data;

    // Verify question exists
    const { data: question, error: questionError } = await supabase
      .from("questions")
      .select("id")
      .eq("id", questionId)
      .single();

    if (questionError || !question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Get existing stats or use defaults
    const { data: existingStats } = await supabase
      .from("user_question_stats")
      .select("*")
      .eq("user_id", user.id)
      .eq("question_id", questionId)
      .single();

    const currentEaseFactor = existingStats?.ease_factor ?? 2.5;
    const currentInterval = existingStats?.interval_days ?? 1;
    const currentRepetitions = existingStats?.repetitions ?? 0;

    // Run SM-2 calculation
    const result = calculateSM2({
      quality,
      easeFactor: currentEaseFactor,
      interval: currentInterval,
      repetitions: currentRepetitions,
    });

    // Upsert user_question_stats
    const statsData = {
      user_id: user.id,
      question_id: questionId,
      ease_factor: result.easeFactor,
      interval_days: result.interval,
      repetitions: result.repetitions,
      next_review_date: result.nextReviewDate,
      last_score: quality,
      time_spent_ms: timeSpentMs ?? null,
    };

    if (existingStats) {
      const { error: updateError } = await supabase
        .from("user_question_stats")
        .update(statsData)
        .eq("id", existingStats.id);

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }
    } else {
      const { error: insertError } = await supabase
        .from("user_question_stats")
        .insert(statsData);

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      easeFactor: result.easeFactor,
      interval: result.interval,
      repetitions: result.repetitions,
      nextReviewDate: result.nextReviewDate,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
