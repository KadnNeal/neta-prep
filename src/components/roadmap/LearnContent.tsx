"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Video,
  ChevronRight,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import type { ContentSection } from "@/lib/roadmap";

interface Props {
  moduleId: string;
  sections: ContentSection[];
  alreadyLearned: boolean;
  quizUrl: string;
}

// ── Text Section ──────────────────────────────────────────────────────────────

function TextSectionBlock({ section }: { section: Extract<ContentSection, { type: "text" }> }) {
  // Minimal markdown: **bold**, newlines, simple tables
  const lines = section.body.split("\n");
  return (
    <div className="space-y-2">
      <h2 className="text-base font-semibold text-foreground">{section.heading}</h2>
      <div className="text-base text-foreground/85 leading-relaxed space-y-2">
        {lines.map((line, i) => {
          if (line.startsWith("|")) return null; // handled below
          if (line.trim() === "") return <div key={i} className="h-1" />;
          return (
            <p key={i} dangerouslySetInnerHTML={{ __html: renderInline(line) }} />
          );
        })}
        {/* Simple table rendering */}
        {renderTable(section.body)}
      </div>
    </div>
  );
}

function renderInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code class='bg-muted px-1 rounded text-xs font-mono'>$1</code>");
}

function renderTable(body: string): React.ReactNode {
  const lines = body.split("\n");
  const tableLines = lines.filter((l) => l.startsWith("|"));
  if (tableLines.length < 2) return null;

  const rows = tableLines
    .filter((l) => !l.match(/^\|[-| ]+\|$/))
    .map((l) =>
      l
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim())
    );

  if (rows.length === 0) return null;
  const [header, ...body_rows] = rows;

  return (
    <div className="overflow-x-auto mt-3">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            {header.map((h, i) => (
              <th
                key={i}
                className="text-left px-3 py-2 bg-muted font-semibold text-foreground border border-border"
                dangerouslySetInnerHTML={{ __html: renderInline(h) }}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {body_rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? "bg-background" : "bg-muted/30"}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="px-3 py-2 border border-border text-foreground/80"
                  dangerouslySetInnerHTML={{ __html: renderInline(cell) }}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Quick Check ───────────────────────────────────────────────────────────────

function QuickCheckBlock({
  section,
}: {
  section: Extract<ContentSection, { type: "quick_check" }>;
}) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const optionKeys = ["a", "b", "c", "d"] as const;
  const wasCorrect = chosen === section.answer;

  function handleSubmit() {
    if (!chosen) return;
    setRevealed(true);
  }

  return (
    <div className="bg-card border border-border rounded-2xl px-5 py-5 space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen size={14} className="text-primary shrink-0" />
        <span className="text-xs font-semibold text-primary uppercase tracking-widest">
          Quick Check
        </span>
      </div>
      <p className="text-sm font-medium text-foreground leading-relaxed">
        {section.question}
      </p>
      <div className="space-y-2">
        {optionKeys.map((letter) => {
          const text = section.options[letter];
          const isChosen = chosen === letter;
          const isCorrect = letter === section.answer;
          const showCorrect = revealed && isCorrect;
          const showWrong = revealed && isChosen && !wasCorrect;

          let cls =
            "w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all duration-150 ";
          if (!revealed) {
            cls += isChosen
              ? "border-primary bg-primary/10 text-foreground"
              : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted/40";
          } else if (showCorrect) {
            cls += "border-green-500 bg-green-500/10 text-green-400";
          } else if (showWrong) {
            cls += "border-red-500 bg-red-500/10 text-red-400";
          } else {
            cls += "border-border bg-background text-muted-foreground opacity-50";
          }

          return (
            <button
              key={letter}
              disabled={revealed}
              onClick={() => setChosen(letter)}
              className={cls}
            >
              <span className="font-semibold uppercase mr-2">{letter}.</span>
              {text}
            </button>
          );
        })}
      </div>

      {!revealed ? (
        <div className="flex justify-end">
          <button
            disabled={!chosen}
            onClick={handleSubmit}
            className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Check Answer
          </button>
        </div>
      ) : (
        <div
          className={`rounded-xl px-4 py-3 text-sm border ${
            wasCorrect
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          <div className="flex items-center gap-2 mb-1 font-semibold">
            {wasCorrect ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
            {wasCorrect ? "Correct!" : "Incorrect"}
          </div>
          <p className="text-foreground/80 leading-relaxed">{section.explanation}</p>
        </div>
      )}
    </div>
  );
}

// ── Video Recommendation ──────────────────────────────────────────────────────

function VideoBlock({
  section,
}: {
  section: Extract<ContentSection, { type: "video" }>;
}) {
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    section.search_query
  )}`;

  return (
    <div className="bg-card border border-border rounded-2xl px-5 py-5 space-y-3">
      <div className="flex items-center gap-2">
        <Video size={14} className="text-orange-400 shrink-0" />
        <span className="text-xs font-semibold text-orange-400 uppercase tracking-widest">
          Recommended Video
        </span>
      </div>
      <p className="text-sm font-medium text-foreground">{section.title}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{section.why}</p>
      <a
        href={searchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
      >
        Search on YouTube
        <ExternalLink size={11} />
      </a>
    </div>
  );
}

// ── Worked Example ────────────────────────────────────────────────────────────

function WorkedExampleBlock({
  section,
}: {
  section: Extract<ContentSection, { type: "worked_example" }>;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">
            Worked Example
          </span>
        </div>
        <p className="text-sm text-foreground leading-relaxed">{section.problem}</p>
      </div>

      <div className="border-t border-border">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-muted/30 transition-all"
        >
          <span className="text-xs font-semibold text-muted-foreground">
            {expanded ? "Hide" : "Show"} solution
          </span>
          <ChevronRight
            size={14}
            className={`text-muted-foreground transition-transform duration-150 ${
              expanded ? "rotate-90" : ""
            }`}
          />
        </button>

        {expanded && (
          <div className="px-5 pb-5 space-y-2 border-t border-border pt-4">
            {section.steps.map((step, i) => (
              <p key={i} className="text-sm text-foreground/80 leading-relaxed">
                {step}
              </p>
            ))}
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-sm font-semibold text-foreground">
                Answer: {section.answer}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Summary ───────────────────────────────────────────────────────────────────

function SummaryBlock({
  section,
}: {
  section: Extract<ContentSection, { type: "summary" }>;
}) {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-2xl px-5 py-5 space-y-3">
      <p className="text-xs font-semibold text-primary uppercase tracking-widest">
        Key Takeaways
      </p>
      <ul className="space-y-2">
        {section.points.map((point, i) => (
          <li key={i} className="flex items-start gap-2">
            <CheckCircle2 size={13} className="text-primary shrink-0 mt-0.5" />
            <span className="text-sm text-foreground/85 leading-relaxed">{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Complete CTA ──────────────────────────────────────────────────────────────

function CompleteCTA({
  moduleId,
  alreadyLearned,
  quizUrl,
}: {
  moduleId: string;
  alreadyLearned: boolean;
  quizUrl: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(alreadyLearned);

  async function markComplete() {
    setLoading(true);
    try {
      await fetch(`/api/roadmap/module/${moduleId}/learn-complete`, {
        method: "POST",
      });
      setDone(true);
    } catch {
      // fail silently — user can still proceed to quiz
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl px-6 py-6 text-center space-y-4 mt-8">
      {done ? (
        <>
          <CheckCircle2 size={28} className="text-green-400 mx-auto" />
          <p className="text-sm font-semibold text-foreground">
            Learning complete! Ready to take the quiz?
          </p>
          <button
            onClick={() => router.push(quizUrl)}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-medium text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-all"
          >
            Take the Quiz
            <ChevronRight size={14} />
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Finished reading? Mark this module as learned to unlock the quiz.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push(quizUrl)}
              className="flex-1 bg-card border border-border text-foreground text-sm font-medium px-5 py-2.5 rounded-lg hover:border-primary/40 transition-all"
            >
              Skip to Quiz
            </button>
            <button
              onClick={markComplete}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-medium text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-all disabled:opacity-60"
            >
              {loading ? "Saving…" : "Mark as Learned"}
              {!loading && <CheckCircle2 size={14} />}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function LearnContent({ moduleId, sections, alreadyLearned, quizUrl }: Props) {
  return (
    <div className="space-y-6">
      {sections.map((section, i) => {
        switch (section.type) {
          case "text":
            return (
              <div key={i} className="bg-card border border-border rounded-2xl px-6 py-6 shadow-sm">
                <TextSectionBlock section={section} />
              </div>
            );
          case "quick_check":
            return <QuickCheckBlock key={i} section={section} />;
          case "video":
            return <VideoBlock key={i} section={section} />;
          case "worked_example":
            return <WorkedExampleBlock key={i} section={section} />;
          case "summary":
            return <SummaryBlock key={i} section={section} />;
          default:
            return null;
        }
      })}

      <CompleteCTA
        moduleId={moduleId}
        alreadyLearned={alreadyLearned}
        quizUrl={quizUrl}
      />
    </div>
  );
}
