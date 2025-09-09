"use client";

import * as React from "react";
import SectionLabel from "@/components/reviews/SectionLabel";
import RoleSelector from "@/components/reviews/RoleSelector";
import NeonIcon from "@/components/reviews/NeonIcon";
import Input from "@/components/ui/primitives/Input";
import IconButton from "@/components/ui/primitives/IconButton";
import PillarBadge from "@/components/ui/league/pillars/PillarBadge";
import { Target, Shield, Trash2, Check } from "lucide-react";
import { ALL_PILLARS } from "@/components/reviews/reviewData";
import { cn } from "@/lib/utils";
import type { Pillar, Role } from "@/lib/types";
import type { Marker } from "./ReviewMarkerEditor";

const NeonPillarChip = ({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) => {
  const prev = React.useRef(active);
  const [phase, setPhase] = React.useState<"steady-on" | "ignite" | "off" | "powerdown">(
    active ? "steady-on" : "off",
  );

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
          lit ? "opacity-40 animate-[neonAura_3.6s_ease-in-out_infinite]" : "opacity-0",
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
};

export type Result = "Win" | "Loss";
export type MetaPatch = Partial<{
  lane: string;
  opponent: string;
  pillars: Pillar[];
  result: Result;
  score: number;
  role: Role;
  focusOn: boolean;
  focus: number;
  markers: Marker[];
}>;

export default function ReviewMetaControls({
  lane,
  setLane,
  laneRef,
  commitLaneAndTitle,
  opponent,
  setOpponent,
  opponentRef,
  commitMeta,
  role,
  selectRole,
  pillars,
  togglePillar,
  result,
  setResult,
  resultRef,
  score,
  setScore,
  scoreRangeRef,
  msg,
  ScoreIcon,
  scoreIconCls,
  focusOn,
  setFocusOn,
  focus,
  setFocus,
  focusRangeRef,
  focusMsg,
  onDelete,
  onDone,
  saveAll,
}: {
  lane: string;
  setLane: (v: string) => void;
  laneRef: React.RefObject<HTMLInputElement>;
  commitLaneAndTitle: () => void;
  opponent: string;
  setOpponent: (v: string) => void;
  opponentRef: React.RefObject<HTMLInputElement>;
  commitMeta: (p: MetaPatch) => void;
  role: Role;
  selectRole: (r: Role) => void;
  pillars: Pillar[];
  togglePillar: (p: Pillar) => void;
  result: Result;
  setResult: React.Dispatch<React.SetStateAction<Result>>;
  resultRef: React.RefObject<HTMLButtonElement>;
  score: number;
  setScore: (n: number) => void;
  scoreRangeRef: React.RefObject<HTMLInputElement>;
  msg: string;
  ScoreIcon: React.ComponentType<{ className?: string }>;
  scoreIconCls: string;
  focusOn: boolean;
  setFocusOn: (v: boolean) => void;
  focus: number;
  setFocus: (n: number) => void;
  focusRangeRef: React.RefObject<HTMLInputElement>;
  focusMsg: string;
  onDelete?: () => void;
  onDone?: () => void;
  saveAll: () => void;
}) {
  const go = (ref: React.RefObject<HTMLElement>) => ref.current?.focus();
  function onIconKey(e: React.KeyboardEvent, handler: () => void) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handler();
    }
  }

  return (
    <>
      <div className="section-h sticky">
        <div className="grid w-full grid-cols-[1fr_auto] items-center gap-4">
          <div className="min-w-0">
            <div className="mb-2">
              <SectionLabel>Lane</SectionLabel>
              <RoleSelector value={role} onChange={selectRole} />
            </div>
            <div className="mb-2">
              <div className="relative">
                <Target className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={laneRef}
                  value={lane}
                  onChange={(e) => setLane(e.target.value)}
                  onBlur={commitLaneAndTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitLaneAndTitle();
                      go(opponentRef);
                    }
                  }}
                  className="pl-6"
                  placeholder="Ashe/Lulu"
                  aria-label="Lane (used as Title)"
                />
              </div>
            </div>
            <div>
              <SectionLabel>Opponent</SectionLabel>
              <div className="relative">
                <Shield className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={opponentRef}
                  value={opponent}
                  onChange={(e) => setOpponent(e.target.value)}
                  onBlur={() => commitMeta({ opponent })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      go(resultRef);
                    }
                  }}
                  placeholder="Draven/Thresh"
                  className="pl-6"
                  aria-label="Opponent"
                />
              </div>
            </div>
          </div>
          <div className="ml-2 flex shrink-0 items-center justify-end gap-2 self-start">
            {onDelete ? (
              <IconButton
                aria-label="Delete review"
                title="Delete review"
                size="md"
                iconSize="md"
                variant="ring"
                onClick={onDelete}
              >
                <Trash2 />
              </IconButton>
            ) : null}

            {onDone ? (
              <IconButton
                aria-label="Done"
                title="Save and close"
                size="md"
                iconSize="md"
                variant="ring"
                onClick={() => {
                  saveAll();
                  onDone?.();
                }}
              >
                <Check />
              </IconButton>
            ) : null}
          </div>
        </div>
      </div>

      <div className="section-b ds-card-pad space-y-6">
        <div>
          <SectionLabel>Result</SectionLabel>
          <button
            ref={resultRef}
            type="button"
            role="switch"
            aria-checked={result === "Win"}
            onClick={() => setResult((p) => (p === "Win" ? "Loss" : "Win"))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setResult((p) => (p === "Win" ? "Loss" : "Win"));
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
                setScore(v);
                commitMeta({ score: v });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  go(focusRangeRef);
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
            <span>{msg}</span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={focusOn ? "Brain light on" : "Brain light off"}
              aria-pressed={focusOn}
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => {
                const v = !focusOn;
                setFocusOn(v);
                commitMeta({ focusOn: v });
                if (v) focusRangeRef.current?.focus();
              }}
              onKeyDown={(e) =>
                onIconKey(e, () => {
                  const v = !focusOn;
                  setFocusOn(v);
                  commitMeta({ focusOn: v });
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
                    setFocus(v);
                    commitMeta({ focus: v });
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
      </div>
    </>
  );
}
