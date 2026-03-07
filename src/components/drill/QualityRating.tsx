"use client";

interface QualityRatingProps {
  selectedQuality: number | null;
  onSelect: (quality: number) => void;
  onNext: () => void;
  isSubmitting: boolean;
  isLastCard: boolean;
}

const QUALITY_OPTIONS = [
  { value: 0, label: "Blackout", sub: "No memory at all", color: "red" },
  { value: 1, label: "Wrong", sub: "Saw it, still wrong", color: "red" },
  { value: 2, label: "Wrong", sub: "Easy to recall after", color: "orange" },
  { value: 3, label: "Correct", sub: "But very hard", color: "yellow" },
  { value: 4, label: "Correct", sub: "Some hesitation", color: "lime" },
  { value: 5, label: "Perfect", sub: "Instant recall", color: "green" },
] as const;

const COLOR_CLASSES: Record<string, { base: string; selected: string }> = {
  red: {
    base: "border-red-500/20 bg-red-500/5 text-red-400 hover:border-red-500/40 hover:bg-red-500/10",
    selected: "border-red-500/60 bg-red-500/15 text-red-300 ring-1 ring-red-500/40",
  },
  orange: {
    base: "border-orange-500/20 bg-orange-500/5 text-orange-400 hover:border-orange-500/40 hover:bg-orange-500/10",
    selected: "border-orange-500/60 bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/40",
  },
  yellow: {
    base: "border-yellow-500/20 bg-yellow-500/5 text-yellow-400 hover:border-yellow-500/40 hover:bg-yellow-500/10",
    selected: "border-yellow-500/60 bg-yellow-500/15 text-yellow-300 ring-1 ring-yellow-500/40",
  },
  lime: {
    base: "border-lime-500/20 bg-lime-500/5 text-lime-400 hover:border-lime-500/40 hover:bg-lime-500/10",
    selected: "border-lime-500/60 bg-lime-500/15 text-lime-300 ring-1 ring-lime-500/40",
  },
  green: {
    base: "border-green-500/20 bg-green-500/5 text-green-400 hover:border-green-500/40 hover:bg-green-500/10",
    selected: "border-green-500/60 bg-green-500/15 text-green-300 ring-1 ring-green-500/40",
  },
};

export function QualityRating({
  selectedQuality,
  onSelect,
  onNext,
  isSubmitting,
  isLastCard,
}: QualityRatingProps) {
  return (
    <div className="bg-card border border-border rounded-2xl px-5 py-5 space-y-4 shadow-sm">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        How well did you know this?
      </p>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {QUALITY_OPTIONS.map(({ value, label, sub, color }) => {
          const isSelected = selectedQuality === value;
          const classes = COLOR_CLASSES[color];
          return (
            <button
              key={value}
              type="button"
              className={`flex flex-col items-center gap-1 px-2 py-3.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                isSelected ? classes.selected : classes.base
              }`}
              onClick={() => onSelect(value)}
            >
              <span className="text-lg font-bold leading-none">{value}</span>
              <span className="text-xs font-semibold leading-none">
                {label}
              </span>
              <span className="text-[10px] text-center leading-tight opacity-70">
                {sub}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="w-full min-h-[44px] py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={selectedQuality === null || isSubmitting}
        onClick={onNext}
      >
        {isSubmitting
          ? "Saving…"
          : isLastCard
            ? "Finish Session"
            : "Next Question"}
      </button>
    </div>
  );
}
