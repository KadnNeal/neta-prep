import { getRoadmapData } from "@/lib/roadmap";
import { getDashboardData } from "@/lib/readiness";
import { RoadmapTree } from "@/components/roadmap/RoadmapTree";
import { createClient } from "@/lib/supabase/server";
import { isActivePro } from "@/lib/stripe";
import type { ProfileSubscription } from "@/lib/stripe";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { ModuleWithProgress } from "@/lib/roadmap";

export default async function RoadmapPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [roadmap, readiness, profileRaw] = await Promise.all([
    getRoadmapData(user.id),
    getDashboardData(),
    supabase
      .from("profiles")
      .select("subscription_tier, subscription_status, subscription_expires_at, stripe_customer_id, neta_target_level")
      .eq("id", user.id)
      .single()
      .then((r) => r.data),
  ]);

  const isFreeTier = !profileRaw || !isActivePro(profileRaw as unknown as ProfileSubscription);
  const targetLevel = (profileRaw as unknown as { neta_target_level: number | null })?.neta_target_level ?? 2;

  const { phases, totalModules, completedModules, remainingMinutes } = roadmap;
  const streak = readiness?.streak ?? 0;

  // First incomplete module
  let currentModule: ModuleWithProgress | null = null;
  for (const { modules } of phases) {
    for (const item of modules) {
      if (item.progress?.status !== "completed") {
        currentModule = item;
        break;
      }
    }
    if (currentModule) break;
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-12">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1.5">
              Training for NETA Level {targetLevel}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Learning Roadmap
            </h1>
            <p className="text-muted-foreground text-sm mt-1.5">
              {completedModules === totalModules && totalModules > 0
                ? "All modules complete — roadmap finished!"
                : `${completedModules} of ${totalModules} modules complete`}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="shrink-0 text-xs text-muted-foreground hover:text-foreground transition-all duration-150 mt-1"
          >
            Dashboard →
          </Link>
        </div>

        {/* Visual tree */}
        <RoadmapTree
          phases={phases}
          completedModules={completedModules}
          totalModules={totalModules}
          remainingMinutes={remainingMinutes}
          streak={streak}
          currentModule={currentModule}
          isFreeTier={isFreeTier}
        />

      </div>
    </main>
  );
}
