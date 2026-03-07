"use client";

import { useEffect, useRef, useState } from "react";
import { AnswerFeedback } from "./AnswerFeedback";
import { DrillQuestion, QuestionCard } from "./QuestionCard";
import { QualityRating } from "./QualityRating";

// --- Types matching /api/drill/queue response shape ---

interface RawQueueItem {
  id: string | null;
  question_id: string;
  questions: DrillQuestion | null;
}

interface QueueApiResponse {
  due: RawQueueItem[];
  new: RawQueueItem[];
  total: number;
  error?: string;
}

interface SubmitApiResponse {
  easeFactor?: number;
  interval?: number;
  error?: string;
}

// --- Internal session card ---

interface DrillCard {
  questionId: string;
  question: DrillQuestion;
}

type DrillPhase =
  | "loading"
  | "answering"
  | "answered"
  | "submitting"
  | "done"
  | "error";

// --- Progress bar ---

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((current / total) * 100);
  return (
    <div className="flex-1 bg-muted rounded-full h-1 overflow-hidden">
      <div
        className="bg-primary h-full rounded-full transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// --- DrillSession ---

export function DrillSession() {
  const [phase, setPhase] = useState<DrillPhase>("loading");
  const [queue, setQueue] = useState<DrillCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const initialQueueLengthRef = useRef<number>(0);

  useEffect(() => {
    async function fetchQueue() {
      try {
        const res = await fetch("/api/drill/queue");
        const data = (await res.json()) as QueueApiResponse;

        if (!res.ok) {
          throw new Error(data.error ?? "Failed to load drill queue");
        }

        const cards: DrillCard[] = [...data.due, ...data.new]
          .filter(
            (item): item is RawQueueItem & { questions: DrillQuestion } =>
              item.questions !== null
          )
          .map((item) => ({
            questionId: item.question_id,
            question: item.questions,
          }));

        setQueue(cards);
        initialQueueLengthRef.current = cards.length;

        if (cards.length === 0) {
          setPhase("done");
        } else {
          startTimeRef.current = Date.now();
          setPhase("answering");
        }
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Unknown error loading queue"
        );
        setPhase("error");
      }
    }

    fetchQueue();
  }, []);

  function handleAnswerSelect(answer: string) {
    setSelectedAnswer(answer);
    setPhase("answered");
  }

  function handleQualitySelect(quality: number) {
    setSelectedQuality(quality);
  }

  async function handleNext() {
    if (selectedQuality === null || !currentCard) return;

    setPhase("submitting");
    const timeSpentMs = Date.now() - startTimeRef.current;

    try {
      const res = await fetch("/api/drill/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentCard.questionId,
          quality: selectedQuality,
          timeSpentMs,
        }),
      });

      const data = (await res.json()) as SubmitApiResponse;
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to submit answer");
      }

      const nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        setPhase("done");
      } else {
        setCurrentIndex(nextIndex);
        setSelectedAnswer(null);
        setSelectedQuality(null);
        startTimeRef.current = Date.now();
        setPhase("answering");
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to submit — try again"
      );
      setPhase("error");
    }
  }

  // --- Render states ---

  if (phase === "loading") {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">
            Loading your drill queue…
          </p>
        </div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-6 py-8 text-center space-y-3">
        <p className="text-red-400 font-semibold">Something went wrong</p>
        <p className="text-red-400/70 text-sm">{errorMessage}</p>
        <button
          type="button"
          className="mt-4 px-5 py-2.5 bg-card hover:bg-muted text-foreground text-sm rounded-lg border border-border transition-all duration-150"
          onClick={() => window.location.reload()}
        >
          Reload
        </button>
      </div>
    );
  }

  if (phase === "done") {
    const hadCards = initialQueueLengthRef.current > 0;
    return (
      <div className="bg-card border border-border rounded-2xl px-6 py-14 text-center space-y-4 shadow-sm">
        {hadCards ? (
          <>
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
              <span className="text-green-400 text-xl">✓</span>
            </div>
            <p className="text-foreground text-xl font-semibold tracking-tight">
              Daily drill complete!
            </p>
            <p className="text-muted-foreground text-sm">
              You reviewed {initialQueueLengthRef.current} card
              {initialQueueLengthRef.current !== 1 ? "s" : ""}. Come back
              tomorrow for your next session.
            </p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-2xl">
              📭
            </div>
            <p className="text-foreground text-xl font-semibold tracking-tight">
              No cards due today
            </p>
            <p className="text-muted-foreground text-sm">
              You&apos;re all caught up. Come back tomorrow for your next
              review.
            </p>
          </>
        )}
      </div>
    );
  }

  const currentCard = queue[currentIndex];
  if (!currentCard) return null;

  const isAnswered = phase === "answered" || phase === "submitting";
  const isSubmitting = phase === "submitting";
  const isLastCard = currentIndex === queue.length - 1;
  const isCorrect = selectedAnswer === currentCard.question.correct_answer;

  const correctLetter = currentCard.question.correct_answer;
  const correctText = currentCard.question.options
    ? currentCard.question.options[
        correctLetter as keyof typeof currentCard.question.options
      ]
    : "";

  return (
    <div className="space-y-4">
      {/* Progress row */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground shrink-0 tabular-nums font-medium">
          {currentIndex + 1} / {queue.length}
        </span>
        <ProgressBar current={currentIndex + 1} total={queue.length} />
      </div>

      {/* Question card */}
      <QuestionCard
        question={currentCard.question}
        selectedAnswer={selectedAnswer}
        onSelect={handleAnswerSelect}
      />

      {/* Feedback + quality rating (post-answer) */}
      {isAnswered && (
        <>
          <AnswerFeedback
            isCorrect={isCorrect}
            correctLetter={correctLetter}
            correctText={correctText}
            explanation={currentCard.question.explanation}
            trapPattern={currentCard.question.trap_pattern}
          />
          <QualityRating
            selectedQuality={selectedQuality}
            onSelect={handleQualitySelect}
            onNext={handleNext}
            isSubmitting={isSubmitting}
            isLastCard={isLastCard}
          />
        </>
      )}
    </div>
  );
}
