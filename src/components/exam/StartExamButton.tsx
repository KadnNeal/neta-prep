"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function StartExamButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/exam/start", { method: "POST" });
      const data = (await res.json()) as { attemptId?: string; error?: string };

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to start exam");
      }

      router.push(`/exam/${data.attemptId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleStart}
        disabled={loading}
        className="w-full min-h-[52px] py-3.5 bg-primary text-primary-foreground font-semibold text-base rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
      >
        {loading ? "Starting exam…" : "Start Exam"}
      </button>
      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}
    </div>
  );
}
