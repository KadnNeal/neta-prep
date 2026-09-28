import Link from "next/link";
import type { SubscriptionPlan } from "@/lib/stripe";

// Fixed locale + UTC so the server render and client hydration print the same date
const EXPIRY_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function Tooltip({ lines }: { lines: string[] }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute right-0 top-full mt-2 whitespace-nowrap rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground shadow-md opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
    >
      {lines.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </span>
  );
}

/**
 * Small plan pill for the navbar. Free → "Free Plan" + Upgrade (to /pricing);
 * paid → amber "Pro" linking to /settings, with the expiry for 90-Day Passes.
 */
export function PlanBadge({
  plan,
  expiresAt,
  showUpgrade,
}: {
  /** Active paid plan; "unknown" = paid but plan not recorded; null = free */
  plan: SubscriptionPlan | "unknown" | null;
  expiresAt: string | null;
  showUpgrade: boolean;
}) {
  if (!plan) {
    return (
      <span className="flex items-center gap-1.5">
        <Link
          href="/pricing"
          className="text-[11px] font-medium text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-full hover:text-foreground transition-colors duration-150"
        >
          Free Plan
        </Link>
        {showUpgrade && (
          <Link
            href="/pricing"
            className="text-xs font-semibold text-primary hover:underline px-1"
          >
            Upgrade
          </Link>
        )}
      </span>
    );
  }

  const tooltip = ["Manage billing in Settings"];
  if (plan === "90_day_pass" && expiresAt) {
    tooltip.unshift(`Access expires ${EXPIRY_FORMAT.format(new Date(expiresAt))}`);
  }

  return (
    <Link
      href="/settings"
      aria-label={`Pro plan. ${tooltip.join(". ")}`}
      className="group relative text-[11px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full hover:bg-primary/20 transition-colors duration-150"
    >
      Pro
      <Tooltip lines={tooltip} />
    </Link>
  );
}
