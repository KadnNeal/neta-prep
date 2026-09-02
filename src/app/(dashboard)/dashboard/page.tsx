import { getDashboardData } from "@/lib/readiness";
import { getRoadmapData } from "@/lib/roadmap";
import { createClient } from "@/lib/supabase/server";
import { DomainActivitySection } from "@/components/dashboard/DomainMasterySection";

import {
  BookCheck,
  CalendarCheck2,
  ChevronRight,
  ClipboardList,
  Flame,
  Map,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

// ── Readiness score helpers ───────────────────────────────────────────────────

function readinessLabel(score: number): string {
  if (score >= 85) return "Exam Ready";
  if (score >= 70) return "Nearly Ready";
  if (score >= 50) return "Getting There";
  return "Building Foundation";
}

function readinessColorClass(score: number): string {
  if (score >= 85) return "text-green-500";
  return "text-primary";
}

function readinessBarColor(score: number): string {
  if (score >= 85) return "bg-green-500";
  return "bg-primary";
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl px-5 py-5 flex items-start gap-4">
      <div className="mt-0.5 text-muted-foreground shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground mb-1 font-medium">{label}</p>
        <p className="text-2xl font-semibold text-foreground leading-none tracking-tight">
          {value}
        </p>
        {sub && <p className="text-xs text-muted-foreground mt-1.5">{sub}</p>}
      </div>
    </div>
  );
}

function NavCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-card border border-border hover:border-primary/40 rounded-2xl px-6 py-5 flex items-center gap-4 transition-all duration-150 shadow-sm hover:shadow-md"
    >
      <div className="text-primary shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-foreground font-semibold text-sm">{title}</p>
        <p className="text-muted-foreground text-xs mt-0.5 truncate">
          {description}
        </p>
      </div>
      <ChevronRight
        className="text-muted-foreground group-hover:text-primary transition-all duration-150 shrink-0"
        size={16}
      />
    </Link>
  );
}

// ── Exam Readiness Card ───────────────────────────────────────────────────────

