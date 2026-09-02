import { getModuleForQuiz } from "@/lib/roadmap";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { LearnPageContent } from "@/components/roadmap/LearnPageContent";
import { Clock, ChevronRight } from "lucide-react";
import type { RoadmapLearnContent } from "@/lib/roadmap";

export default async function LearnPage({
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

  const { module } = data;
  const learnContent = module.content_sections as RoadmapLearnContent | null;

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
          <Link href="/roadmap" className="hover:text-foreground transition-colors">
            Roadmap
          </Link>
          <ChevronRight size={12} />
          <span className="text-foreground">{module.title}</span>
        </div>

        {/* Header */}
        <div className="mb-8 space-y-3">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest">
            Phase {module.phase}{module.phase_title ? ` — ${module.phase_title}` : ""} · Learn
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {module.title}
          </h1>
          <div className="flex items-center gap-4 flex-wrap">
            {module.estimated_minutes && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock size={11} />
                ~{module.estimated_minutes} min
              </span>
            )}
            {module.domain && (
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                {module.domain}
              </span>
            )}
          </div>
          {module.neta_reference && (
            <p className="text-xs text-muted-foreground/70 italic">
              {module.neta_reference}
            </p>
          )}
        </div>

        {/* Content or coming soon */}
        {learnContent ? (
          <LearnPageContent
            content={learnContent}
            quizUrl={`/roadmap/module/${moduleId}`}
          />
        ) : (
          <div className="bg-card border border-border rounded-2xl px-6 py-12 text-center space-y-4">
            <p className="text-2xl">📋</p>
            <h2 className="text-base font-semibold text-foreground">Content coming soon</h2>
            <p className="text-sm text-muted-foreground">
              Learning content for this module is being prepared. You can still take the quiz.
            </p>
            <Link
              href={`/roadmap/module/${moduleId}`}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-medium text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-all"
            >
              Go to Quiz →
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
