import Link from "next/link";
import type { RoadmapLearnContent } from "@/lib/roadmap";

export function LearnPageContent({
  content,
  quizUrl,
}: {
  content: RoadmapLearnContent;
  quizUrl: string;
}) {
  return (
    <div className="space-y-8">
      {/* Overview */}
      <p className="text-base text-foreground/85 leading-relaxed">{content.overview}</p>

      {/* Sections */}
      {content.sections.map((section, i) => (
        <div key={i} className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
          <p className="text-sm text-foreground/80 leading-relaxed">{section.content}</p>
          {section.key_points.length > 0 && (
            <ul className="space-y-2">
              {section.key_points.map((point, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-foreground/80 leading-relaxed">
                  <span className="shrink-0 text-primary mt-0.5">–</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
          {section.standards_reference && (
            <p className="text-xs text-muted-foreground border-t border-border pt-3">
              Ref: {section.standards_reference}
            </p>
          )}
        </div>
      ))}

      {/* Key Values table */}
      {content.key_values.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">Key Values & Acceptance Criteria</h2>
          <div className="border border-border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-1/3">Parameter</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-1/3">Value / Criteria</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">When It Applies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {content.key_values.map((kv, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="px-4 py-3 font-medium text-foreground">{kv.label}</td>
                    <td className="px-4 py-3 text-primary font-medium">{kv.value}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{kv.context}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Exam Tips */}
      {content.exam_tips.length > 0 && (
        <div className="border-l-2 border-primary bg-primary/5 rounded-r-2xl px-5 py-5 space-y-3">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest">Exam Tips</p>
          <ul className="space-y-2">
            {content.exam_tips.map((tip, i) => (
              <li key={i} className="text-sm text-foreground/85 leading-relaxed">{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Summary */}
      <div className="bg-muted/40 border border-border rounded-2xl px-6 py-6 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Before You Take the Quiz</p>
        <p className="text-sm text-foreground/85 leading-relaxed">{content.summary}</p>
      </div>

      {/* Start Quiz CTA */}
      <Link
        href={quizUrl}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold text-base py-4 rounded-2xl hover:opacity-90 transition-all duration-150"
      >
        Start Quiz →
      </Link>
    </div>
  );
}
