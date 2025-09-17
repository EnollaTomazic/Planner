import * as React from "react";
import { cn } from "@/lib/utils";
import SectionLabel from "@/components/reviews/SectionLabel";
import NeonIcon from "@/components/reviews/NeonIcon";
import ReviewSurface from "./ReviewSurface";
import ReviewSliderTrack from "./ReviewSliderTrack";

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
      <ReviewSurface className="relative h-[var(--space-7)]" padding="inline">
        <ReviewSliderTrack
          value={score}
          variant="display"
          tone="score"
          className="px-[var(--space-3)]"
        />
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
          <ReviewSurface className="relative h-[var(--space-7)]" padding="inline">
            <ReviewSliderTrack
              value={focus}
              variant="display"
              tone="focus"
              className="px-[var(--space-3)]"
            />
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
