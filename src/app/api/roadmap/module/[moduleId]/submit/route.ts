import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface SubmitBody {
  answers: Record<string, string>; // questionId → chosen letter
  timeSpentMs: number;
}

interface QuestionRow {
  id: string;
  correct_answer: string;
  explanation: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const { moduleId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as SubmitBody;
    const { answers, timeSpentMs } = body;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
    }

    // Fetch questions with correct answers for scoring
    const { data: questionsRaw, error: qError } = await supabase
      .from("questions")
      .select("id, correct_answer, explanation")
      .eq("roadmap_module_id" as "id", moduleId)
      .eq("question_type" as "id", "roadmap");

    if (qError) {
      return NextResponse.json({ error: qError.message }, { status: 500 });
    }

    const questions = (questionsRaw ?? []) as unknown as QuestionRow[];

    if (questions.length === 0) {
      return NextResponse.json(
        { error: "No questions found for this module" },
        { status: 404 }
      );
    }

    // Score the answers
    let correct = 0;
    const results = questions.map((q) => {
      const chosen = answers[q.id] ?? "";
      const wasCorrect = chosen === q.correct_answer;
      if (wasCorrect) correct++;
      return {
        questionId: q.id,
        chosen,
        correct: q.correct_answer,
        explanation: q.explanation,
        wasCorrect,
      };
    });

    const total = questions.length;
    const scorePercentage = Math.round((correct / total) * 100);
    const passed = scorePercentage >= 80;
    const now = new Date().toISOString();
    void timeSpentMs; // tracked for future use

    // Upsert user_roadmap_progress
    const progressData = {
      user_id: user.id,
      module_id: moduleId,
      status: passed ? "completed" : "in_progress",
      questions_completed: total,
      questions_correct: correct,
      score_percentage: scorePercentage,
      started_at: now,
      completed_at: passed ? now : null,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: upsertError } = await (supabase as any)
      .from("user_roadmap_progress")
      .upsert(progressData, { onConflict: "user_id,module_id" });

    if (upsertError) {
      return NextResponse.json(
        { error: upsertError.message },
        { status: 500 }
      );
    }

    // Find next module id
    const { data: nextRaw } = await supabase
      .from("roadmap_modules" as "profiles")
      .select("id")
      .eq("unlocks_after" as "id", moduleId)
      .single();

    const nextModuleId =
      (nextRaw as unknown as { id: string } | null)?.id ?? null;

    return NextResponse.json({
      score_percentage: scorePercentage,
      questions_correct: correct,
      total_questions: total,
      passed,
      next_module_id: nextModuleId,
      results,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
