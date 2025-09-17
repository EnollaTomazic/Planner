import * as React from "react";
import { cn } from "@/lib/utils";
import SectionLabel from "@/components/reviews/SectionLabel";
import NeonIcon from "@/components/reviews/NeonIcon";
import ReviewSurface from "@/components/reviews/ReviewSurface";

export type ReviewSummaryScoreProps = {
  score: number;
  msg: string;
  ScoreIcon: React.ComponentType<{ className?: string }>;
  scoreIconCls?: string;
  focusOn?: boolean;
  focus?: number;
  focusMsg?: string;
};

export default function ReviewSummaryScore({
  score,
  msg,
  ScoreIcon,
  scoreIconCls,
  focusOn,
  focus,
  focusMsg,
}: ReviewSummaryScoreProps) {
  return (
    <div>
      <SectionLabel>Score</SectionLabel>
      <ReviewSurface
        paddingX="md"
        className="relative h-[var(--space-7)]"
      >
        <div className="absolute left-[var(--space-4)] right-[var(--space-4)] top-1/2 -translate-y-1/2 px-[var(--space-3)]">
          <div
            className="relative h-[var(--space-2)] w-full rounded-full bg-muted shadow-neo-inset"
            style={{ "--progress": `${score * 10}%` } as React.CSSProperties}
          >
            <div className="absolute left-0 top-0 h-[var(--space-2)] w-[var(--progress)] rounded-full bg-gradient-to-r from-primary to-accent shadow-ring [--ring:var(--primary)]" />
            <div className="absolute left-[var(--progress)] top-1/2 h-[calc(var(--space-4)+var(--space-1))] w-[calc(var(--space-4)+var(--space-1))] -translate-y-1/2 -translate-x-1/2 rounded-full border border-border bg-card shadow-neoSoft" />
          </div>
        </div>
      </ReviewSurface>
      <div className="mt-[var(--space-1)] flex items-center gap-[var(--space-2)] text-ui text-muted-foreground">
        <span className="pill h-[var(--space-5)] px-[var(--space-2)] text-ui">{score}/10</span>
        <ScoreIcon className={cn("h-[var(--space-4)] w-[var(--space-4)]", scoreIconCls)} />
        <span>{msg}</span>
      </div>
      {focusOn && typeof focus === "number" && focusMsg && (
        <div className="mt-[var(--space-4)] space-y-[var(--space-2)]">
          <div className="mb-[var(--space-2)] flex items-center gap-[var(--space-2)]" aria-label="Focus">
            <NeonIcon kind="brain" on={true} size={32} staticGlow />
            <div className="h-[var(--hairline-w)] flex-1 bg-gradient-to-r from-foreground/20 via-foreground/5 to-transparent" />
          </div>
          <ReviewSurface
            paddingX="md"
            className="relative h-[var(--space-7)]"
          >
            <div className="absolute left-[var(--space-4)] right-[var(--space-4)] top-1/2 -translate-y-1/2 px-[var(--space-3)]">
              <div
                className="relative h-[var(--space-2)] w-full rounded-full bg-muted shadow-neo-inset"
                style={
                  {
                    "--progress": `${(focus / 10) * 100}%`,
                  } as React.CSSProperties
                }
              >
                <div className="absolute left-0 top-0 h-[var(--space-2)] w-[var(--progress)] rounded-full bg-gradient-to-r from-accent to-primary shadow-ring [--ring:var(--accent)]" />
                <div className="absolute left-[var(--progress)] top-1/2 h-[calc(var(--space-4)+var(--space-1))] w-[calc(var(--space-4)+var(--space-1))] -translate-y-1/2 -translate-x-1/2 rounded-full border border-border bg-card shadow-neoSoft" />
              </div>
            </div>
          </ReviewSurface>
          <div className="mt-[var(--space-1)] flex items-center gap-[var(--space-2)] text-ui text-muted-foreground">
            <span className="pill h-[var(--space-5)] px-[var(--space-2)] text-ui">{focus}/10</span>
            <span>{focusMsg}</span>
          </div>
        </div>
      )}
    </div>
  );
}
