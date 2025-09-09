import * as React from "react";
import SectionLabel from "@/components/reviews/SectionLabel";
import NeonIcon from "@/components/reviews/NeonIcon";
import PillarBadge from "@/components/ui/league/pillars/PillarBadge";
import { ALL_PILLARS } from "@/components/reviews/reviewData";
import { cn } from "@/lib/utils";
import type { Pillar } from "@/lib/types";
import type { Result } from "@/components/reviews/utils";
import { onIconKey } from "@/components/reviews/utils";

function NeonPillarChip({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  const prev = React.useRef(active);
  const [phase, setPhase] = React.useState<
    "steady-on" | "ignite" | "off" | "powerdown"
  >(active ? "steady-on" : "off");

  React.useEffect(() => {
    if (active !== prev.current) {
      if (active) {
        setPhase("ignite");
        const t = setTimeout(() => setPhase("steady-on"), 620);
        prev.current = active;
        return () => clearTimeout(t);
      } else {
        setPhase("powerdown");
        const t = setTimeout(() => setPhase("off"), 360);
        prev.current = active;
        return () => clearTimeout(t);
      }
    }
    prev.current = active;
  }, [active]);

  const lit = phase === "ignite" || phase === "steady-on";

  return (
    <span className="relative inline-flex">
      <span
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl",
          lit ? "opacity-60" : "opacity-0",
        )}
        style={{
          filter: "blur(10px)",
          background:
            "radial-gradient(60% 60% at 50% 50%, hsl(var(--accent)/.45), transparent 70%)",
          transition: "opacity 220ms var(--ease-out)",
        }}
        aria-hidden
      />
      <span
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl",
          lit
            ? "opacity-40 animate-[neonAura_3.6s_ease-in-out_infinite]"
            : "opacity-0",
        )}
        style={{
          filter: "blur(14px)",
          background:
            "radial-gradient(80% 80% at 50% 50%, hsl(var(--primary)/.35), transparent 75%)",
          transition: "opacity 220ms var(--ease-out)",
        }}
        aria-hidden
      />
      <span
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl",
          lit ? "animate-[igniteFlicker_.62s_steps(18,end)_1]" : "",
        )}
        style={{
          background:
            "radial-gradient(80% 80% at 50% 50%, hsl(var(--foreground)/0.22), transparent 60%)",
          mixBlendMode: "screen",
          opacity: lit ? 0.8 : 0,
        }}
        aria-hidden
      />
      <span className="relative z-10">{children}</span>
    </span>
  );
}

