"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, ChevronRight } from "lucide-react";

export default function SelectLevelPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"selecting" | "confirming">("selecting");
  const [saving, setSaving] = useState(false);

  async function handleSelect() {
    if (saving) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      await supabase
        .from("profiles")
        .update({ neta_target_level: 2 })
        .eq("id", user.id);
      setPhase("confirming");
      // Brief confirmation, then straight to dashboard
      setTimeout(() => router.push("/dashboard"), 1200);
    } finally {
      setSaving(false);
    }
  }

  if (phase === "confirming") {
    return (
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
          <CheckCircle2 size={28} className="text-primary" />
        </div>
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
          Training for NETA Level 2
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Let&apos;s get to work.
        </h1>
        <p className="text-muted-foreground text-sm mt-3">
          Setting up your prep plan…
        </p>
      </div>
    );
  }

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
            <ChevronRight
              size={16}
              className="text-muted-foreground group-hover:text-primary transition-colors duration-150 shrink-0 ml-4"
            />
          </div>
        </button>

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
