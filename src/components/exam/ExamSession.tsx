"use client";

import { Flag, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

export interface ExamQuestion {
  id: string;
  question: string;
  options: { a: string; b: string; c: string; d: string } | null;
  domain: string;
  subdomain: string;
  difficulty: number;
  frequency_tier: number;
}

interface ExamSessionProps {
  attemptId: string;
  questions: ExamQuestion[];
}

type Phase = "active" | "confirm-submit" | "submitting" | "error";

const OPTION_LETTERS = ["a", "b", "c", "d"] as const;
const EXAM_SECONDS = 120 * 60;

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function timerClass(s: number): string {
  if (s < 60) return "text-red-400 font-mono font-bold tabular-nums";
  if (s < 600) return "text-yellow-400 font-mono font-bold tabular-nums";
  return "text-foreground font-mono font-semibold tabular-nums";
}

function navButtonClass(
  qId: string,
  current: boolean,
  answers: Record<string, string>,
  flagged: Set<string>
): string {
  const base =
    "w-8 h-8 rounded-lg text-xs font-semibold transition-all duration-150 border focus:outline-none";
  if (current) return `${base} bg-primary border-primary text-primary-foreground`;
  if (flagged.has(qId))
    return `${base} bg-amber-500/15 border-amber-500/40 text-amber-400`;
  if (answers[qId])
    return `${base} bg-secondary border-border text-foreground`;
  return `${base} bg-card border-border text-muted-foreground hover:border-primary/40`;
}

function formatLabel(slug: string): string {
  return slug
    .split("-")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

// ── Component ────────────────────────────────────────────────────────────────

export function ExamSession({ attemptId, questions }: ExamSessionProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(EXAM_SECONDS);
  const [phase, setPhase] = useState<Phase>("active");
  const [error, setError] = useState<string | null>(null);
  const [showNavigator, setShowNavigator] = useState(false);

  const phaseRef = useRef<Phase>("active");
  phaseRef.current = phase;
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const performSubmit = useCallback(
    async (currentAnswers: Record<string, string>) => {
      if (phaseRef.current === "submitting") return;
      setPhase("submitting");
      setError(null);

      try {
        const res = await fetch("/api/exam/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attemptId, answers: currentAnswers }),
        });

        const data = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(data.error ?? "Submit failed");

        router.push(`/exam/${attemptId}/results`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Submit failed");
        setPhase("active");
      }
    },
    [attemptId, router]
  );

  useEffect(() => {
    if (phase !== "active") return;
    const id = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (timeLeft !== 0) return;
    if (phaseRef.current !== "active") return;
    const tid = setTimeout(() => {
      if (phaseRef.current !== "active") return;
      void performSubmit(answersRef.current);
    }, 0);
    return () => clearTimeout(tid);
  }, [timeLeft, performSubmit]);

  useEffect(() => {
    if (phase !== "active" && phase !== "confirm-submit") return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [phase]);

  // ── Handlers ────────────────────────────────────────────────────────────

  function handleAnswer(questionId: string, letter: string) {
    if (phase !== "active") return;
    setAnswers((prev) => ({ ...prev, [questionId]: letter }));
  }

  function toggleFlag(questionId: string) {
    if (phase !== "active") return;
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  }

  function requestSubmit() {
    if (phase !== "active") return;
    const unanswered = questions.length - Object.keys(answers).length;
    if (unanswered > 0) {
      setPhase("confirm-submit");
    } else {
      void performSubmit(answers);
    }
  }

  // ── Derived values ──────────────────────────────────────────────────────

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return null;

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;
  const isSubmitting = phase === "submitting";

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-card border-b border-border px-4 py-3 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-medium leading-none">
            NETA Exam Simulation
          </p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">
            {answeredCount}/{questions.length} answered
            {flagged.size > 0 && ` · ${flagged.size} flagged`}
          </p>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 shrink-0">
          <span className={timerClass(timeLeft)}>{formatTime(timeLeft)}</span>
        </div>

        {/* Navigator toggle (mobile) */}
        <button
          type="button"
          onClick={() => setShowNavigator((v) => !v)}
          className="sm:hidden text-muted-foreground hover:text-foreground text-xs border border-border rounded-lg px-2.5 py-1.5 transition-all duration-150"
        >
          Map
        </button>

        {/* Submit button */}
        <button
          type="button"
          onClick={requestSubmit}
          disabled={isSubmitting}
          className="shrink-0 bg-primary text-primary-foreground font-medium text-xs px-4 py-2 min-h-[36px] rounded-lg hover:opacity-90 disabled:opacity-50 transition-all duration-150"
        >
          {isSubmitting ? "Submitting…" : "Submit Exam"}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Question area ─────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto px-4 py-8 max-w-3xl mx-auto w-full">
          {/* Question header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1.5 font-medium">
                Question {currentIndex + 1} of {questions.length}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2.5 py-1 rounded-md bg-primary/10 text-primary font-medium">
                  {formatLabel(currentQuestion.domain)}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-md bg-muted text-muted-foreground border border-border">
                  {formatLabel(currentQuestion.subdomain)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleFlag(currentQuestion.id)}
              className={`shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 min-h-[36px] rounded-lg border transition-all duration-150 ${
                flagged.has(currentQuestion.id)
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                  : "bg-card border-border text-muted-foreground hover:border-amber-500/40 hover:text-amber-400"
              }`}
            >
              <Flag size={12} />
              {flagged.has(currentQuestion.id) ? "Flagged" : "Flag"}
            </button>
          </div>

          {/* Question text */}
          <p className="text-foreground text-base leading-relaxed font-medium mb-7">
            {currentQuestion.question}
          </p>

          {/* Options */}
          {currentQuestion.options ? (
            <div className="space-y-2.5 mb-10">
              {OPTION_LETTERS.map((letter) => {
                const text = currentQuestion.options![letter];
                const isSelected = answers[currentQuestion.id] === letter;
                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => handleAnswer(currentQuestion.id, letter)}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-150 text-sm flex items-start gap-3 min-h-[52px] ${
                      isSelected
                        ? "bg-primary/10 border-primary/50 text-foreground"
                        : "bg-card border-border text-foreground hover:border-primary/40 hover:bg-muted"
                    }`}
                  >
                    <span
                      className={`shrink-0 w-6 h-6 rounded-full text-xs flex items-center justify-center font-semibold uppercase mt-0.5 ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="flex-1 leading-relaxed">{text}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-5 mb-10">
              <p className="text-muted-foreground text-sm">
                Free-text question — not supported in simulation mode.
              </p>
            </div>
          )}

          {/* Prev / Next navigation */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="px-5 py-2.5 min-h-[40px] bg-card hover:bg-muted disabled:opacity-30 text-foreground text-sm rounded-lg border border-border transition-all duration-150"
            >
              ← Previous
            </button>

            <button
              type="button"
              onClick={() =>
                setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))
              }
              disabled={currentIndex === questions.length - 1}
              className="px-5 py-2.5 min-h-[40px] bg-card hover:bg-muted disabled:opacity-30 text-foreground text-sm rounded-lg border border-border transition-all duration-150"
            >
              Next →
            </button>
          </div>

          {error && (
            <div className="mt-5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </main>

        {/* ── Question navigator (desktop sidebar / mobile overlay) ─── */}
        <aside
          className={`${
            showNavigator
              ? "fixed inset-0 z-30 bg-background/80 flex items-end sm:relative sm:inset-auto sm:bg-transparent sm:flex"
              : "hidden sm:flex"
          } sm:w-60 sm:border-l sm:border-border sm:bg-card flex-col`}
        >
          {/* Mobile close */}
          <div className="sm:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card w-full">
            <span className="text-sm font-semibold text-foreground">
              Question Map
            </span>
            <button
              type="button"
              onClick={() => setShowNavigator(false)}
              className="text-muted-foreground"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 w-full">
            <div className="hidden sm:block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Question Map
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 mb-5 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-md bg-primary inline-block" />
                Current
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-md bg-secondary border border-border inline-block" />
                Answered
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-md bg-amber-500/15 border border-amber-500/40 inline-block" />
                Flagged
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-md bg-card border border-border inline-block" />
                Unanswered
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-8 sm:grid-cols-6 gap-1">
              {questions.map((q, i) => (
                <button
                  key={q.id}
                  type="button"
                  title={`Question ${i + 1}${answers[q.id] ? " (answered)" : ""}${flagged.has(q.id) ? " (flagged)" : ""}`}
                  onClick={() => {
                    setCurrentIndex(i);
                    setShowNavigator(false);
                  }}
                  className={navButtonClass(
                    q.id,
                    i === currentIndex,
                    answers,
                    flagged
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-5 pt-4 border-t border-border space-y-1.5 text-xs text-muted-foreground">
              <p>
                <span className="text-foreground font-medium">
                  {answeredCount}
                </span>{" "}
                answered
              </p>
              <p>
                <span className="text-foreground font-medium">
                  {unansweredCount}
                </span>{" "}
                unanswered
              </p>
              {flagged.size > 0 && (
                <p>
                  <span className="text-amber-400 font-medium">
                    {flagged.size}
                  </span>{" "}
                  flagged for review
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* ── Submit confirmation modal ─────────────────────────────────── */}
      {phase === "confirm-submit" && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-card border border-border rounded-2xl px-6 py-6 max-w-sm w-full space-y-5 shadow-xl">
            <h2 className="text-foreground font-semibold text-lg tracking-tight">
              Submit Exam?
            </h2>
            <p className="text-muted-foreground text-sm">
              You have{" "}
              <span className="text-amber-400 font-semibold">
                {unansweredCount} unanswered
              </span>{" "}
              question{unansweredCount !== 1 ? "s" : ""}. Unanswered questions
              are marked incorrect.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPhase("active")}
                className="flex-1 min-h-[44px] py-2.5 bg-secondary hover:bg-muted text-foreground font-medium text-sm rounded-xl border border-border transition-all duration-150"
              >
                Keep Going
              </button>
              <button
                type="button"
                onClick={() => void performSubmit(answers)}
                className="flex-1 min-h-[44px] py-2.5 bg-primary text-primary-foreground font-medium text-sm rounded-xl hover:opacity-90 transition-all duration-150"
              >
                Submit Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Auto-submit overlay ───────────────────────────────────────── */}
      {phase === "submitting" && (
        <div className="fixed inset-0 z-40 bg-background/90 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-foreground font-semibold">Submitting exam…</p>
            <p className="text-muted-foreground text-sm">
              {timeLeft === 0 ? "Time's up!" : "Please wait"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
