"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, CheckCircle2, ChevronRight, XCircle } from "lucide-react";

interface PracticeQuestion {
  id: string;
  question: string;
  options: { a: string; b: string; c: string; d: string };
  correct_answer: string;
  explanation: string;
  domain: string;
  subdomain: string;
}

type Phase = "setup" | "loading" | "session" | "results";

// ── Explanation helpers ───────────────────────────────────────────────────────

type ParsedExplanation = { correct: string; a: string; b: string; c: string; d: string };

function parseExplanation(raw: string): ParsedExplanation {
  function extract(label: string): string {
    const re = new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\n(?:CORRECT|WRONG_[ABCD]):|\\s*$)`);
    return raw.match(re)?.[1]?.trim() ?? "";
  }
  return {
    correct: extract("CORRECT"),
    a: extract("WRONG_A"),
    b: extract("WRONG_B"),
    c: extract("WRONG_C"),
    d: extract("WRONG_D"),
  };
}

function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((seg, i) =>
        seg.startsWith("**") && seg.endsWith("**") ? (
          <strong key={i} className="font-semibold text-foreground">
            {seg.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{seg}</span>
        )
      )}
    </>
  );
}

function WrongAccordion({
  letter,
  text,
  open,
  onToggle,
}: {
  letter: string;
  text: string;
  open: boolean;
  onToggle: () => void;
}) {
  if (!text) return null;
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full py-2.5 text-left hover:opacity-80 transition-opacity duration-150"
      >
        <span className="text-sm font-medium text-muted-foreground">
          Why {letter.toUpperCase()} is wrong
        </span>
        <ChevronRight
          size={14}
          className={`shrink-0 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-90" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-sm text-foreground/80 leading-relaxed pb-3 pr-4">
            <InlineMarkdown text={text} />
          </p>
        </div>
      </div>
    </div>
  );
}

// Fix 4: correct NETA Level 2 weights (15 / 25 / 55 / 5)
const DOMAINS = [
  { key: "safety-standards", label: "Safety", weight: 15 },
  { key: "fundamentals-theory", label: "Fundamentals & Theory", weight: 25 },
  { key: "component-testing", label: "Component Testing", weight: 55 },
  { key: "systems-commissioning", label: "Systems & Commissioning", weight: 5 },
] as const;

// Fix 1: count options 10 / 15 / 25
const COUNTS = [10, 15, 25] as const;

// ── Setup ────────────────────────────────────────────────────────────────────

