"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  Trophy,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import type { RoadmapModule, RoadmapQuestion } from "@/lib/roadmap";

interface Props {
  module: RoadmapModule;
  questions: RoadmapQuestion[];
  nextModuleId: string | null;
  alreadyCompleted: boolean;
  previousScore: number | null;
}

interface QuestionResult {
  questionId: string;
  chosen: string;
  correct: string;
  explanation: string;
  wasCorrect: boolean;
}

type Phase = "quiz" | "result";

export function ModuleQuiz({
  module,
  questions,
  nextModuleId,
  alreadyCompleted,
  previousScore,
}: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("quiz");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  // reveal is the per-question result computed client-side immediately on submit
  const [reveal, setReveal] = useState<QuestionResult | null>(null);
  const [accumulated, setAccumulated] = useState<QuestionResult[]>([]);
  const [finalScore, setFinalScore] = useState<number>(previousScore ?? 0);
  const [finalResults, setFinalResults] = useState<QuestionResult[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [startedAt] = useState(() => Date.now());

  const current = questions[currentIdx];
  const totalQuestions = questions.length;
  const isLast = currentIdx === totalQuestions - 1;
  const progressPct = Math.round((currentIdx / totalQuestions) * 100);

  function selectAnswer(letter: string) {
    if (reveal) return;
    setChosen(letter);
  }

  function submitAnswer() {
    if (!chosen || !current) return;
    // Compute result immediately client-side using question data
    const wasCorrect = chosen === current.correct_answer;
    setReveal({
      questionId: current.id,
      chosen,
      correct: current.correct_answer,
      explanation: current.explanation,
      wasCorrect,
    });
  }

  function nextQuestion() {
    if (!reveal || !current) return;
    const updatedAccumulated = [...accumulated, reveal];
    setAccumulated(updatedAccumulated);

    if (isLast) {
      saveResults(updatedAccumulated);
    } else {
      setCurrentIdx((i) => i + 1);
      setChosen(null);
      setReveal(null);
    }
  }

  async function saveResults(results: QuestionResult[]) {
    setSubmitting(true);
    const correct = results.filter((r) => r.wasCorrect).length;
    const score = Math.round((correct / totalQuestions) * 100);

    // Optimistically show results immediately — server save happens in background
    setFinalScore(score);
    setFinalResults(results);
    setPhase("result");

    try {
      const answers: Record<string, string> = {};
      for (const r of results) answers[r.questionId] = r.chosen;

      await fetch(`/api/roadmap/module/${module.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, timeSpentMs: Date.now() - startedAt }),
      });
    } catch {
      // Progress save failed silently — score already shown
    } finally {
      setSubmitting(false);
    }
  }

  if (phase === "result") {
    return (
      <ResultScreen
        score={finalScore}
        results={finalResults}
        nextModuleId={nextModuleId}
        totalQuestions={totalQuestions}
        saving={submitting}
        onRetake={() => {
          setPhase("quiz");
          setCurrentIdx(0);
          setChosen(null);
          setReveal(null);
          setAccumulated([]);
          setFinalResults([]);
        }}
        router={router}
      />
    );
  }

  const optionKeys = ["a", "b", "c", "d"] as const;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
          {module.title}
        </p>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Question {currentIdx + 1} of {totalQuestions}
          </span>
          {alreadyCompleted && previousScore !== null && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
              Previous: {previousScore.toFixed(0)}%
            </span>
          )}
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      {current && (
        <div className="bg-card border border-border rounded-2xl px-6 py-6 shadow-sm space-y-5">
          <p className="text-foreground font-medium text-lg leading-relaxed">
            {current.question}
          </p>

          <div className="space-y-2.5">
            {optionKeys.map((letter) => {
              const text = current.options[letter];
              const isChosen = chosen === letter;
              const isCorrectAnswer = letter === current.correct_answer;
              const isWrongChosen = !!reveal && isChosen && !reveal.wasCorrect;
              const showCorrect = !!reveal && isCorrectAnswer;

              let cls =
                "w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-150 ";
              if (!reveal) {
                cls += isChosen
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted/50";
              } else if (showCorrect) {
                cls += "border-green-500 bg-green-500/10 text-green-400";
              } else if (isWrongChosen) {
                cls += "border-red-500 bg-red-500/10 text-red-400";
              } else {
                cls +=
                  "border-border bg-background text-muted-foreground opacity-50";
              }

              return (
                <button
                  key={letter}
                  onClick={() => selectAnswer(letter)}
                  className={cls}
                  disabled={!!reveal}
                >
                  <span className="font-semibold mr-2 uppercase">{letter}.</span>
                  {text}
                </button>
              );
            })}
          </div>

          {/* Explanation after reveal */}
          {reveal && (
            <div
              className={`rounded-xl px-4 py-3 text-sm border ${
                reveal.wasCorrect
                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5 font-semibold">
                {reveal.wasCorrect ? (
                  <CheckCircle2 size={15} />
                ) : (
                  <XCircle size={15} />
                )}
                {reveal.wasCorrect ? "Correct!" : "Incorrect"}
              </div>
              <p className="text-foreground/80 text-sm leading-relaxed">
                {reveal.explanation}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end">
            {!reveal ? (
              <button
                onClick={submitAnswer}
                disabled={!chosen}
                className="bg-primary text-primary-foreground font-medium text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                disabled={submitting}
                className="flex items-center gap-2 bg-primary text-primary-foreground font-medium text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-all duration-150 disabled:opacity-60"
              >
                {isLast ? (submitting ? "Saving…" : "See Results") : "Next Question"}
                {!submitting && <ChevronRight size={15} />}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Result screen ──────────────────────────────────────────────────────────────

function ResultScreen({
  score,
  results,
  nextModuleId,
  totalQuestions,
  saving,
  onRetake,
  router,
}: {
  score: number;
  results: QuestionResult[];
  nextModuleId: string | null;
  totalQuestions: number;
  saving: boolean;
  onRetake: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  const passed = score >= 80;
  const correctCount = results.filter((r) => r.wasCorrect).length;
  const incorrectResults = results.filter((r) => !r.wasCorrect);
  const [showReview, setShowReview] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div
        className={`bg-card border rounded-2xl px-6 py-8 text-center shadow-sm ${
          passed ? "border-green-500/30" : "border-red-500/30"
        }`}
      >
        <div
          className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            passed ? "bg-green-500/10" : "bg-red-500/10"
          }`}
        >
          {passed ? (
            <Trophy className="text-green-400" size={28} />
          ) : (
            <RotateCcw className="text-red-400" size={28} />
          )}
        </div>

        <h2 className="text-2xl font-semibold text-foreground mb-1">
          {score.toFixed(0)}%
        </h2>
        <p className="text-muted-foreground text-sm mb-2">
          {correctCount} / {totalQuestions} correct
        </p>

        {passed ? (
          <p className="text-green-400 font-medium text-sm">
            Module Complete!
            {nextModuleId ? " Next module unlocked." : " Roadmap finished!"}
          </p>
        ) : (
          <p className="text-red-400 font-medium text-sm">
            Need 80% to unlock the next module. Review and try again.
          </p>
        )}
        {saving && (
          <p className="text-xs text-muted-foreground mt-2">Saving progress…</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => router.push("/roadmap")}
          className="flex-1 bg-card border border-border text-foreground font-medium text-sm px-5 py-2.5 rounded-lg hover:border-primary/40 transition-all duration-150 text-center"
        >
          Back to Roadmap
        </button>

        {passed && nextModuleId ? (
          <button
            onClick={() => router.push(`/roadmap/module/${nextModuleId}`)}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-medium text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-all duration-150"
          >
            Next Module
            <ArrowRight size={15} />
          </button>
        ) : (
          <button
            onClick={onRetake}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-medium text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-all duration-150"
          >
            <RotateCcw size={15} />
            Retake Module
          </button>
        )}
      </div>

      {incorrectResults.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <button
            onClick={() => setShowReview((v) => !v)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/30 transition-all duration-150"
          >
            <span className="text-sm font-semibold text-foreground">
              Review {incorrectResults.length} incorrect answer
              {incorrectResults.length !== 1 ? "s" : ""}
            </span>
            <ChevronRight
              size={16}
              className={`text-muted-foreground transition-transform duration-150 ${
                showReview ? "rotate-90" : ""
              }`}
            />
          </button>

          {showReview && (
            <div className="px-6 pb-6 space-y-4 border-t border-border pt-4">
              {incorrectResults.map((r, i) => (
                <div key={i} className="space-y-1.5">
                  <p className="text-sm text-foreground font-medium">
                    You chose:{" "}
                    <span className="text-red-400 uppercase font-semibold">
                      {r.chosen}
                    </span>{" "}
                    · Correct:{" "}
                    <span className="text-green-400 uppercase font-semibold">
                      {r.correct}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {r.explanation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
