import * as React from "react";
import { cn } from "@/lib/utils";
import { NeonIcon } from "@/components/reviews/NeonIcon";
import { ScoreMeter } from "./ScoreMeter";

export type ReviewSummaryScoreProps = {
  score: number;
  msg: string;
  ScoreIcon: React.ComponentType<{ className?: string }>;
  scoreIconCls?: string;
  focusOn?: boolean;
  focus?: number;
  focusMsg?: string;
};

export function ReviewSummaryScore({
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
      <ScoreMeter
        label="Score"
        value={score}
        tone="score"
        trackProps={{ className: "px-[var(--space-3)]" }}
        detail={
          <>
            <ScoreIcon
              className={cn("h-[var(--space-4)] w-[var(--space-4)]", scoreIconCls)}
            />
            <span>{msg}</span>
          </>
        }
      />
      {focusOn && typeof focus === "number" && focusMsg && (
        <div className="mt-[var(--space-4)] space-y-[var(--space-2)]">
          <div className="mb-[var(--space-2)] flex items-center gap-[var(--space-2)]" aria-label="Focus">
            <NeonIcon kind="brain" on={true} size="xl" staticGlow />
            <div className="h-[var(--hairline-w)] flex-1 bg-gradient-to-r from-foreground/20 via-foreground/5 to-transparent" />
          </div>
          <ScoreMeter
            value={focus}
            tone="focus"
            trackProps={{ className: "px-[var(--space-3)]" }}
            detail={<span>{focusMsg}</span>}
          />
        </div>
      )}
    </div>
  );
}
