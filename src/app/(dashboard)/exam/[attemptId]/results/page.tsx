import { formatSubdomainLabel, NETA_DOMAINS, type NETADomain } from "@/lib/neta-domains";
import { createClient } from "@/lib/supabase/server";
import { CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

// ── Extended types for migration columns ──────────────────────────────────────

interface AttemptRecord {
  id: string;
  user_id: string;
  level: number;
  score_percent: number | null;
  passed: boolean | null;
  domain_scores: Record<string, number> | null;
  subdomain_scores: Record<string, number> | null;
  question_ids: string[];
  user_answers: Record<string, string> | null;
  completed_at: string | null;
  started_at: string;
}

interface QuestionRecord {
  id: string;
  question: string;
  options: { a: string; b: string; c: string; d: string } | null;
  correct_answer: string;
  explanation: string;
  domain: string;
  subdomain: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreClass(pct: number) {
  if (pct >= 80) return "text-green-400";
  if (pct >= 60) return "text-yellow-400";
  return "text-red-400";
}

function scoreBarClass(pct: number) {
  if (pct >= 80) return "bg-green-500";
  if (pct >= 60) return "bg-yellow-500";
  return "bg-red-500";
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ResultsPage({
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

  const { data: rawAttempt, error } = await supabase
    .from("exam_attempts")
    .select(
      "id, user_id, level, score_percent, passed, domain_scores, subdomain_scores, question_ids, user_answers, completed_at, started_at"
    )
    .eq("id", attemptId)
    .eq("user_id", user.id)
    .single();

  if (error || !rawAttempt) redirect("/exam");

  const attempt = rawAttempt as unknown as AttemptRecord;

  if (!attempt.completed_at) redirect(`/exam/${attemptId}`);

  const questionIds: string[] = attempt.question_ids ?? [];
  const userAnswers: Record<string, string> = attempt.user_answers ?? {};

  const { data: questionsRaw } = await supabase
    .from("questions")
    .select("id, question, options, correct_answer, explanation, domain, subdomain")
    .in("id", questionIds);

  const questions = (questionsRaw ?? []) as QuestionRecord[];

  const incorrect = questions.filter(
    (q) => userAnswers[q.id] !== q.correct_answer
  );

  const domainCounts: Record<NETADomain, { correct: number; total: number }> = {
    "safety-standards": { correct: 0, total: 0 },
    "fundamentals-theory": { correct: 0, total: 0 },
    "component-testing": { correct: 0, total: 0 },
    "systems-commissioning": { correct: 0, total: 0 },
  };
  for (const q of questions) {
    const key = q.domain as NETADomain;
    if (key in domainCounts) {
      domainCounts[key].total++;
      if (userAnswers[q.id] === q.correct_answer) domainCounts[key].correct++;
    }
  }

  const scorePercent = attempt.score_percent ?? 0;
  const passed = attempt.passed ?? false;
  const subdomainScores = attempt.subdomain_scores ?? {};

  const startMs = new Date(attempt.started_at).getTime();
  const endMs = attempt.completed_at
    ? new Date(attempt.completed_at).getTime()
    : startMs;
  const minutesTaken = Math.round((endMs - startMs) / 60000);

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">

        {/* ── Pass / Fail header ───────────────────────────────────── */}
        <div className="text-center space-y-5">
          <div
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border font-semibold text-sm ${
              passed
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {passed ? (
              <CheckCircle size={16} />
            ) : (
              <XCircle size={16} />
            )}
            {passed ? "PASS" : "FAIL"}
          </div>

          <div>
            <p
              className={`text-6xl font-bold tabular-nums tracking-tight ${scoreClass(scorePercent)}`}
            >
              {scorePercent.toFixed(1)}%
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              {questions.length - incorrect.length} / {questions.length} correct
              {minutesTaken > 0 && ` · ${minutesTaken} min`}
            </p>
            {!passed && (
              <p className="text-muted-foreground text-xs mt-1">
                Passing score: 75%
              </p>
            )}
          </div>
        </div>

        {/* ── Domain breakdown ─────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl px-6 py-5 space-y-5 shadow-sm">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Domain Scores
          </h2>
          <div className="space-y-4">
            {(
              Object.entries(NETA_DOMAINS) as [
                NETADomain,
                (typeof NETA_DOMAINS)[NETADomain],
              ][]
            ).map(([domainKey, domain]) => {
              const { correct, total } = domainCounts[domainKey];
              const score = total > 0 ? (correct / total) * 100 : 0;
              return (
                <div key={domainKey}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground font-medium">
                      {domain.label}
                    </span>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {total > 0 ? `${correct}/${total}` : "—"}
                      </span>
                      <span
                        className={`text-sm font-semibold tabular-nums w-12 text-right ${
                          total > 0 ? scoreClass(score) : "text-muted-foreground"
                        }`}
                      >
                        {total > 0 ? `${score.toFixed(0)}%` : "—"}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        total > 0 ? scoreBarClass(score) : "bg-muted"
                      }`}
                      style={{ width: total > 0 ? `${score}%` : "0%" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Subdomain breakdown ───────────────────────────────────── */}
        {Object.keys(subdomainScores).length > 0 && (
          <div className="bg-card border border-border rounded-2xl px-6 py-5 space-y-4 shadow-sm">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Subdomain Scores
            </h2>
            <div className="space-y-2.5">
              {Object.entries(subdomainScores)
                .sort(([, a], [, b]) => a - b)
                .map(([sub, score]) => (
                  <div key={sub} className="flex items-center gap-4">
                    <span className="w-44 shrink-0 text-sm text-foreground truncate">
                      {formatSubdomainLabel(sub)}
                    </span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${scoreBarClass(score)}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span
                      className={`w-12 text-right text-sm font-medium tabular-nums ${scoreClass(score)}`}
                    >
                      {score.toFixed(0)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ── Incorrect answers ─────────────────────────────────────── */}
        {incorrect.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Incorrect Answers ({incorrect.length})
            </h2>

            {incorrect.map((q, idx) => {
              const userLetter = userAnswers[q.id];
              const correctLetter = q.correct_answer;
              const userText =
                q.options?.[userLetter as keyof typeof q.options];
              const correctText =
                q.options?.[correctLetter as keyof typeof q.options];

              return (
                <div
                  key={q.id}
                  className="bg-card border border-border rounded-2xl px-6 py-5 space-y-4 shadow-sm"
                >
                  {/* Question */}
                  <div className="flex items-start gap-3">
                    <span className="text-xs text-muted-foreground font-mono mt-0.5 shrink-0 w-6 text-right">
                      {idx + 1}.
                    </span>
                    <p className="text-foreground text-sm leading-relaxed font-medium">
                      {q.question}
                    </p>
                  </div>

                  {/* Answers */}
                  <div className="ml-9 space-y-2">
                    {userLetter && userText && (
                      <div className="flex items-start gap-2 text-sm">
                        <span className="text-red-400 shrink-0 font-semibold uppercase">
                          {userLetter}
                        </span>
                        <span className="text-red-400/80">{userText}</span>
                        <span className="text-muted-foreground text-xs shrink-0">
                          (your answer)
                        </span>
                      </div>
                    )}
                    {!userLetter && (
                      <p className="text-muted-foreground text-xs">
                        Not answered
                      </p>
                    )}
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-green-400 shrink-0 font-semibold uppercase">
                        {correctLetter}
                      </span>
                      <span className="text-green-400/90">{correctText}</span>
                      <span className="text-muted-foreground text-xs shrink-0">
                        (correct)
                      </span>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="ml-9 bg-muted rounded-xl px-4 py-3">
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {q.explanation}
                    </p>
                  </div>

                  {/* Subdomain tag */}
                  <div className="ml-9">
                    <span className="text-xs px-2.5 py-1 rounded-md bg-secondary text-muted-foreground border border-border">
                      {formatSubdomainLabel(q.subdomain)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {incorrect.length === 0 && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl px-6 py-8 text-center shadow-sm">
            <p className="text-green-400 font-semibold">Perfect score!</p>
            <p className="text-green-400/70 text-sm mt-1.5">
              All questions answered correctly.
            </p>
          </div>
        )}

        {/* ── Actions ───────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard"
            className="flex-1 min-h-[48px] py-3 bg-card hover:bg-muted text-foreground font-medium text-sm rounded-xl border border-border transition-all duration-150 text-center flex items-center justify-center"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/exam"
            className="flex-1 min-h-[48px] py-3 bg-primary text-primary-foreground font-medium text-sm rounded-xl hover:opacity-90 transition-all duration-150 text-center flex items-center justify-center"
          >
            Retake Exam
          </Link>
        </div>

      </div>
    </main>
  );
}
