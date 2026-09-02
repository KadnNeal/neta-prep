import { createClient } from "@/lib/supabase/server";

// ── Types ─────────────────────────────────────────────────────────────────────
// These tables were added in migration 20260413 and are not in generated types.

// Content section types for the learn page
export interface TextSection {
  type: "text";
  heading: string;
  body: string;
}

export interface QuickCheckSection {
  type: "quick_check";
  question: string;
  options: { a: string; b: string; c: string; d: string };
  answer: string;
  explanation: string;
}

export interface VideoSection {
  type: "video";
  title: string;
  search_query: string;
  why: string;
}

export interface WorkedExampleSection {
  type: "worked_example";
  problem: string;
  steps: string[];
  answer: string;
}

export interface SummarySection {
  type: "summary";
  points: string[];
}

export type ContentSection =
  | TextSection
  | QuickCheckSection
  | VideoSection
  | WorkedExampleSection
  | SummarySection;

export interface RoadmapLearnSection {
  title: string;
  content: string;
  key_points: string[];
  standards_reference: string;
}

export interface RoadmapKeyValue {
  label: string;
  value: string;
  context: string;
}

export interface RoadmapLearnContent {
  overview: string;
  sections: RoadmapLearnSection[];
  key_values: RoadmapKeyValue[];
  exam_tips: string[];
  summary: string;
}

export interface RoadmapModule {
  id: string;
  phase: number;
  phase_title: string | null;
  order_in_phase: number;
  title: string;
  description: string | null;
  domain: string | null;
  neta_reference: string | null;
  estimated_minutes: number | null;
  content_source: string | null;
  total_questions: number | null;
  unlocks_after: string | null;
  created_at: string;
  hook_text: string | null;
  content_sections: RoadmapLearnContent | null;
  estimated_read_time: number | null;
  video_recommended: boolean | null;
}

export interface UserRoadmapProgress {
  id: string;
  user_id: string;
  module_id: string;
  status: "not_started" | "in_progress" | "completed";
  questions_completed: number;
  questions_correct: number;
  score_percentage: number | null;
  started_at: string | null;
  completed_at: string | null;
  // Added in migration 20260418
  learning_complete: boolean | null;
}

export interface ModuleWithProgress {
  module: RoadmapModule;
  progress: UserRoadmapProgress | null;
  isUnlocked: boolean;
}

export interface RoadmapQuestion {
  id: string;
  question: string;
  options: { a: string; b: string; c: string; d: string };
  // Included for roadmap (learning mode) — not sent in exam simulation
  correct_answer: string;
  explanation: string;
}

// ── Phase labels ──────────────────────────────────────────────────────────────

export const PHASE_LABELS: Record<number, string> = {
  1: "Foundation",
  2: "The Commissioning Process",
  3: "Component Testing",
  4: "Specialized Equipment",
  5: "Advanced Testing & Documentation",
};

// ── Server-side helpers ───────────────────────────────────────────────────────

/** Fetch all modules with user progress and computed unlock status. Server-only. */
export async function getRoadmapData(userId: string): Promise<{
  phases: Array<{ phase: number; label: string; modules: ModuleWithProgress[] }>;
  totalModules: number;
  completedModules: number;
  remainingMinutes: number;
}> {
  const supabase = await createClient();

  // Fetch all modules
  const { data: modulesRaw } = await supabase
    .from("roadmap_modules" as "profiles") // cast: not in generated types
    .select("*")
    .order("phase", { ascending: true })
    .order("order_in_phase", { ascending: true });

  const modules = (modulesRaw ?? []) as unknown as RoadmapModule[];

  // Fetch user progress
  const { data: progressRaw } = await supabase
    .from("user_roadmap_progress" as "profiles")
    .select("*")
    .eq("user_id", userId);

  const progressList = (progressRaw ?? []) as unknown as UserRoadmapProgress[];
  const progressMap = new Map(progressList.map((p) => [p.module_id, p]));

  const moduleMap = new Map(modules.map((m) => [m.id, m]));

  // All modules freely accessible — no completion gate
  const withProgress: ModuleWithProgress[] = modules.map((module) => ({
    module,
    progress: progressMap.get(module.id) ?? null,
    isUnlocked: true,
  }));

  // moduleMap reserved for future unlock-chain lookups
  void moduleMap.size;

  // Group by phase — use phase_title from DB, fall back to PHASE_LABELS constant
  const phaseNumbers = [...new Set(modules.map((m) => m.phase))].sort();
  const phases = phaseNumbers.map((phase) => {
    const phaseModules = withProgress.filter((m) => m.module.phase === phase);
    const dbTitle = phaseModules[0]?.module.phase_title;
    return {
      phase,
      label: dbTitle ?? PHASE_LABELS[phase] ?? `Phase ${phase}`,
      modules: phaseModules,
    };
  });

  const completedModules = progressList.filter(
    (p) => p.status === "completed" && (p.score_percentage ?? 0) >= 80
  ).length;

  const remainingMinutes = withProgress
    .filter(
      (m) =>
        m.isUnlocked &&
        (!m.progress ||
          m.progress.status !== "completed" ||
          (m.progress.score_percentage ?? 0) < 80)
    )
    .reduce((sum, m) => sum + (m.module.estimated_minutes ?? 0), 0);

  return {
    phases,
    totalModules: modules.length,
    completedModules,
    remainingMinutes,
  };
}

/** Fetch a single module with questions (no correct_answer) for the quiz UI. Server-only. */
export async function getModuleForQuiz(
  moduleId: string,
  userId: string
): Promise<{
  module: RoadmapModule;
  questions: RoadmapQuestion[];
  progress: UserRoadmapProgress | null;
  isUnlocked: boolean;
  nextModuleId: string | null;
} | null> {
  const supabase = await createClient();

  // Fetch the module
  const { data: moduleRaw } = await supabase
    .from("roadmap_modules" as "profiles")
    .select("*")
    .eq("id", moduleId)
    .single();

  if (!moduleRaw) return null;
  const roadmapModule = moduleRaw as unknown as RoadmapModule;

  // All modules freely accessible — no completion gate
  const isUnlocked = true;

  // Fetch questions WITH correct_answer — roadmap is learning mode, not exam
  const { data: questionsRaw } = await supabase
    .from("questions")
    .select("id, question, options, correct_answer, explanation")
    .eq("roadmap_module_id" as "id", moduleId)
    .eq("question_type" as "id", "roadmap")
    .order("created_at", { ascending: true });

  const questions = (questionsRaw ?? []) as unknown as RoadmapQuestion[];

  // Fetch user progress for this module
  const { data: progressRaw } = await supabase
    .from("user_roadmap_progress" as "profiles")
    .select("*")
    .eq("user_id", userId)
    .eq("module_id", moduleId)
    .single();

  const progress = (progressRaw as unknown as UserRoadmapProgress) ?? null;

  // Find next module
  const { data: nextRaw } = await supabase
    .from("roadmap_modules" as "profiles")
    .select("id")
    .eq("unlocks_after" as "id", moduleId)
    .single();

  const nextModuleId =
    (nextRaw as unknown as { id: string } | null)?.id ?? null;

  return { module: roadmapModule, questions, progress, isUnlocked, nextModuleId };
}
