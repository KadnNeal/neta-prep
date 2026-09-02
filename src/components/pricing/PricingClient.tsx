"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Lock, Zap } from "lucide-react";
// Price IDs duplicated here (not imported from stripe.ts) to keep the Stripe SDK server-only
const PRICE_IDS = {
  monthly: "price_1TwBWiGO8TgYfwMNwySrPsXi",
  annual:  "price_1TwBXJGO8TgYfwMNfnF7f9Kw",
  pass90:  "price_1TwBYkGO8TgYfwMNV9fpFBZS",
} as const;

interface Props {
  isLoggedIn: boolean;
  subscriptionTier: "free" | "pro";
}

// ── Supervisor justification copy box ─────────────────────────────────────────

// ── Checkout button ───────────────────────────────────────────────────────────

function CheckoutButton({
  priceId,
  label,
  isLoggedIn,
  isPro,
  className = "",
}: {
  priceId: string;
  label: string;
  isLoggedIn: boolean;
  isPro: boolean;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);

  if (isPro) {
    return (
      <span className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-green-500 bg-green-500/10 border border-green-500/20 rounded-xl">
        <Check size={15} />
        Current Plan
      </span>
    );
  }

  if (!isLoggedIn) {
    return (
      <Link
        href="/signup"
        className={`w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all duration-150 ${className}`}
      >
        {label}
      </Link>
    );
  }

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all duration-150 disabled:opacity-60 ${className}`}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {label}
    </button>
  );
}

// ── Comparison table ──────────────────────────────────────────────────────────

function Tick({ yes }: { yes: boolean }) {
  return yes ? (
    <Check size={16} className="text-green-500 mx-auto" />
  ) : (
    <Lock size={14} className="text-muted-foreground mx-auto opacity-50" />
  );
}

function ComparisonTable() {
  const rows: Array<{
    feature: string;
    free: React.ReactNode;
    monthly: React.ReactNode;
    pass90: React.ReactNode;
    annual: React.ReactNode;
  }> = [
    {
      feature: "Price",
      free: <span className="font-semibold">$0</span>,
      monthly: <span className="font-semibold">$39/mo</span>,
      pass90: <span className="font-semibold">$109</span>,
      annual: <span className="font-semibold">$299/yr</span>,
    },
    {
      feature: "$/day",
      free: <span className="text-muted-foreground">—</span>,
      monthly: <span className="text-muted-foreground">~$1.30</span>,
      pass90: <span className="text-muted-foreground">~$1.21</span>,
      annual: <span className="text-muted-foreground">~$0.82</span>,
    },
    {
      feature: "Roadmap",
      free: <span className="text-muted-foreground text-xs">Module 1 only</span>,
      monthly: <span className="text-muted-foreground text-xs">All 9</span>,
      pass90: <span className="text-muted-foreground text-xs">All 9</span>,
      annual: <span className="text-muted-foreground text-xs">All 9</span>,
    },
    {
      feature: "Exam Simulator",
      free: <Tick yes={false} />,
      monthly: <Tick yes={true} />,
      pass90: <Tick yes={true} />,
      annual: <Tick yes={true} />,
    },
    {
      feature: "AI Explanations",
      free: <Tick yes={false} />,
      monthly: <Tick yes={true} />,
      pass90: <Tick yes={true} />,
      annual: <Tick yes={true} />,
    },
    {
      feature: "Practice Questions",
      free: <span className="text-muted-foreground text-xs">15/day</span>,
      monthly: <span className="text-muted-foreground text-xs">Unlimited</span>,
      pass90: <span className="text-muted-foreground text-xs">Unlimited</span>,
      annual: <span className="text-muted-foreground text-xs">Unlimited</span>,
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 pr-4 text-xs font-semibold text-muted-foreground w-36">Feature</th>
            <th className="text-center py-3 px-3 text-xs font-semibold text-muted-foreground">Free</th>
            <th className="text-center py-3 px-3 text-xs font-semibold text-foreground">Monthly</th>
            <th className="text-center py-3 px-3 text-xs font-semibold text-muted-foreground">90-Day Pass</th>
            <th className="text-center py-3 px-3 text-xs font-semibold text-primary">Annual</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {rows.map((row) => (
            <tr key={row.feature}>
              <td className="py-3 pr-4 text-xs text-muted-foreground">{row.feature}</td>
              <td className="py-3 px-3 text-center text-xs">{row.free}</td>
              <td className="py-3 px-3 text-center text-xs">{row.monthly}</td>
              <td className="py-3 px-3 text-center text-xs">{row.pass90}</td>
              <td className="py-3 px-3 text-center text-xs">{row.annual}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function PricingClient({ isLoggedIn, subscriptionTier }: Props) {
  const isPro = subscriptionTier === "pro";

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-14">

        {/* Header */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-widest mb-2">
            <Zap size={12} />
            NETA Exam Prep
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            Simple, honest pricing
          </h1>
          <p className="text-muted-foreground text-base">
            Built for NETA ETT technicians. Pass the exam or don&apos;t pay for features you don&apos;t need.
          </p>
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

          {/* Free */}
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-5 shadow-sm">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Free</p>
              <div className="flex items-end gap-1.5">
                <span className="text-3xl font-bold text-foreground">$0</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Forever free</p>
            </div>
            <ul className="space-y-2 flex-1 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><Check size={14} className="text-green-500 mt-0.5 shrink-0" />Module 1 roadmap</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-green-500 mt-0.5 shrink-0" />15 practice questions/day</li>
              <li className="flex items-start gap-2 opacity-50"><Lock size={13} className="mt-0.5 shrink-0" />AI explanations</li>
              <li className="flex items-start gap-2 opacity-50"><Lock size={13} className="mt-0.5 shrink-0" />Exam simulator</li>
              <li className="flex items-start gap-2 opacity-50"><Lock size={13} className="mt-0.5 shrink-0" />Full roadmap (9 modules)</li>
            </ul>
            {isLoggedIn ? (
              <span className="w-full flex items-center justify-center py-3 text-sm font-semibold text-muted-foreground bg-muted rounded-xl">
                Current plan
              </span>
            ) : (
              <Link
                href="/signup"
                className="w-full flex items-center justify-center py-3 text-sm font-semibold bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-all duration-150"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Monthly */}
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-5 shadow-sm">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Active Study</p>
              <div className="flex items-end gap-1.5">
                <span className="text-3xl font-bold text-foreground">$39</span>
                <span className="text-muted-foreground text-sm mb-0.5">/mo</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">~$1.30/day</p>
            </div>
            <ul className="space-y-2 flex-1 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><Check size={14} className="text-green-500 mt-0.5 shrink-0" />Full platform access</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-green-500 mt-0.5 shrink-0" />All 9 roadmap modules</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-green-500 mt-0.5 shrink-0" />AI explanations</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-green-500 mt-0.5 shrink-0" />Exam simulator</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-green-500 mt-0.5 shrink-0" />Unlimited practice</li>
            </ul>
            <CheckoutButton
              priceId={PRICE_IDS.monthly}
              label="Start Monthly"
              isLoggedIn={isLoggedIn}
              isPro={isPro}
              className="bg-card border border-primary text-primary hover:bg-primary/5"
            />
          </div>

          {/* 90-Day Pass */}
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-5 shadow-sm opacity-90">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">One Exam Cycle</p>
              <div className="flex items-end gap-1.5">
                <span className="text-3xl font-bold text-foreground">$109</span>
                <span className="text-muted-foreground text-sm mb-0.5">one-time</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">~$1.21/day · 90-day window</p>
            </div>
            <ul className="space-y-2 flex-1 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><Check size={14} className="text-green-500 mt-0.5 shrink-0" />Full platform access</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-green-500 mt-0.5 shrink-0" />All 9 roadmap modules</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-green-500 mt-0.5 shrink-0" />AI explanations</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-green-500 mt-0.5 shrink-0" />Exam simulator</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-green-500 mt-0.5 shrink-0" />Expires after 90 days</li>
            </ul>
            <CheckoutButton
              priceId={PRICE_IDS.pass90}
              label="Get 90-Day Access"
              isLoggedIn={isLoggedIn}
              isPro={isPro}
              className="bg-card border border-primary text-primary hover:bg-primary/5"
            />
          </div>

          {/* Annual — highlighted */}
          <div className="bg-primary/5 border-2 border-primary rounded-2xl p-6 flex flex-col gap-5 shadow-md relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-3 py-1 rounded-full shadow-sm">
                Most Popular
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Certification Prep — Annual Access</p>
              <div className="flex items-end gap-1.5">
                <span className="text-3xl font-bold text-foreground">$299</span>
                <span className="text-muted-foreground text-sm mb-0.5">/yr</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">~$0.82/day</p>
            </div>
            <ul className="space-y-2 flex-1 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><Check size={14} className="text-green-500 mt-0.5 shrink-0" />Full platform access</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-green-500 mt-0.5 shrink-0" />All 9 roadmap modules</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-green-500 mt-0.5 shrink-0" />AI explanations</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-green-500 mt-0.5 shrink-0" />Exam simulator</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-green-500 mt-0.5 shrink-0" />12 months access</li>
            </ul>
            <CheckoutButton
              priceId={PRICE_IDS.annual}
              label="Get Annual Access"
              isLoggedIn={isLoggedIn}
              isPro={isPro}
              className="bg-primary text-primary-foreground hover:opacity-90"
            />
          </div>

        </div>

        {/* Expense nudge */}
        <p className="text-center text-xs italic text-muted-foreground/70 -mt-6">
          Most NETA technicians expense this as professional development training — ask your employer before paying out of pocket.
        </p>

        {/* Comparison table */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-5">
            Full Comparison
          </h2>
          <ComparisonTable />
        </div>

      </div>
    </main>
  );
}
