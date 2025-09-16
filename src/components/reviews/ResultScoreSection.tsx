import * as React from "react";
import SectionLabel from "@/components/reviews/SectionLabel";
import { cn } from "@/lib/utils";
import type { Review } from "@/lib/types";
import { SCORE_POOLS, pickIndex, scoreIcon } from "@/components/reviews/reviewData";

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
  const isWin = result === "Win";
  const indicatorGradientClass = isWin
    ? "from-success/30 to-accent/28"
    : "from-danger/30 to-primary/26";
  const indicatorStyle = React.useMemo<React.CSSProperties>(
    () => ({
      width: "calc(50% - var(--space-1))",
      transform: `translate3d(${isWin ? "0" : "calc(100% + var(--space-1) / 2)"},0,0)`,
      transitionTimingFunction: "cubic-bezier(.22,1,.36,1)",
      "--glow-active": "hsl(var(--shadow-color) / 0.25)",
    }),
    [isWin],
  );

  return (
    <>
      <div>
        <SectionLabel>Result</SectionLabel>
        <button
          ref={resultRef}
          type="button"
          role="switch"
          aria-checked={result === "Win"}
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
            "relative inline-flex h-10 w-48 select-none items-center overflow-hidden rounded-card r-card-lg",
            "border border-border bg-card",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
          title="Toggle Win/Loss"
        >
          <span
            aria-hidden
            className={
              cn(
                "absolute top-1 bottom-1 left-1 rounded-xl bg-gradient-to-r shadow-glow-md transition-transform duration-300",
                indicatorGradientClass,
              )
            }
            style={indicatorStyle}
          />
          <div className="relative z-10 grid w-full grid-cols-2 text-ui font-mono">
            <div
              className={cn(
                "py-2 text-center",
                result === "Win" ? "text-foreground/70" : "text-muted-foreground",
              )}
            >
              Win
            </div>
            <div
              className={cn(
                "py-2 text-center",
                result === "Loss" ? "text-foreground/70" : "text-muted-foreground",
              )}
            >
              Loss
            </div>
          </div>
        </button>
      </div>

      <div>
        <SectionLabel>Score</SectionLabel>
        <div className="relative h-12 rounded-card r-card-lg border border-border bg-card px-4 focus-within:ring-2 focus-within:ring-ring">
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
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2">
            <div className="relative h-2 w-full rounded-full bg-muted shadow-neo-inset">
              <div
                className="absolute left-0 top-0 h-2 rounded-full bg-gradient-to-r from-primary to-accent shadow-ring [--ring:var(--primary)]"
                style={{ width: `calc(${(score / 10) * 100}% + var(--space-2) + var(--space-1) / 2)` }}
              />
              <div
                className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-border bg-card shadow-neoSoft"
                style={{ left: `calc(${(score / 10) * 100}% - (var(--space-2) + var(--space-1) / 2))` }}
              />
            </div>
          </div>
        </div>
        <div className="mt-1 flex items-center gap-2 text-ui text-muted-foreground">
          <span className="pill h-6 px-2 text-label">{score}/10</span>
          <ScoreIcon className={cn("h-4 w-4", scoreIconCls)} />
          <span>{msg}</span>
        </div>
      </div>
    </>
  );
}

export default React.forwardRef(ResultScoreSection);
