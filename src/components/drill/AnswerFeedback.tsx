"use client";

interface AnswerFeedbackProps {
  isCorrect: boolean;
  correctLetter: string;
  correctText: string;
  explanation: string;
  trapPattern: string | null;
}

export function AnswerFeedback({
  isCorrect,
  correctLetter,
  correctText,
  explanation,
  trapPattern,
}: AnswerFeedbackProps) {
  return (
    <div className="space-y-3">
      {/* Result banner */}
      <div
        className={`rounded-2xl px-5 py-4 border ${
          isCorrect
            ? "bg-green-500/10 border-green-500/30"
            : "bg-red-500/10 border-red-500/30"
        }`}
      >
        <p
          className={`font-semibold text-sm mb-1 ${
            isCorrect ? "text-green-400" : "text-red-400"
          }`}
        >
          {isCorrect ? "✓ Correct" : "✗ Incorrect"}
        </p>

        {!isCorrect && (
          <p className="text-foreground text-sm">
            <span className="text-muted-foreground">Correct answer: </span>
            <span className="font-semibold uppercase">{correctLetter}</span>
            {" — "}
            {correctText}
          </p>
        )}
      </div>

      {/* Explanation */}
      <div className="bg-card border border-border rounded-2xl px-5 py-4 shadow-sm">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
          Explanation
        </p>
        <p className="text-foreground text-base leading-relaxed">{explanation}</p>
      </div>

      {/* Trap warning */}
      {trapPattern && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl px-5 py-4">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2.5">
            ⚠ Common Trap
          </p>
          <p className="text-amber-300/90 text-base leading-relaxed">
            {trapPattern}
          </p>
        </div>
      )}
    </div>
  );
}
