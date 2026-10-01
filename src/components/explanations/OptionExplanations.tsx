"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { OPTION_KEYS } from "@/lib/explanations";
import type { OptionExplanations as OptionExplanationsData, OptionKey } from "@/lib/explanations";

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
        ),
      )}
    </>
  );
}

function WrongAccordion({
  letter,
  text,
  picked,
  open,
  onToggle,
}: {
  letter: OptionKey;
  text: string;
  picked: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex items-center justify-between w-full py-2.5 text-left hover:opacity-80 transition-opacity duration-150"
      >
        <span className={`text-sm font-medium ${picked ? "text-red-400" : "text-muted-foreground"}`}>
          Why {letter.toUpperCase()} is wrong{picked ? " (your answer)" : ""}
        </span>
        <ChevronRight
          size={14}
          className={`shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        />
      </button>
      <div className={`grid transition-all duration-200 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <p className="text-sm text-foreground/80 leading-relaxed pb-3 pr-4">
            <InlineMarkdown text={text} />
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Stored explanation for an answered question (S43).
 * - `optionExplanations` present (Pro, reviewed): "Why X is correct" + an accordion per
 *   wrong choice; the user's own wrong pick starts open.
 * - otherwise: the question's summary explanation, plus an upgrade nudge for free users.
 */
export function OptionExplanations({
  correctAnswer,
  userAnswer,
  optionExplanations,
  summary,
  showUpgrade = false,
}: {
  correctAnswer: string;
  userAnswer?: string | null;
  optionExplanations: OptionExplanationsData | null;
  summary: string | null;
  showUpgrade?: boolean;
}) {
  const [open, setOpen] = useState<Set<string>>(
    () => new Set(userAnswer && userAnswer !== correctAnswer ? [userAnswer] : []),
  );

  function toggle(letter: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(letter)) next.delete(letter);
      else next.add(letter);
      return next;
    });
  }

  if (!optionExplanations) {
    return (
      <div className="space-y-3">
        {summary && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Explanation
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              <InlineMarkdown text={summary} />
            </p>
          </div>
        )}
        {showUpgrade && (
          <Link
            href="/pricing"
            className="flex items-center justify-between gap-3 bg-muted/50 border border-border rounded-xl px-4 py-3 hover:border-primary/40 transition-all duration-150 group"
          >
            <p className="text-sm text-muted-foreground">
              Upgrade to Pro to see why each answer choice is right or wrong.
            </p>
            <span className="shrink-0 text-xs font-semibold text-primary group-hover:underline">Upgrade</span>
          </Link>
        )}
      </div>
    );
  }

  const correct = correctAnswer as OptionKey;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
          Explanation
        </p>
        <p className="text-sm font-semibold text-foreground mb-1.5">Why {correct.toUpperCase()} is correct</p>
        <p className="text-sm text-foreground leading-relaxed">
          <InlineMarkdown text={optionExplanations[correct]} />
        </p>
      </div>
      <div className="border-t border-border pt-1 divide-y divide-border/60">
        {OPTION_KEYS.filter((k) => k !== correct).map((letter) => (
          <WrongAccordion
            key={letter}
            letter={letter}
            text={optionExplanations[letter]}
            picked={letter === userAnswer}
            open={open.has(letter)}
            onToggle={() => toggle(letter)}
          />
        ))}
      </div>
    </div>
  );
}
