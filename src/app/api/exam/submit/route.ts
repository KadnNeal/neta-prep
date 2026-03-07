import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

const submitSchema = z.object({
  attemptId: z.uuid(),
  answers: z.record(z.string(), z.string()),
});

// Extended type for columns added in migration (not yet in generated types)
interface ExamAttemptExtended {
  id: string;
  user_id: string;
  level: number;
  completed_at: string | null;
  question_ids: string[];
}

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

    const { attemptId, answers } = parsed.data;

    // Fetch the exam attempt (verify ownership + not already completed)
    const { data: attemptRaw, error: attemptError } = await supabase
      .from("exam_attempts")
      .select("id, user_id, level, completed_at, question_ids")
      .eq("id", attemptId)
      .eq("user_id", user.id)
      .single();

    if (attemptError || !attemptRaw) {
      return NextResponse.json(
        { error: "Exam attempt not found" },
        { status: 404 }
      );
    }

    const attempt = attemptRaw as unknown as ExamAttemptExtended;

    if (attempt.completed_at) {
      return NextResponse.json(
        { error: "Exam already submitted" },
        { status: 409 }
      );
    }

    // Fetch questions with correct answers (safe — exam is being submitted)
    const { data: questions, error: qError } = await supabase
      .from("questions")
      .select("id, correct_answer, domain, subdomain")
      .in("id", attempt.question_ids);

    if (qError || !questions) {
      return NextResponse.json(
        { error: "Failed to fetch questions" },
        { status: 500 }
      );
    }

    // Score the exam
    let correct = 0;
    const domainCorrect: Record<string, number> = {};
    const domainTotal: Record<string, number> = {};
    const subdomainCorrect: Record<string, number> = {};
    const subdomainTotal: Record<string, number> = {};

    for (const q of questions) {
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer === q.correct_answer;

      if (isCorrect) correct++;

      domainCorrect[q.domain] = (domainCorrect[q.domain] ?? 0) + (isCorrect ? 1 : 0);
      domainTotal[q.domain] = (domainTotal[q.domain] ?? 0) + 1;

      subdomainCorrect[q.subdomain] =
        (subdomainCorrect[q.subdomain] ?? 0) + (isCorrect ? 1 : 0);
      subdomainTotal[q.subdomain] = (subdomainTotal[q.subdomain] ?? 0) + 1;
    }

    const total = questions.length;
    const scorePercent = total > 0 ? (correct / total) * 100 : 0;
    const passed = scorePercent >= 75;

    const domainScores: Record<string, number> = {};
    for (const domain of Object.keys(domainTotal)) {
      domainScores[domain] =
        ((domainCorrect[domain] ?? 0) / (domainTotal[domain] ?? 1)) * 100;
    }

    const subdomainScores: Record<string, number> = {};
    for (const sub of Object.keys(subdomainTotal)) {
      subdomainScores[sub] =
        ((subdomainCorrect[sub] ?? 0) / (subdomainTotal[sub] ?? 1)) * 100;
    }

    // Update exam_attempt — cast through unknown because generated types predate
    // the user_answers migration column
    type AttemptUpdate = Database["public"]["Tables"]["exam_attempts"]["Update"];

    const { error: updateError } = await supabase
      .from("exam_attempts")
      .update({
        completed_at: new Date().toISOString(),
        score_percent: scorePercent,
        passed,
        domain_scores: domainScores,
        subdomain_scores: subdomainScores,
        user_answers: answers,
      } as unknown as AttemptUpdate)
      .eq("id", attemptId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      scorePercent,
      passed,
      correct,
      total,
      domainScores,
      subdomainScores,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
