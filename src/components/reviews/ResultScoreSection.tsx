"use client";

import * as React from "react";
import { SectionLabel } from "@/components/reviews/SectionLabel";
import { cn } from "@/lib/utils";
import type { Review } from "@/lib/types";
import { SCORE_POOLS, pickIndex, scoreIcon } from "@/components/reviews/reviewData";
import { RangeSlider as ScoreSlider } from "@/components/ui/primitives/RangeSlider";
import { Toggle as ToggleButton } from "@/components/ui/toggles/Toggle";

export type ResultScoreSectionHandle = {
  save: () => void;
  focusResult: () => void;
};

type Result = "Win" | "Loss";

type ResultScoreSectionProps = {
  result?: Result;
  score?: number;
  commitMeta: (patch: Partial<Review>) => void;
  onScoreEnter?: () => void;
};

function ResultScoreSection(
  {
    result: result0 = "Win",
    score: score0 = 5,
    commitMeta,
    onScoreEnter,
  }: ResultScoreSectionProps,
  ref: React.Ref<ResultScoreSectionHandle>,
) {
  const [result, setResult] = React.useState<Result>(result0);
  const [score, setScore] = React.useState<number>(score0);
  const resultRef = React.useRef<HTMLButtonElement>(null);
  const scoreRangeRef = React.useRef<HTMLInputElement>(null);
  const resultLabelId = React.useId();
  const scoreLabelId = React.useId();

  React.useEffect(() => {
    setResult(result0);
  }, [result0]);

  React.useEffect(() => {
    setScore(score0);
  }, [score0]);

  const save = React.useCallback(() => {
    commitMeta({ result, score });
  }, [result, score, commitMeta]);

  React.useImperativeHandle(
    ref,
    () => ({
      save,
      focusResult: () => resultRef.current?.focus(),
    }),
    [save],
  );

  const msgIndex = pickIndex(String(score), 5);
  const pool = SCORE_POOLS[score] ?? SCORE_POOLS[5];
  const msg = pool[msgIndex];
  const { Icon: ScoreIcon, cls: scoreIconCls } = scoreIcon(score);
  return (
    <>
      <div>
        <SectionLabel id={resultLabelId}>Result</SectionLabel>
        <ToggleButton
          ref={resultRef}
          ariaLabelledBy={resultLabelId}
          leftLabel="Win"
          rightLabel="Loss"
          value={result === "Win" ? "Left" : "Right"}
          onChange={(value) => {
            const next = value === "Left" ? "Win" : "Loss";
            setResult(next);
            commitMeta({ result: next });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              scoreRangeRef.current?.focus();
            }
          }}
          className="w-full max-w-[calc(var(--space-8)*4)]"
          aria-label="Toggle Win or Loss"
        />
      </div>

      <div className="space-y-[var(--space-2)]">
        <SectionLabel id={scoreLabelId}>Score</SectionLabel>
        <ScoreSlider
          ref={scoreRangeRef}
          min={0}
          max={10}
          step={1}
          value={score}
          aria-labelledby={scoreLabelId}
          aria-label="Score from 0 to 10"
          controlClassName="rounded-card r-card-lg"
          trackClassName="cursor-pointer"
          onChange={(e) => {
            const v = Number(e.target.value);
            setScore(v);
            commitMeta({ score: v });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onScoreEnter?.();
            }
          }}
        />
        <div className="flex items-center gap-[var(--space-2)] text-ui text-muted-foreground" aria-live="polite">
          <ScoreIcon className={cn("h-[var(--space-4)] w-[var(--space-4)]", scoreIconCls)} />
          <span>{msg}</span>
        </div>
      </div>
    </>
  );
}

const ResultScoreSectionComponent = React.forwardRef<
  ResultScoreSectionHandle,
  ResultScoreSectionProps
>(ResultScoreSection)

ResultScoreSectionComponent.displayName = "ResultScoreSection"

export { ResultScoreSectionComponent as ResultScoreSection }
