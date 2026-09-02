import type { DomainActivity } from "@/lib/readiness";

// ── Helpers ───────────────────────────────────────────────────────────────────

function accuracyColor(pct: number): string {
  if (pct >= 85) return "text-green-500";
  if (pct >= 50) return "text-primary";
  return "text-muted-foreground";
}

function accuracyBarColor(pct: number): string {
  if (pct >= 85) return "bg-green-500";
  if (pct >= 50) return "bg-primary";
  return "bg-muted-foreground/40";
}

// ── Domain card ───────────────────────────────────────────────────────────────

function DomainActivityCard({ d }: { d: DomainActivity }) {
  const hasActivity = d.totalAnswered >= 10;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-foreground leading-snug">
          {d.label}
        </p>
        <span className="shrink-0 text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md border border-border whitespace-nowrap">
          {d.examWeight}% of exam
        </span>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{d.totalAnswered} questions answered</span>
        {d.recentAccuracy !== null ? (
          <span className={`font-semibold tabular-nums ${accuracyColor(d.recentAccuracy)}`}>
            {d.recentAccuracy}%
          </span>
        ) : (
          <span className="italic">
            {d.totalAnswered === 0 ? "No activity yet" : "Need more answers"}
          </span>
        )}
      </div>

      {/* Accuracy bar */}
      {d.recentAccuracy !== null ? (
        <div className="space-y-1">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${accuracyBarColor(d.recentAccuracy)}`}
              style={{ width: `${d.recentAccuracy}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            Recent accuracy — last {d.recentCount} questions
          </p>
        </div>
      ) : (
        <div className="h-1.5 bg-muted rounded-full" />
      )}
    </div>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────

export function DomainActivitySection({
  domainActivity,
}: {
  domainActivity: DomainActivity[];
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        Activity by Domain
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {domainActivity.map((d) => (
          <DomainActivityCard key={d.domain} d={d} />
        ))}
      </div>
    </div>
  );
}
