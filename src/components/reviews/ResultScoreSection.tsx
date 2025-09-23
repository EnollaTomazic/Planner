import * as React from "react";
import SectionLabel from "@/components/reviews/SectionLabel";
import { cn } from "@/lib/utils";
import type { Review } from "@/lib/types";
import { SCORE_POOLS, pickIndex, scoreIcon } from "@/components/reviews/reviewData";
import ScoreMeter from "./ScoreMeter";

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

type ResultIndicatorStyle = React.CSSProperties & {
  "--result-indicator-gradient"?: string;
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
  const resultIndicatorStyle: ResultIndicatorStyle = {
    width: "calc(50% - var(--space-1))",
    transform: `translate3d(${result === "Win" ? "0" : "100%"},0,0)`,
    transitionTimingFunction: "cubic-bezier(.22,1,.36,1)",
    "--result-indicator-gradient":
      result === "Win"
        ? "var(--review-result-win-gradient)"
        : "var(--review-result-loss-gradient)",
  };

  return (
    <>
      <div>
        <SectionLabel id={resultLabelId}>Result</SectionLabel>
        <button
          ref={resultRef}
          type="button"
          role="switch"
          aria-checked={result === "Win"}
          aria-labelledby={resultLabelId}
          onClick={() => {
            const next = result === "Win" ? "Loss" : "Win";
            setResult(next);
            commitMeta({ result: next });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const next = result === "Win" ? "Loss" : "Win";
              setResult(next);
              commitMeta({ result: next });
              scoreRangeRef.current?.focus();
            }
          }}
          className={cn(
            "relative inline-flex h-[var(--control-h-md)] w-[calc(var(--space-8)*3)] select-none items-center overflow-hidden rounded-card r-card-lg",
            "border border-border bg-card",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
          title="Toggle Win/Loss"
        >
          <span
            aria-hidden
            className="absolute top-[var(--space-1)] bottom-[var(--space-1)] left-[var(--space-1)] rounded-[inherit] transition-transform duration-300 [background-image:var(--result-indicator-gradient)] shadow-[var(--shadow-neo-soft)]"
            style={resultIndicatorStyle}
          />
          <div className="relative z-10 grid w-full grid-cols-2 text-ui font-mono">
            <div
              className={cn(
                "py-[var(--space-2)] text-center",
                result === "Win" ? "text-foreground" : "text-muted-foreground",
              )}
            >
              Win
            </div>
            <div
              className={cn(
                "py-[var(--space-2)] text-center",
                result === "Loss" ? "text-foreground" : "text-muted-foreground",
              )}
            >
              Loss
            </div>
          </div>
        </button>
      </div>

      <ScoreMeter
        label="Score"
        value={score}
        tone="score"
        variant="input"
        surfaceProps={{ focusWithin: true }}
        control={
          <input
            ref={scoreRangeRef}
            type="range"
            min={0}
            max={10}
            step={1}
            value={score}
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
            className="absolute inset-0 z-10 cursor-pointer rounded-card r-card-lg opacity-0 [appearance:none]"
            aria-label="Score from 0 to 10"
          />
        }
        detail={
          <>
            <ScoreIcon className={cn("h-[var(--space-4)] w-[var(--space-4)]", scoreIconCls)} />
            <span>{msg}</span>
          </>
        }
      />
    </>
  );
}

export default React.forwardRef(ResultScoreSection);
