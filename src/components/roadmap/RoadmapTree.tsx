"use client";

import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Lock,
  ChevronRight,
  Clock,
  BookOpen,
  Flame,
  Zap,
} from "lucide-react";
import Link from "next/link";
import type { ModuleWithProgress, RoadmapModule } from "@/lib/roadmap";

// ── Types ─────────────────────────────────────────────────────────────────────

interface TreeProps {
  phases: Array<{
    phase: number;
    label: string;
    modules: ModuleWithProgress[];
  }>;
  completedModules: number;
  totalModules: number;
  remainingMinutes: number;
  streak: number;
  currentModule: ModuleWithProgress | null;
  isFreeTier?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatMinutes(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function isCompleted(item: ModuleWithProgress): boolean {
  return item.progress?.status === "completed";
}

function isInProgress(item: ModuleWithProgress): boolean {
  return !!item.progress && item.progress.status === "in_progress";
}

function domainColor(domain: string | null): string {
  if (!domain) return "bg-muted text-muted-foreground";
  if (domain === "Safety") return "bg-red-500/10 text-red-400 border border-red-500/20";
  if (domain === "Fundamentals & Theory") return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
  if (domain === "Systems & Commissioning") return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
  if (domain === "Component Testing") return "bg-primary/10 text-primary border border-primary/20";
  return "bg-muted text-muted-foreground border border-border";
}

// ── Module card (row layout) ──────────────────────────────────────────────────

function ModuleRow({
  item,
  isCurrent,
  isSubscriptionLocked,
}: {
  item: ModuleWithProgress;
  isCurrent: boolean;
  isSubscriptionLocked: boolean;
}) {
  const { module } = item;
  const completed = isCompleted(item);
  const inProgress = isInProgress(item);
  const score = item.progress?.score_percentage ?? 0;

  if (isSubscriptionLocked) {
    return (
      <Link
        href="/pricing"
        className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-border bg-card/40 hover:border-primary/30 hover:bg-primary/5 transition-all duration-150 group opacity-60"
      >
        <div className="shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
          <Lock size={14} className="text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground/60 truncate">{module.title}</p>
          {module.domain && (
            <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded mt-1 ${domainColor(module.domain)}`}>
              {module.domain}
            </span>
          )}
        </div>
        <span className="shrink-0 text-xs font-semibold text-primary flex items-center gap-1 group-hover:underline">
          <Zap size={10} />
          Unlock with Pro
        </span>
      </Link>
    );
  }

  let rowCls = "flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all duration-150 ";
  if (completed) {
    rowCls += "border-green-500/30 bg-green-500/5 hover:border-green-500/50";
  } else if (isCurrent) {
    rowCls += "border-primary bg-primary/5 ring-1 ring-primary/20 hover:bg-primary/10";
  } else if (inProgress) {
    rowCls += "border-primary/40 bg-card hover:border-primary";
  } else {
    rowCls += "border-border bg-card hover:border-primary/40";
  }

  return (
    <div className={rowCls}>
      {/* Status icon */}
      <div className="shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
        {completed ? (
          <CheckCircle2 size={16} className="text-green-400" />
        ) : isCurrent ? (
          <ChevronRight size={16} className="text-primary" />
        ) : (
          <BookOpen size={14} className="text-muted-foreground" />
        )}
      </div>

      {/* Title + badges */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium truncate text-foreground">
            {module.title}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {module.domain && (
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${domainColor(module.domain)}`}>
              {module.domain}
            </span>
          )}
          {module.estimated_minutes && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <Clock size={9} />
              {formatMinutes(module.estimated_minutes)}
            </span>
          )}
          {inProgress && (
            <span className="text-[10px] text-primary font-medium">In progress</span>
          )}
          {completed && score > 0 && (
            <span className="text-[10px] text-green-500 font-medium">{score.toFixed(0)}%</span>
          )}
        </div>
      </div>

      {/* Learn + Quiz buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Link
          href={`/roadmap/module/${module.id}/learn`}
          className="text-xs font-semibold px-2.5 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all"
        >
          Learn
        </Link>
        <Link
          href={`/roadmap/module/${module.id}`}
          className="text-xs font-semibold px-2.5 py-1.5 border border-border bg-card text-foreground rounded-lg hover:border-primary/40 transition-all"
        >
          Quiz
        </Link>
      </div>
    </div>
  );
}

// ── Phase section ─────────────────────────────────────────────────────────────

function PhaseSection({
  phase,
  label,
  modules,
  currentModule,
  isFreeTier,
}: {
  phase: number;
  label: string;
  modules: ModuleWithProgress[];
  currentModule: ModuleWithProgress | null;
  isFreeTier: boolean;
}) {
  const completed = modules.filter((m) => isCompleted(m)).length;
  const pct = modules.length > 0 ? Math.round((completed / modules.length) * 100) : 0;
  const isPhaseLocked = isFreeTier && phase > 1;

  return (
    <div className="space-y-2">
      {/* Phase header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
            pct === 100 ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
          }`}>
            {pct === 100 ? <CheckCircle2 size={14} /> : phase}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Phase {phase} — {label}
            </h2>
            <p className="text-xs text-muted-foreground">
              {completed}/{modules.length} complete
              {isPhaseLocked && " · Pro"}
            </p>
          </div>
        </div>
        {pct > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${pct === 100 ? "bg-green-500" : "bg-primary"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-7 text-right">{pct}%</span>
          </div>
        )}
      </div>

      {/* Module rows */}
      <div className="space-y-2 pl-9">
        {modules.map((item) => (
          <ModuleRow
            key={item.module.id}
            item={item}
            isCurrent={currentModule?.module.id === item.module.id}
            isSubscriptionLocked={isPhaseLocked}
          />
        ))}
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({
  completedModules,
  totalModules,
  remainingMinutes,
  streak,
  currentModule,
}: {
  completedModules: number;
  totalModules: number;
  remainingMinutes: number;
  streak: number;
  currentModule: ModuleWithProgress | null;
}) {
  const router = useRouter();
  const pct = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
  const mod: RoadmapModule | null = currentModule?.module ?? null;

  return (
    <aside className="hidden lg:flex flex-col gap-4 w-64 shrink-0 pt-2">
      {/* Overall progress */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Your Progress
        </p>
        <div className="flex items-end justify-between mb-1.5">
          <span className="text-2xl font-semibold text-foreground">
            {completedModules}
            <span className="text-base text-muted-foreground">/{totalModules}</span>
          </span>
          <span className="text-xs text-muted-foreground mb-0.5">modules</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Flame size={11} className="text-orange-400" />
            {streak} day streak
          </span>
          {remainingMinutes > 0 && (
            <span className="flex items-center gap-1">
              <Clock size={11} />
              ~{formatMinutes(remainingMinutes)} left
            </span>
          )}
        </div>
      </div>

      {/* Current module CTA */}
      {mod && currentModule && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
            Up Next
          </p>
          <p className="text-sm font-semibold text-foreground mb-1 leading-snug">
            {mod.title}
          </p>
          {mod.estimated_minutes && (
            <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
              <Clock size={10} />
              {formatMinutes(mod.estimated_minutes)}
            </p>
          )}
          <button
            onClick={() => {
              const hasContent = !!mod.content_sections;
              const learned = currentModule.progress?.learning_complete === true;
              const url =
                hasContent && !learned
                  ? `/roadmap/module/${mod.id}/learn`
                  : `/roadmap/module/${mod.id}`;
              router.push(url);
            }}
            className="w-full flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-150"
          >
            {currentModule.progress?.learning_complete
              ? currentModule.progress.questions_completed
                ? "Continue Quiz"
                : "Take Quiz"
              : mod.content_sections
              ? "Start Learning"
              : currentModule.progress?.questions_completed
              ? "Continue"
              : "Start"}
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {completedModules === totalModules && totalModules > 0 && (
        <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-5 text-center shadow-sm">
          <CheckCircle2 className="text-green-400 mx-auto mb-2" size={22} />
          <p className="text-green-400 font-semibold text-sm">
            Roadmap Complete!
          </p>
        </div>
      )}
    </aside>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function RoadmapTree({
  phases,
  completedModules,
  totalModules,
  remainingMinutes,
  streak,
  currentModule,
  isFreeTier = false,
}: TreeProps) {
  return (
    <div className="flex gap-10 justify-center">
      {/* Phase list */}
      <div className="flex-1 max-w-2xl space-y-10">
        {phases.map(({ phase, label, modules }) => (
          <PhaseSection
            key={phase}
            phase={phase}
            label={label}
            modules={modules}
            currentModule={currentModule}
            isFreeTier={isFreeTier}
          />
        ))}
      </div>

      {/* Sidebar */}
      <Sidebar
        completedModules={completedModules}
        totalModules={totalModules}
        remainingMinutes={remainingMinutes}
        streak={streak}
        currentModule={currentModule}
      />
    </div>
  );
}
