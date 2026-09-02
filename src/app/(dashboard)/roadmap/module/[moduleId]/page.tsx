import { getModuleForQuiz } from "@/lib/roadmap";
import { createClient } from "@/lib/supabase/server";
import { ModuleQuiz } from "@/components/roadmap/ModuleQuiz";
import { Lock, Clock, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";

function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const data = await getModuleForQuiz(moduleId, user.id);
  if (!data) notFound();

  const { module, questions, progress, isUnlocked, nextModuleId } = data;

  const alreadyCompleted =
    progress?.status === "completed" &&
    (progress.score_percentage ?? 0) >= 80;

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">

        {/* ── Back link ────────────────────────────────────────────── */}
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-all duration-150"
        >
          <ChevronLeft size={15} />
          Back to Roadmap
        </Link>

        {/* ── Module header ────────────────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1.5">
            Phase {module.phase} · Module {module.order_in_phase}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {module.title}
          </h1>
          {module.description && (
            <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">
              {module.description}
            </p>
          )}
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            {module.estimated_minutes && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {formatMinutes(module.estimated_minutes)}
              </span>
            )}
            {module.total_questions && (
              <span>{module.total_questions} questions</span>
            )}
            {alreadyCompleted && progress?.score_percentage !== null && (
              <span className="text-green-400 font-semibold">
                Best: {progress?.score_percentage?.toFixed(0)}%
              </span>
            )}
          </div>
        </div>

        {/* ── Locked state ─────────────────────────────────────────── */}
        {!isUnlocked ? (
          <div className="bg-card border border-border rounded-2xl px-8 py-12 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted mb-4">
              <Lock size={22} className="text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Module Locked
            </h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
              Complete the previous module with a score of 80% or higher to
              unlock this module.
            </p>
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-medium text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-all duration-150"
            >
              View Roadmap
            </Link>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl px-8 py-12 text-center shadow-sm">
            <p className="text-muted-foreground text-sm">
              No questions available for this module yet.
            </p>
          </div>
        ) : (
          /* ── Quiz ─────────────────────────────────────────────── */
          <ModuleQuiz
            module={module}
            questions={questions}
            nextModuleId={nextModuleId}
            alreadyCompleted={alreadyCompleted}
            previousScore={progress?.score_percentage ?? null}
          />
        )}
      </div>
    </main>
  );
}