function ExamReadinessCard({
  score,
  totalExamSimAnswered,
}: {
  score: number | null;
  totalExamSimAnswered: number;
}) {
  const MIN_QUESTIONS = 25;

  return (
    <div className="bg-card border border-border rounded-2xl px-6 py-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
            Exam Readiness Score
          </p>
          {score !== null ? (
            <div className="flex items-end gap-3">
              <span
                className={`text-4xl font-semibold tabular-nums leading-none tracking-tight ${readinessColorClass(score)}`}
              >
                {score}%
              </span>
              <span
                className={`text-base font-medium mb-0.5 ${readinessColorClass(score)}`}
              >
                {readinessLabel(score)}
              </span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground max-w-sm">
              Answer more exam simulation questions to generate your readiness
              score
              {totalExamSimAnswered > 0 &&
                ` (${totalExamSimAnswered}/${MIN_QUESTIONS} so far)`}
            </p>
          )}
        </div>
        {score !== null && score >= 85 && (
          <div className="shrink-0 flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
            <Trophy className="text-green-400" size={16} />
            <span className="text-green-400 font-semibold text-sm">
              Exam Ready
            </span>
          </div>
        )}
      </div>

      {score !== null && (
        <div className="space-y-1.5">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${readinessBarColor(score)}`}
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Based on your last 100 exam simulation questions, weighted by NETA
            Level 2 domain
          </p>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const data = await getDashboardData();
  if (!data) redirect("/login");

  if (data.targetLevel === 1 && user) {
    const roadmap = await getRoadmapData(user.id);
    return <Level1Dashboard data={data} roadmap={roadmap} />;
  }

  const {
    examReadiness,
    domainActivity,
    streak,
    totalAnswered,
    sessionsCompleted,
    targetLevel,
  } = data;

  const isNewUser = totalAnswered === 0;

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">

        {/* Header */}
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1.5">
            Training for NETA Level {targetLevel}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Your exam readiness at a glance
          </p>
        </div>

        {/* CTA banner — new users only */}
        {isNewUser && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl px-6 py-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-foreground font-semibold">
                Start your learning path
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Follow the structured roadmap to build exam-ready knowledge
              </p>
            </div>
            <Link
              href="/roadmap"
              className="shrink-0 bg-primary text-primary-foreground font-medium text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-all duration-150"
            >
              Begin Roadmap
            </Link>
          </div>
        )}

        {/* Exam Readiness Score */}
        <ExamReadinessCard
          score={examReadiness.score}
          totalExamSimAnswered={examReadiness.totalExamSimAnswered}
        />

        {/* Quick Access */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Quick Access
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <NavCard
              href="/roadmap"
              icon={<Map size={20} />}
              title="Learning Roadmap"
              description="28 modules across 5 phases"
            />
            <NavCard
              href="/drill"
              icon={<Zap size={20} />}
              title="Daily Drill"
              description="SM-2 spaced repetition"
            />
            <NavCard
              href="/practice"
              icon={<Target size={20} />}
              title="Practice Mode"
              description="Target domains with AI feedback"
            />
            <NavCard
              href="/exam"
              icon={<ClipboardList size={20} />}
              title="Exam Simulation"
              description="100-question timed test"
            />
          </div>
        </div>

        {/* Domain Activity + Stats sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-5 items-start">
          <DomainActivitySection domainActivity={domainActivity} />

          {/* Stats sidebar */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            <StatCard
              icon={<Flame size={18} />}
              label="Day streak"
              value={String(streak)}
              sub={streak > 0 ? "Keep it up!" : "Do a drill to start"}
            />
            <StatCard
              icon={<BookCheck size={18} />}
              label="Questions answered"
              value={String(totalAnswered)}
            />
            <StatCard
              icon={<CalendarCheck2 size={18} />}
              label="Sessions completed"
              value={String(sessionsCompleted)}
              sub="Distinct days with activity"
            />
          </div>
        </div>

      </div>
    </main>
  );
}

// ── Level 1 Dashboard ─────────────────────────────────────────────────────────

import type { DashboardData } from "@/lib/readiness";

function Level1Dashboard({
  data,
  roadmap,
}: {
  data: DashboardData;
  roadmap: Awaited<ReturnType<typeof getRoadmapData>>;
}) {
  const { streak, totalAnswered } = data;
  const { phases, totalModules, completedModules } = roadmap;

  let currentModule: {
    id: string;
    title: string;
    phase: number;
    order_in_phase: number;
  } | null = null;
  let currentProgress: {
    questions_completed: number;
    total_questions: number | null;
  } | null = null;

  for (const phase of phases) {
    for (const item of phase.modules) {
      if (
        item.isUnlocked &&
        (item.progress?.status !== "completed" ||
          (item.progress.score_percentage ?? 0) < 80)
      ) {
        currentModule = item.module;
        currentProgress = item.progress
          ? {
              questions_completed: item.progress.questions_completed,
              total_questions: item.module.total_questions,
            }
          : null;
        break;
      }
    }
    if (currentModule) break;
  }

  const overallPct =
    totalModules > 0
      ? Math.round((completedModules / totalModules) * 100)
      : 0;

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">

        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1.5">
            Training for NETA Level 1
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Your learning path progress
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-2xl px-4 py-4 flex items-start gap-3">
            <Flame size={16} className="text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground mb-0.5 font-medium">Streak</p>
              <p className="text-xl font-semibold text-foreground leading-none">{streak}</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl px-4 py-4 flex items-start gap-3">
            <BookCheck size={16} className="text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground mb-0.5 font-medium">Modules</p>
              <p className="text-xl font-semibold text-foreground leading-none">
                {completedModules}/{totalModules}
              </p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl px-4 py-4 flex items-start gap-3">
            <Target size={16} className="text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground mb-0.5 font-medium">Overall</p>
              <p className="text-xl font-semibold text-foreground leading-none">{overallPct}%</p>
            </div>
          </div>
        </div>

        {currentModule ? (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl px-6 py-6 space-y-4">
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
                Phase {currentModule.phase} · Module {currentModule.order_in_phase}
              </p>
              <p className="text-foreground font-semibold text-lg leading-snug">
                {currentModule.title}
              </p>
              {currentProgress?.total_questions && (
                <p className="text-muted-foreground text-sm mt-1">
                  {currentProgress.questions_completed > 0
                    ? `${currentProgress.questions_completed}/${currentProgress.total_questions} questions answered`
                    : `${currentProgress.total_questions} questions`}
                </p>
              )}
            </div>
            <Link
              href={`/roadmap/module/${currentModule.id}`}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-medium text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-all duration-150"
            >
              {currentProgress && currentProgress.questions_completed > 0
                ? "Continue Module"
                : "Start Module"}
              <ChevronRight size={15} />
            </Link>
          </div>
        ) : completedModules === totalModules && totalModules > 0 ? (
          <div className="bg-green-500/5 border border-green-500/20 rounded-2xl px-6 py-6 text-center">
            <Trophy className="text-green-400 mx-auto mb-2" size={24} />
            <p className="text-green-400 font-semibold">
              All modules complete! Roadmap finished.
            </p>
          </div>
        ) : null}

        <div className="bg-card border border-border rounded-2xl px-6 py-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Roadmap Progress</h2>
            <Link
              href="/roadmap"
              className="text-xs text-primary hover:opacity-80 transition-all"
            >
              View Full Roadmap →
            </Link>
          </div>
          <div className="space-y-3">
            {phases.map(({ phase, label, modules }) => {
              const done = modules.filter(
                (m) =>
                  m.progress?.status === "completed" &&
                  (m.progress.score_percentage ?? 0) >= 80
              ).length;
              const pct =
                modules.length > 0
                  ? Math.round((done / modules.length) * 100)
                  : 0;
              const allLocked = modules.every((m) => !m.isUnlocked);
              return (
                <div key={phase} className="flex items-center gap-4">
                  <div className="w-28 shrink-0">
                    <p className="text-xs font-medium text-foreground">Phase {phase}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{label}</p>
                  </div>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    {!allLocked && (
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    )}
                  </div>
                  <span className="w-16 text-right text-xs text-muted-foreground tabular-nums shrink-0">
                    {allLocked ? "Locked" : `${done}/${modules.length}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Quick Access
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NavCard
              href="/roadmap"
              icon={<Map size={20} />}
              title="Learning Roadmap"
              description="28 modules across 5 phases"
            />
            <NavCard
              href="/drill"
              icon={<Zap size={20} />}
              title="Daily Drill"
              description="Spaced repetition practice"
            />
          </div>
        </div>

        {totalAnswered === 0 && (
          <p className="text-xs text-muted-foreground text-center">
            Complete roadmap modules to build your question bank, then start
            drilling for exam prep.
          </p>
        )}
      </div>
    </main>
  );
}