export default function ReviewMetadata({
  result,
  onChangeResult,
  score,
  onChangeScore,
  focusOn,
  onToggleFocus,
  focus,
  onChangeFocus,
  pillars,
  togglePillar,
  scoreMsg,
  ScoreIcon,
  scoreIconCls,
  focusMsg,
  onScoreNext,
  resultRef,
}: {
  result: Result;
  onChangeResult: (r: Result) => void;
  score: number;
  onChangeScore: (v: number) => void;
  focusOn: boolean;
  onToggleFocus: (v: boolean) => void;
  focus: number;
  onChangeFocus: (v: number) => void;
  pillars: Pillar[];
  togglePillar: (p: Pillar) => void;
  scoreMsg: string;
  ScoreIcon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  scoreIconCls: string;
  focusMsg: string;
  onScoreNext?: () => void;
  resultRef: React.RefObject<HTMLButtonElement>;
}) {
  const scoreRangeRef = React.useRef<HTMLInputElement>(null);
  const focusRangeRef = React.useRef<HTMLInputElement>(null);

  const go = (ref: React.RefObject<HTMLElement>) => ref.current?.focus();

  return (
    <>
      {/* Result */}
      <div>
        <SectionLabel>Result</SectionLabel>
        <button
          ref={resultRef}
          type="button"
          role="switch"
          aria-checked={result === "Win"}
          onClick={() => onChangeResult(result === "Win" ? "Loss" : "Win")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onChangeResult(result === "Win" ? "Loss" : "Win");
              go(scoreRangeRef);
            }
          }}
          className={cn(
            "relative inline-flex h-10 w-48 select-none items-center overflow-hidden rounded-2xl",
            "border border-border bg-card",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
          title="Toggle Win/Loss"
        >
          <span
            aria-hidden
            className="absolute top-1 bottom-1 left-1 rounded-xl transition-transform duration-300"
            style={{
              width: "calc(50% - 4px)",
              transform: `translate3d(${result === "Win" ? "0" : "calc(100% + 2px)"},0,0)`,
              transitionTimingFunction: "cubic-bezier(.22,1,.36,1)",
              background:
                result === "Win"
                  ? "linear-gradient(90deg, hsl(var(--success)/0.32), hsl(var(--accent)/0.28))"
                  : "linear-gradient(90deg, hsl(var(--danger)/0.30), hsl(var(--primary)/0.26))",
              boxShadow: "0 10px 30px hsl(var(--shadow-color) / .25)",
            }}
          />
          <div className="relative z-10 grid w-full grid-cols-2 text-sm font-mono">
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

      {/* Score */}
      <div>
        <SectionLabel>Score</SectionLabel>
        <div className="relative h-12 rounded-2xl border border-border bg-card px-4">
          <input
            ref={scoreRangeRef}
            type="range"
            min={0}
            max={10}
            step={1}
            value={score}
            onChange={(e) => {
              const v = Number(e.target.value);
              onChangeScore(v);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onScoreNext?.();
              }
            }}
            className="absolute inset-0 z-10 cursor-pointer opacity-0 [appearance:none]"
            aria-label="Score from 0 to 10"
          />
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2">
            <div className="relative h-2 w-full rounded-full bg-muted shadow-[inset_2px_2px_4px_hsl(var(--shadow-color)/0.45),inset_-2px_-2px_4px_hsl(var(--foreground)/0.06)]">
              <div
                className="absolute left-0 top-0 h-2 rounded-full bg-gradient-to-r from-primary to-accent shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                style={{ width: `calc(${(score / 10) * 100}% + 10px)` }}
              />
              <div
                className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-border bg-card shadow-[0_10px_25px_hsl(var(--shadow-color)/.25)]"
                style={{ left: `calc(${(score / 10) * 100}% - 10px)` }}
              />
            </div>
          </div>
        </div>
        <div className="mt-1 flex items-center gap-2 text-[13px] text-muted-foreground">
          <span className="pill h-6 px-2 text-xs">{score}/10</span>
          <ScoreIcon className={cn("h-4 w-4", scoreIconCls)} />
          <span>{scoreMsg}</span>
        </div>
      </div>

      {/* Focus */}
      <div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={focusOn ? "Brain light on" : "Brain light off"}
            aria-pressed={focusOn}
            className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => {
              const v = !focusOn;
              onToggleFocus(v);
              if (v) focusRangeRef.current?.focus();
            }}
            onKeyDown={(e) =>
              onIconKey(e, () => {
                const v = !focusOn;
                onToggleFocus(v);
                if (v) focusRangeRef.current?.focus();
              })
            }
          >
            <NeonIcon kind="brain" on={focusOn} />
          </button>
        </div>

        {focusOn && (
          <>
            <div className="mt-3 relative h-12 rounded-2xl border border-border bg-card px-4">
              <input
                ref={focusRangeRef}
                type="range"
                min={0}
                max={10}
                step={1}
                value={focus}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  onChangeFocus(v);
                }}
                className="absolute inset-0 z-10 cursor-pointer opacity-0 [appearance:none]"
                aria-label="Focus from 0 to 10"
              />
              <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2">
                <div className="relative h-2 w-full rounded-full bg-muted shadow-[inset_2px_2px_4px_hsl(var(--shadow-color)/0.45),inset_-2px_-2px_4px_hsl(var(--foreground)/0.06)]">
                  <div
                    className="absolute left-0 top-0 h-2 rounded-full bg-gradient-to-r from-accent to-primary shadow-[0_0_8px_hsl(var(--accent)/0.5)]"
                    style={{ width: `calc(${(focus / 10) * 100}% + 10px)` }}
                  />
                  <div
                    className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-border bg-card shadow-[0_10px_25px_hsl(var(--shadow-color)/.25)]"
                    style={{ left: `calc(${(focus / 10) * 100}% - 10px)` }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-1 flex items-center gap-2 text-[13px] text-muted-foreground">
              <span className="pill h-6 px-2 text-xs">{focus}/10</span>
              <span>{focusMsg}</span>
            </div>
          </>
        )}
      </div>

      {/* Pillars */}
      <div>
        <SectionLabel>Pillars</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {ALL_PILLARS.map((p) => {
            const active = pillars.includes(p);
            return (
              <button
                key={p}
                type="button"
                onClick={() => togglePillar(p)}
                onKeyDown={(e) => onIconKey(e, () => togglePillar(p))}
                aria-pressed={active}
                className="rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                title={active ? `${p} selected` : `Select ${p}`}
              >
                <NeonPillarChip active={active}>
                  <PillarBadge pillar={p} size="md" interactive active={active} />
                </NeonPillarChip>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
