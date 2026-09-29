"use client";

import { useState } from "react";
import { CheckCircle2, ChevronRight } from "lucide-react";

// How long the confirmation shows before heading to the dashboard
const CONFIRM_MS = 900;

function SettingUpScreen() {
  return (
    <div role="status" aria-live="polite" className="w-full max-w-md text-center">
      {/* Check icon inside a circling ring */}
      <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
        <span className="absolute inset-0 rounded-full border-2 border-primary/15 border-t-primary animate-spin motion-reduce:animate-none" />
        <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10">
          <CheckCircle2 size={26} className="text-primary" />
        </span>
      </div>
      <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
        Training for NETA Level 2
      </p>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Let&apos;s get to work.
      </h1>
      <p className="text-muted-foreground text-sm mt-3">Setting up your prep plan…</p>
      {/* Indeterminate progress line */}
      <div className="mx-auto mt-6 h-1 w-48 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-1/3 rounded-full bg-primary animate-progress-slide motion-reduce:animate-none motion-reduce:w-full" />
      </div>
    </div>
  );
}

export default function SelectLevelPage() {
  const [phase, setPhase] = useState<"selecting" | "confirming">("selecting");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSelect() {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding/level", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: 2 }),
      });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Couldn't save your level.");

      setPhase("confirming");
      // Full navigation (not router.push): the middleware re-reads the saved level,
      // and a redirect back here can't leave this screen stuck in "confirming".
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, CONFIRM_MS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your level. Please try again.");
      setSaving(false);
    }
  }

  if (phase === "confirming") return <SettingUpScreen />;

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 mb-5">
          <span className="text-primary font-bold text-lg">N</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
          What are you studying for?
        </h1>
        <p className="text-muted-foreground text-sm">
          We&apos;ll build your personalized prep plan.
        </p>
      </div>

      {/* Option cards */}
      <div className="space-y-3">
        {/* NETA Level 2 — active */}
        <button
          onClick={handleSelect}
          disabled={saving}
          className="group w-full text-left bg-card border border-border rounded-2xl p-5 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
                Training for NETA Level 2
              </p>
              <p className="text-sm font-semibold text-foreground">
                ETT Technician
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Core testing procedures — instrument transformers, circuit
                breakers, cables, protective relays.
              </p>
            </div>
            {saving ? (
              <span className="w-4 h-4 shrink-0 ml-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin motion-reduce:animate-none" />
            ) : (
              <ChevronRight
                size={16}
                className="text-muted-foreground group-hover:text-primary transition-colors duration-150 shrink-0 ml-4"
              />
            )}
          </div>
        </button>
        {error && (
          <p role="alert" className="text-sm text-red-400 text-center">
            {error}
          </p>
        )}

        {/* NETA Level 3 — coming soon */}
        <div className="w-full text-left bg-card border border-border rounded-2xl p-5 opacity-50 cursor-not-allowed select-none">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  NETA Level 3
                </p>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                  Coming Soon
                </span>
              </div>
              <p className="text-sm font-semibold text-muted-foreground">
                Senior Technician
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Advanced protection, relay coordination, commissioning.
              </p>
            </div>
          </div>
        </div>

        {/* NETA Level 4 — coming soon */}
        <div className="w-full text-left bg-card border border-border rounded-2xl p-5 opacity-50 cursor-not-allowed select-none">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  NETA Level 4
                </p>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                  Coming Soon
                </span>
              </div>
              <p className="text-sm font-semibold text-muted-foreground">
                Expert Engineer
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Power quality, complex schemes, engineering review.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
