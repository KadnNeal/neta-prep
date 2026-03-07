import { NETA_DOMAINS, TIER1_SUBDOMAINS, formatSubdomainLabel } from "@/lib/neta-domains";
import { ReadinessRadar, type RadarPoint } from "@/components/dashboard/ReadinessRadar";
import { getReadinessData } from "@/lib/readiness";

import {
  BookCheck,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Flame,
  MessageSquare,
  Trophy,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

// ── helpers ─────────────────────────────────────────────────────────────────

function masteryBarClass(m: number) {
  if (m >= 80) return "bg-green-500";
  if (m >= 60) return "bg-yellow-500";
  return "bg-red-500";
}

function masteryTextClass(m: number) {
  if (m >= 80) return "text-green-400";
  if (m >= 60) return "text-yellow-400";
  return "text-red-400";
}

function daysFromNow(dateStr: string): number {
  return Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

// ── sub-components ───────────────────────────────────────────────────────────

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
        {sub && (
          <p className="text-xs text-muted-foreground mt-1.5">{sub}</p>
        )}
      </div>
    </div>
  );
}

function SubdomainRow({
  slug,
  mastery,
  seen,
  total,
}: {
  slug: string;
  mastery: number;
  seen: number;
  total: number;
}) {
  const isTier1 = (TIER1_SUBDOMAINS as readonly string[]).includes(slug);
  return (
    <div className="flex items-center gap-4 py-2.5">
      <div className="w-44 shrink-0 flex items-center gap-2">
        <span className="text-sm text-foreground font-medium">
          {formatSubdomainLabel(slug)}
        </span>
        {isTier1 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20 leading-none font-medium">
            T1
          </span>
        )}
      </div>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${masteryBarClass(mastery)}`}
          style={{ width: `${mastery}%` }}
        />
      </div>
      <span
        className={`w-10 text-right text-sm font-semibold tabular-nums ${masteryTextClass(mastery)}`}
      >
        {mastery}%
      </span>
      <span className="w-16 text-right text-xs text-muted-foreground tabular-nums">
        {seen}/{total}
      </span>
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

// ── page ────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const data = await getReadinessData();
  if (!data) redirect("/login");

  const {
    domainMastery,
    subdomainMastery,
    streak,
    totalAnswered,
    averageEaseFactor,
    examDate,
    targetLevel,
    isExamReady,
    examSimCount,
    bestSimScore,
  } = data;

  const levelKey = `L${targetLevel}` as "L2" | "L3" | "L4";

  const radarData: RadarPoint[] = Object.entries(NETA_DOMAINS)
    .filter(([, d]) => d.examWeight[levelKey] > 0)
    .map(([key, d]) => ({
      subject: d.label,
      mastery: domainMastery[key] ?? 0,
      fullMark: 100,
    }));

  const daysUntilExam = examDate ? daysFromNow(examDate) : null;
  const isNewUser = totalAnswered === 0;

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1.5">
              NETA Level {targetLevel}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground text-sm mt-1.5">
              Your exam readiness at a glance
            </p>
          </div>

          {isExamReady && (
            <div className="shrink-0 flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
              <Trophy className="text-green-400" size={16} />
              <span className="text-green-400 font-semibold text-sm">
                Exam Ready
              </span>
            </div>
          )}
        </div>

        {/* ── New user CTA ─────────────────────────────────────────────── */}
        {isNewUser && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl px-6 py-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-foreground font-semibold">
                Start your first drill session
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Answer questions to see your mastery radar fill up
              </p>
            </div>
            <Link
              href="/drill"
              className="shrink-0 bg-primary text-primary-foreground font-medium text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-all duration-150"
            >
              Start Drilling
            </Link>
          </div>
        )}

        {/* ── Radar + stats grid ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-5">

          {/* Radar */}
          <div className="bg-card border border-border rounded-2xl px-5 py-5 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Domain Mastery
            </p>
            <ReadinessRadar data={radarData} />
            <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                ≥ 80%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
                60–79%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                &lt; 60%
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
            <StatCard
              icon={<Flame size={18} />}
              label="Day streak"
              value={String(streak)}
              sub={streak > 0 ? "Keep it up!" : "Do a drill to start"}
            />
            <StatCard
              icon={<BookCheck size={18} />}
              label="Cards answered"
              value={String(totalAnswered)}
            />
            <StatCard
              icon={<TrendingUp size={18} />}
              label="Avg ease factor"
              value={
                averageEaseFactor > 0
                  ? averageEaseFactor.toFixed(2)
                  : "—"
              }
              sub="Target: ≥ 2.5"
            />
            {daysUntilExam !== null ? (
              <StatCard
                icon={<CalendarDays size={18} />}
                label="Days until exam"
                value={daysUntilExam > 0 ? String(daysUntilExam) : "Today!"}
              />
            ) : (
              <StatCard
                icon={<ClipboardList size={18} />}
                label="Exam sims done"
                value={`${examSimCount}`}
                sub={
                  bestSimScore !== null
                    ? `Best: ${bestSimScore.toFixed(0)}%`
                    : "None yet"
                }
              />
            )}
          </div>
        </div>

        {/* ── Subdomain breakdown ──────────────────────────────────────── */}
        <div className="space-y-5">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Subdomain Mastery
          </h2>

          {Object.entries(NETA_DOMAINS).map(([domainKey, domain]) => {
            const rows = domain.subdomains
              .filter((sd) => (subdomainMastery[sd]?.total ?? 0) > 0)
              .map((sd) => ({ slug: sd, ...subdomainMastery[sd] }));

            return (
              <div
                key={domainKey}
                className="bg-card border border-border rounded-2xl px-6 py-5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    {domain.label}
                  </h3>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                    {domain.examWeight[levelKey]}% of exam
                  </span>
                </div>
                {rows.length > 0 ? (
                  <div className="divide-y divide-border">
                    {rows.map((row) => (
                      <SubdomainRow key={row.slug} {...row} />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm py-1">
                    No questions answered in this domain yet.
                  </p>
                )}
              </div>
            );
          })}

          {Object.values(subdomainMastery).every((m) => m.total === 0) && (
            <div className="bg-card border border-border rounded-2xl px-6 py-10 text-center shadow-sm">
              <p className="text-muted-foreground text-sm">
                No subdomain data yet — complete a drill session to see your
                breakdown.
              </p>
            </div>
          )}
        </div>

        {/* ── Exam simulation summary ──────────────────────────────────── */}
        {examSimCount > 0 && bestSimScore !== null && (
          <div className="bg-card border border-border rounded-2xl px-6 py-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-1 font-medium">
                Exam Simulations
              </p>
              <p className="text-foreground font-semibold">
                {examSimCount} completed · Best score:{" "}
                <span
                  className={
                    bestSimScore >= 75 ? "text-green-400" : "text-red-400"
                  }
                >
                  {bestSimScore.toFixed(0)}%
                </span>
              </p>
              {bestSimScore < 75 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Need ≥ 75% to satisfy Exam Ready criteria
                </p>
              )}
            </div>
            <Link
              href="/exam"
              className="text-primary hover:opacity-80 text-sm font-medium transition-all duration-150"
            >
              Run again →
            </Link>
          </div>
        )}

        {/* ── Quick access ─────────────────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Quick Access
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <NavCard
              href="/drill"
              icon={<Zap size={20} />}
              title="Daily Drill"
              description="SM-2 spaced repetition queue"
            />
            <NavCard
              href="/exam"
              icon={<ClipboardList size={20} />}
              title="Exam Simulation"
              description="100-question timed practice"
            />
            <NavCard
              href="/interview"
              icon={<MessageSquare size={20} />}
              title="Interview Mode"
              description="AI-evaluated technical Q&A"
            />
          </div>
        </div>

      </div>
    </main>
  );
}
