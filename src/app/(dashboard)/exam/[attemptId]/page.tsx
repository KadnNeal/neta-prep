import { ExamSession, type ExamQuestion } from "@/components/exam/ExamSession";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Extended type for migration-added columns
interface AttemptRecord {
  id: string;
  user_id: string;
  completed_at: string | null;
  level: number;
  question_ids: string[];
}

export default async function ActiveExamPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch exam attempt
  const { data: rawAttempt, error: attemptError } = await supabase
    .from("exam_attempts")
    .select("id, user_id, completed_at, level, question_ids")
    .eq("id", attemptId)
    .eq("user_id", user.id)
    .single();

  if (attemptError || !rawAttempt) redirect("/exam");

  const attempt = rawAttempt as unknown as AttemptRecord;

  // If already submitted → go to results
  if (attempt.completed_at) {
    redirect(`/exam/${attemptId}/results`);
  }

  const questionIds: string[] = attempt.question_ids ?? [];
  if (questionIds.length === 0) redirect("/exam");

  // Fetch questions WITHOUT correct_answer — safe to send to client
  const { data: questions, error: qError } = await supabase
    .from("questions")
    .select(
      "id, question, options, domain, subdomain, difficulty, frequency_tier"
    )
    .in("id", questionIds);

  if (qError || !questions) redirect("/exam");

  // Reorder to match the original selection order
  const questionMap = new Map(questions.map((q) => [q.id, q]));
  const orderedQuestions: ExamQuestion[] = questionIds
    .map((id) => questionMap.get(id))
    .filter((q): q is ExamQuestion => q !== undefined);

  return (
    <ExamSession
      attemptId={attemptId}
      questions={orderedQuestions}
    />
  );
}
