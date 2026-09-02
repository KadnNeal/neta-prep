import { StartExamButton } from "@/components/exam/StartExamButton";
import { createClient } from "@/lib/supabase/server";
import { isActivePro } from "@/lib/stripe";
import type { ProfileSubscription } from "@/lib/stripe";
import { AlertCircle, CheckCircle, Clock, FileText, ChevronLeft, Lock } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ExamLauncherPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("neta_target_level, subscription_tier, subscription_status, subscription_expires_at, stripe_customer_id")
    .eq("id", user.id)
    .single();

  const isPro = profileRaw
    ? isActivePro(profileRaw as unknown as ProfileSubscription)
    : false;

  const targetLevel = (profileRaw as unknown as { neta_target_level: number | null })?.neta_target_level ?? 2;
  const questionCount = targetLevel === 4 ? 65 : 100;

  const { count } = await supabase
    .from("questions")
    .select("*", { count: "exact", head: true })
    .eq("level", targetLevel)
    .eq("question_type" as "id", "exam_simulation");

  const availableQuestions = count ?? 0;
  const hasEnoughQuestions = availableQuestions >= questionCount;

  // Free tier gate
  if (!isPro) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm transition-all duration-150"
          >
            <ChevronLeft size={16} />
            Dashboard
          </Link>
          <div className="bg-card border border-primary/20 rounded-2xl p-8 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
              <Lock size={22} className="text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-foreground">Exam Simulator — Pro Feature</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                The timed 100-question exam simulation is available on Monthly, 90-Day Pass, and Annual plans.
              </p>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-6 py-3 rounded-xl hover:opacity-90 transition-all duration-150"
            >
              View Plans
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-6">

        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm transition-all duration-150"
        >
          <ChevronLeft size={16} />
          Dashboard
        </Link>

        {/* Header */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest">
            NETA Level {targetLevel}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Exam Simulation
          </h1>
          <p className="text-muted-foreground text-sm">
            Timed practice under real exam conditions
          </p>
        </div>

        {/* Exam specs card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Exam Conditions
          </h2>
          <div className="grid grid-cols-2 gap-5">
            {[
              {
                icon: <FileText size={16} />,
                label: "Questions",
                value: `${questionCount} questions`,
              },
              {
                icon: <Clock size={16} />,
                label: "Time limit",
                value: "120 minutes",
              },
              {
                icon: <CheckCircle size={16} />,
                label: "Passing score",
                value: "75% (≈ 410/500)",
              },
              {
                icon: <AlertCircle size={16} />,
                label: "Format",
                value: "Closed book, MCQ",
              },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="text-muted-foreground mt-0.5 shrink-0">
                  {icon}
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rules */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Rules
          </h2>
          <ul className="space-y-2.5 text-sm text-foreground">
            {[
              "Navigate freely — review and change answers anytime",
              "Flag questions to revisit before submitting",
              "Timer runs continuously — no pausing allowed",
              "Exam auto-submits when time expires",
              "Closing this tab will warn you but not save your answers",
            ].map((rule) => (
              <li key={rule} className="flex items-start gap-2.5">
                <span className="text-primary mt-0.5 shrink-0 text-xs font-bold">
                  ›
                </span>
                <span className="text-muted-foreground">{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Start / unavailable */}
        {hasEnoughQuestions ? (
          <div className="space-y-3">
            <StartExamButton />
            <p className="text-center text-xs text-muted-foreground">
              Once started, the exam cannot be paused.
            </p>
          </div>
        ) : (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl px-6 py-5 text-center space-y-2">
            <p className="text-amber-400 font-semibold text-sm">
              Not enough questions available
            </p>
            <p className="text-amber-400/70 text-xs">
              The question bank needs at least {questionCount} Level{" "}
              {targetLevel} questions. Currently {availableQuestions} available.
            </p>
          </div>
        )}

      </div>
    </main>
  );
}