function SetupScreen({
  onStart,
  error,
  isFree,
}: {
  onStart: (domain: string, count: number) => void;
  error: string | null;
  isFree: boolean;
}) {
  const [domain, setDomain] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Practice Mode
        </h1>
        <p className="text-muted-foreground text-sm mt-1.5">
          Target your weak areas with instant feedback and AI explanations after
          every answer
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Choose a Domain
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {DOMAINS.map((d) => (
            <button
              key={d.key}
              type="button"
              onClick={() => setDomain(d.key)}
              className={`text-left p-4 rounded-xl border-2 transition-all duration-150 ${
                domain === d.key
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <p
                className={`font-semibold text-sm ${
                  domain === d.key ? "text-primary" : "text-foreground"
                }`}
              >
                {d.label}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {d.weight}% of exam
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Number of Questions
          </h2>
          {isFree && (
            <span className="text-[10px] text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded">
              15/day limit
            </span>
          )}
        </div>
        <div className="flex gap-3">
          {COUNTS.map((c) => {
            const disabled = isFree && c > 15;
            return (
              <button
                key={c}
                type="button"
                onClick={() => !disabled && setCount(c)}
                disabled={disabled}
                className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-150 ${
                  disabled
                    ? "border-border bg-card text-muted-foreground opacity-40 cursor-not-allowed"
                    : count === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary/40"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => domain && count && onStart(domain, count)}
        disabled={!domain || !count}
        className="w-full min-h-[52px] py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
      >
        Start Practice
      </button>
    </div>
  );
}

// ── Session ───────────────────────────────────────────────────────────────────

const OPTION_KEYS = ["a", "b", "c", "d"] as const;

function SessionScreen({
  questions,
  initialBookmarks,
  onComplete,
  showAiExplanation,
}: {
  questions: PracticeQuestion[];
  initialBookmarks: Set<string>;
  onComplete: (answers: boolean[], bookmarks: Set<string>) => void;
  showAiExplanation: boolean;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<string>>(
    new Set(initialBookmarks)
  );
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set());

  function toggleAccordion(letter: string) {
    setOpenAccordions((prev) => {
      const next = new Set(prev);
      if (next.has(letter)) next.delete(letter); else next.add(letter);
      return next;
    });
  }

  const current = questions[currentIdx];
  const answered = userAnswer !== null;
  const isCorrect = userAnswer === current.correct_answer;
  const isLast = currentIdx === questions.length - 1;

  async function handleAnswer(letter: string) {
    if (answered) return;
    setUserAnswer(letter);
    setAnswers((prev) => [...prev, letter === current.correct_answer]);

    if (!showAiExplanation) return;

    setAiLoading(true);
    try {
      const res = await fetch("/api/practice/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: current.question,
          options: current.options,
          correctAnswer: current.correct_answer,
          domain: current.domain,
        }),
      });
      const data = (await res.json()) as { explanation?: string };
      setAiExplanation(data.explanation ?? null);
    } catch {
      setAiExplanation(null);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleBookmark() {
    const qId = current.id;
    const updated = new Set(bookmarks);
    if (updated.has(qId)) {
      updated.delete(qId);
    } else {
      updated.add(qId);
    }
    setBookmarks(updated);

    try {
      await fetch("/api/practice/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: qId }),
      });
    } catch {
      // Revert optimistic update on error
      setBookmarks(new Set(bookmarks));
    }
  }

  function handleNext() {
    if (isLast) {
      onComplete([...answers], bookmarks);
    } else {
      setCurrentIdx((prev) => prev + 1);
      setUserAnswer(null);
      setAiExplanation(null);
      setAiLoading(false);
      setOpenAccordions(new Set());
    }
  }

  function optionClass(letter: string): string {
    if (!answered) {
      return "border border-border bg-card text-foreground hover:border-primary hover:bg-primary/5 cursor-pointer";
    }
    if (letter === current.correct_answer) {
      return "border border-green-500 bg-green-500/10 text-foreground cursor-default";
    }
    if (letter === userAnswer) {
      return "border border-red-500/60 bg-red-500/10 text-muted-foreground cursor-default";
    }
    // Unselected after reveal — full opacity, same default appearance
    return "border border-border bg-card text-foreground cursor-default";
  }

  function badgeClass(letter: string): string {
    if (answered && letter === current.correct_answer) {
      return "border-green-500 bg-green-500 text-white";
    }
    if (answered && letter === userAnswer && letter !== current.correct_answer) {
      return "border-red-500/60 bg-red-500/20 text-red-400";
    }
    return "border-current text-current";
  }

  const pct = Math.round((currentIdx / questions.length) * 100);
  const parsed = aiExplanation ? parseExplanation(aiExplanation) : null;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground font-medium">
            Question {currentIdx + 1} of {questions.length}
          </span>
          <span className="text-muted-foreground">{pct}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <p className="text-lg font-medium text-foreground leading-relaxed">
          {current.question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {OPTION_KEYS.map((letter) => (
          <button
            key={letter}
            type="button"
            onClick={() => handleAnswer(letter)}
            disabled={answered}
            className={`w-full text-left p-4 rounded-xl transition-all duration-150 ${optionClass(letter)}`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold transition-all duration-150 ${badgeClass(letter)}`}
              >
                {letter.toUpperCase()}
              </span>
              <span className="text-sm leading-relaxed flex-1">
                {current.options[letter]}
              </span>
              {answered && letter === current.correct_answer && (
                <CheckCircle2
                  size={16}
                  className="text-green-500 shrink-0 mt-0.5"
                />
              )}
              {answered &&
                letter === userAnswer &&
                letter !== current.correct_answer && (
                  <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                )}
            </div>
          </button>
        ))}
      </div>

      {/* Feedback card */}
      {answered && (
        <div className="bg-card border border-border border-l-2 border-l-primary rounded-2xl p-5 space-y-4">
          {/* Card header: result indicator + bookmark */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isCorrect ? "bg-green-500" : "bg-red-400"
                }`}
              />
              <span
                className={`text-sm font-semibold ${
                  isCorrect ? "text-green-500" : "text-red-400"
                }`}
              >
                {isCorrect ? "Correct" : "Incorrect"}
              </span>
            </div>
            <button
              type="button"
              onClick={handleBookmark}
              aria-label="Bookmark question"
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg hover:bg-muted transition-all duration-150"
            >
              <Bookmark
                size={14}
                className={
                  bookmarks.has(current.id)
                    ? "text-primary fill-primary"
                    : "text-muted-foreground"
                }
              />
              <span
                className={
                  bookmarks.has(current.id)
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                }
              >
                {bookmarks.has(current.id) ? "Bookmarked" : "Bookmark"}
              </span>
            </button>
          </div>

          {showAiExplanation ? (
            aiLoading ? (
              <div className="space-y-2.5 animate-pulse">
                <div className="h-2.5 bg-muted rounded w-2/5" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-5/6" />
                <div className="h-3 bg-muted rounded w-4/5" />
              </div>
            ) : parsed?.correct ? (
              <div className="space-y-3">
                {/* Always-visible correct section */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                    Explanation
                  </p>
                  <p className="text-sm font-semibold text-foreground mb-1.5">
                    Why {current.correct_answer.toUpperCase()} is correct
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">
                    <InlineMarkdown text={parsed.correct} />
                  </p>
                </div>

                {/* Wrong answer accordions */}
                <div className="border-t border-border pt-1 divide-y divide-border/60">
                  {OPTION_KEYS.filter((k) => k !== current.correct_answer).map(
                    (letter) => (
                      <WrongAccordion
                        key={letter}
                        letter={letter}
                        text={parsed[letter]}
                        open={openAccordions.has(letter)}
                        onToggle={() => toggleAccordion(letter)}
                      />
                    )
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Explanation unavailable.
              </p>
            )
          ) : (
            <Link
              href="/pricing"
              className="flex items-center justify-between gap-3 bg-muted/50 border border-border rounded-xl px-4 py-3 hover:border-primary/40 transition-all duration-150 group"
            >
              <p className="text-sm text-muted-foreground">
                Upgrade to Pro for AI explanations after every answer.
              </p>
              <span className="shrink-0 text-xs font-semibold text-primary group-hover:underline">
                Upgrade →
              </span>
            </Link>
          )}
        </div>
      )}

      {/* Next */}
      {answered && (
        <button
          type="button"
          onClick={handleNext}
          className="w-full min-h-[52px] py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-all duration-150 flex items-center justify-center gap-2"
        >
          {isLast ? "See Results" : "Next Question"}
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
}

// ── Results ───────────────────────────────────────────────────────────────────

function ResultsScreen({
  answers,
  domainKey,
  sessionQuestions,
  sessionBookmarks,
  onRetake,
  onRetakeBookmarked,
  onChangeDomain,
}: {
  answers: boolean[];
  domainKey: string;
  sessionQuestions: PracticeQuestion[];
  sessionBookmarks: Set<string>;
  onRetake: () => void;
  onRetakeBookmarked: (questions: PracticeQuestion[]) => void;
  onChangeDomain: () => void;
}) {
  const total = answers.length;
  const correct = answers.filter(Boolean).length;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const domainLabel =
    DOMAINS.find((d) => d.key === domainKey)?.label ?? domainKey;

  // Fix 3: compute bookmarked questions from this session
  const bookmarkedQs = sessionQuestions.filter((q) =>
    sessionBookmarks.has(q.id)
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Session Complete
        </h1>
        <p className="text-muted-foreground text-sm mt-1.5">{domainLabel}</p>
      </div>

      {/* Score card */}
      <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-4">
        <p className="text-6xl font-bold text-foreground tracking-tight">
          {pct}%
        </p>
        <p className="text-muted-foreground text-sm">
          {correct} of {total} correct
        </p>
        <div className="h-2 bg-muted rounded-full overflow-hidden mx-4">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              pct >= 80 ? "bg-green-500" : "bg-primary"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-center gap-12 pt-2">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">{correct}</p>
            <p className="text-xs text-muted-foreground mt-1">Correct</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">{total - correct}</p>
            <p className="text-xs text-muted-foreground mt-1">Incorrect</p>
          </div>
        </div>
      </div>

      {/* Fix 3: Bookmarked questions section */}
      {bookmarkedQs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bookmark size={16} className="text-primary fill-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Bookmarked This Session
            </h2>
            <span className="text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {bookmarkedQs.length}
            </span>
          </div>

          <div className="space-y-3">
            {bookmarkedQs.map((q) => (
              <div
                key={q.id}
                className="bg-card border border-border rounded-xl p-4 space-y-2.5"
              >
                <p className="text-sm text-foreground leading-relaxed line-clamp-3">
                  {q.question}
                </p>
                <p className="text-xs text-green-500 font-medium">
                  ✓ {q.correct_answer.toUpperCase()}:{" "}
                  {q.options[q.correct_answer as keyof typeof q.options]}
                </p>
                <span className="inline-block text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                  {DOMAINS.find((d) => d.key === q.domain)?.label ?? q.domain}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onRetakeBookmarked(bookmarkedQs)}
            className="w-full min-h-[52px] py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-all duration-150 flex items-center justify-center gap-2"
          >
            <Bookmark size={16} />
            Retake Bookmarked Questions ({bookmarkedQs.length})
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={onRetake}
          className="w-full min-h-[52px] py-3.5 bg-card border border-border text-foreground font-semibold rounded-xl hover:border-primary/40 transition-all duration-150"
        >
          Retake Same Domain
        </button>
        <button
          type="button"
          onClick={onChangeDomain}
          className="w-full min-h-[52px] py-3.5 bg-card border border-border text-foreground font-semibold rounded-xl hover:border-primary/40 transition-all duration-150"
        >
          Change Domain
        </button>
        <Link
          href="/dashboard"
          className="w-full min-h-[52px] py-3.5 flex items-center justify-center text-muted-foreground font-medium rounded-xl hover:text-foreground transition-all duration-150"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function PracticeClient({ subscriptionTier = "free" }: { subscriptionTier?: "free" | "pro" }) {
  const isFree = subscriptionTier === "free";
  const [phase, setPhase] = useState<Phase>("setup");
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedCount, setSelectedCount] = useState<number>(10);
  const [finalAnswers, setFinalAnswers] = useState<boolean[]>([]);
  const [finalBookmarks, setFinalBookmarks] = useState<Set<string>>(new Set());
  const [loadError, setLoadError] = useState<string | null>(null);

  async function handleStart(domain: string, count: number) {
    setSelectedDomain(domain);
    setSelectedCount(count);
    setPhase("loading");
    setLoadError(null);

    try {
      const res = await fetch(
        `/api/practice/questions?domain=${encodeURIComponent(domain)}&count=${count}`
      );

      if (res.status === 429) {
        setLoadError("You've reached your 15 questions/day limit. Upgrade to Pro for unlimited practice.");
        setPhase("setup");
        return;
      }

      const data = (await res.json()) as {
        questions?: PracticeQuestion[];
        bookmarkedIds?: string[];
        error?: string;
        dailyLimit?: number;
      };

      if (data.error === "daily_limit_reached") {
        setLoadError("You've reached your 15 questions/day limit. Upgrade to Pro for unlimited practice.");
        setPhase("setup");
        return;
      }

      if (data.error || !data.questions?.length) {
        setLoadError("No questions available for this domain. Try another.");
        setPhase("setup");
        return;
      }

      setQuestions(data.questions);
      setBookmarkedIds(new Set(data.bookmarkedIds ?? []));
      setPhase("session");
    } catch {
      setLoadError("Failed to load questions. Please try again.");
      setPhase("setup");
    }
  }

  function handleComplete(answers: boolean[], bmarks: Set<string>) {
    setFinalAnswers(answers);
    setFinalBookmarks(bmarks);
    setPhase("results");
  }

  function handleRetake() {
    if (selectedDomain) {
      void handleStart(selectedDomain, selectedCount);
    }
  }

  // Fix 3: start a new session directly with bookmarked questions (no API call)
  function handleRetakeBookmarked(qs: PracticeQuestion[]) {
    setQuestions(qs);
    setBookmarkedIds(new Set(qs.map((q) => q.id)));
    setFinalAnswers([]);
    setFinalBookmarks(new Set());
    setPhase("session");
  }

  if (phase === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Loading questions…</p>
      </div>
    );
  }

  if (phase === "session") {
    return (
      <SessionScreen
        questions={questions}
        initialBookmarks={bookmarkedIds}
        onComplete={handleComplete}
        showAiExplanation={!isFree}
      />
    );
  }

  if (phase === "results" && selectedDomain) {
    return (
      <ResultsScreen
        answers={finalAnswers}
        domainKey={selectedDomain}
        sessionQuestions={questions}
        sessionBookmarks={finalBookmarks}
        onRetake={handleRetake}
        onRetakeBookmarked={handleRetakeBookmarked}
        onChangeDomain={() => setPhase("setup")}
      />
    );
  }

  return <SetupScreen onStart={handleStart} error={loadError} isFree={isFree} />;
}
