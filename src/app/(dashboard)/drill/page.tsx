import { DrillSession } from "@/components/drill/DrillSession";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function DrillPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm transition-all duration-150 mb-6"
          >
            <ChevronLeft size={16} />
            Dashboard
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Daily Drill
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Spaced repetition — review your due cards
          </p>
        </div>
        <DrillSession />
      </div>
    </main>
  );
}
