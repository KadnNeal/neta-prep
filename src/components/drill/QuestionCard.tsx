"use client";

export interface MCQOptions {
  a: string;
  b: string;
  c: string;
  d: string;
}

export interface DrillQuestion {
  id: string;
  domain: string;
  subdomain: string;
  level: number;
  concept_type: string;
  difficulty: number;
  frequency_tier: number;
  question: string;
  options: MCQOptions | null;
  correct_answer: string;
  explanation: string;
  trap_pattern: string | null;
}

interface QuestionCardProps {
  question: DrillQuestion;
  selectedAnswer: string | null;
  onSelect: (letter: string) => void;
}

function formatLabel(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const OPTION_LETTERS = ["a", "b", "c", "d"] as const;

function getOptionClass(
  letter: string,
  selectedAnswer: string | null,
  correctAnswer: string
): string {
  const base =
    "w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-150 text-sm flex items-start gap-3 min-h-[52px]";

  if (selectedAnswer === null) {
    return `${base} bg-muted border-border text-foreground hover:border-primary/50 hover:bg-muted cursor-pointer`;
  }

  if (letter === correctAnswer) {
    return `${base} bg-green-500/10 border-green-500/50 text-green-300 cursor-default`;
  }

  if (letter === selectedAnswer) {
    return `${base} bg-red-500/10 border-red-500/50 text-red-300 cursor-default`;
  }

  return `${base} bg-card border-border text-muted-foreground cursor-default opacity-50`;
}

export function QuestionCard({
  question,
  selectedAnswer,
  onSelect,
}: QuestionCardProps) {
  const isAnswered = selectedAnswer !== null;

  if (!question.options) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6">
        <p className="text-muted-foreground text-sm">
          Free-text question — use Interview mode for this question type.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* Meta header */}
      <div className="px-6 py-3.5 border-b border-border flex items-center gap-2 flex-wrap">
        <span className="text-xs px-2.5 py-1 rounded-md bg-primary/10 text-primary font-medium">
          {formatLabel(question.domain)}
        </span>
        <span className="text-xs px-2.5 py-1 rounded-md bg-muted text-muted-foreground border border-border">
          {formatLabel(question.subdomain)}
        </span>
        <span className="text-xs text-muted-foreground ml-1">
          L{question.level} · D{question.difficulty}
        </span>
        {question.frequency_tier === 1 && (
          <span className="text-xs px-2.5 py-1 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20 ml-auto font-medium">
            High Frequency
          </span>
        )}
      </div>

      {/* Question text */}
      <div className="px-6 py-6">
        <p className="text-foreground text-lg leading-relaxed font-medium">
          {question.question}
        </p>
      </div>

      {/* Options */}
      <div className="px-6 pb-6 space-y-2.5">
        {OPTION_LETTERS.map((letter) => {
          const optionText = question.options![letter];
          return (
            <button
              key={letter}
              type="button"
              className={getOptionClass(
                letter,
                selectedAnswer,
                question.correct_answer
              )}
              onClick={() => !isAnswered && onSelect(letter)}
              aria-disabled={isAnswered}
            >
              <span className="shrink-0 w-6 h-6 rounded-full bg-secondary text-muted-foreground text-xs flex items-center justify-center font-semibold uppercase mt-0.5">
                {letter}
              </span>
              <span className="flex-1 leading-relaxed">{optionText}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
