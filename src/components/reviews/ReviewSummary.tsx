// src/components/reviews/ReviewSummary.tsx
"use client";
import "./style.css";

import * as React from "react";
import type { Review, Pillar, Role, ReviewMarker } from "@/lib/types";
import { cn } from "@/lib/utils";
import IconButton from "@/components/ui/primitives/IconButton";
import PillarBadge from "@/components/ui/league/pillars/PillarBadge"; // keep your existing path
import SectionLabel from "@/components/reviews/SectionLabel";
import { Pencil, FileText, Brain, Clock } from "lucide-react";
import {
  ROLE_OPTIONS,
  SCORE_POOLS,
  FOCUS_POOLS,
  pickIndex,
  scoreIcon,
} from "@/components/reviews/reviewData";


/** Static neon wrapper so badges look “selected” like in the editor */
function StaticNeonWrap({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-flex">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl 
                   bg-[linear-gradient(90deg,hsl(var(--accent)),hsl(var(--primary)))]
                   opacity-40 blur-[6px]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl 
                   ring-1 ring-[hsl(var(--ring)/.35)]"
      />
      <span className="relative z-10">{children}</span>
    </span>
  );
}

/* =========================================================
   NeonIcon
   ========================================================= */
function NeonIcon({
  kind,
  on,
  size = 36,
  className,
  title,
  staticGlow = false,
}: {
  kind: "clock" | "file" | "brain";
  on: boolean;
  size?: number;
  className?: string;
  title?: string;
  staticGlow?: boolean;
}) {
  const Icon = kind === "clock" ? Clock : kind === "brain" ? Brain : FileText;
  const colorVar = kind === "clock" ? "--accent" : kind === "brain" ? "--primary" : "--ring";
  const k = Math.round(size * 0.56);

  const prevOnRef = React.useRef<boolean>(on);
  const [phase, setPhase] = React.useState<"steady-on" | "ignite" | "off" | "powerdown">(
    on ? "steady-on" : "off"
  );

  React.useEffect(() => {
    if (staticGlow) {
      prevOnRef.current = on;
      setPhase(on ? "steady-on" : "off");
      return;
    }
    const prev = prevOnRef.current;
    if (on !== prev) {
      if (on) {
        setPhase("ignite");
        const id = setTimeout(() => setPhase("steady-on"), 620);
        prevOnRef.current = on;
        return () => clearTimeout(id);
      } else {
        setPhase("powerdown");
        const id = setTimeout(() => setPhase("off"), 360);
        prevOnRef.current = on;
        return () => clearTimeout(id);
      }
    }
    prevOnRef.current = on;
  }, [on, staticGlow]);

  const isLit = staticGlow ? on : phase === "ignite" || phase === "steady-on";
  const dimOpacity = isLit ? 1 : 0.35;

  return (
    <span
      className={cn(
        "relative inline-grid place-items-center overflow-visible rounded-full border",
        "border-[hsl(var(--border))] bg-[hsl(var(--card)/.35)]",
        className
      )}
      style={{ width: size, height: size }}
      aria-hidden
      title={title}
      data-phase={phase}
      data-kind={kind}
      data-static={staticGlow ? "true" : "false"}
    >
      {/* Base glyph */}
      <Icon
        className="relative z-10"
        style={{
          width: k,
          height: k,
          strokeWidth: 2,
          color: `hsl(var(${colorVar}))`,
          opacity: dimOpacity,
          transition: "opacity 220ms var(--ease-out), transform 220ms var(--ease-out)",
          transform:
            !staticGlow && phase === "ignite"
              ? "scale(1.02)"
              : !staticGlow && phase === "powerdown"
              ? "scale(0.985)"
              : "scale(1)",
        }}
      />
      {/* Tight glow */}
      <Icon
        className={cn("absolute", !staticGlow && isLit && "animate-[neonCore_2.8s_ease-in-out_infinite]")}
        style={{
          width: k,
          height: k,
          color: `hsl(var(${colorVar}))`,
          opacity: isLit ? (staticGlow ? 0.7 : 0.78) : 0.06,
          filter: `blur(2.5px) drop-shadow(0 0 12px hsl(var(${colorVar})))`,
          transition: "opacity 220ms var(--ease-out)",
        }}
      />
      {/* Wide aura */}
      <Icon
        className={cn("absolute", !staticGlow && isLit && "animate-[neonAura_3.6s_ease-in-out_infinite]")}
        style={{
          width: k,
          height: k,
          color: `hsl(var(${colorVar}))`,
          opacity: isLit ? (staticGlow ? 0.35 : 0.42) : 0.04,
          filter: `blur(7px) drop-shadow(0 0 22px hsl(var(${colorVar})))`,
          transition: "opacity 220ms var(--ease-out)",
        }}
      />
      {/* CRT film / scan */}
      <span
        className={cn(
          "pointer-events-none absolute inset-0 rounded-full mix-blend-overlay",
          !staticGlow && isLit ? "opacity-35 animate-[crtScan_2.1s_linear_infinite]" : isLit ? "opacity-20" : "opacity-0"
        )}
        style={{
          background:
            "repeating-linear-gradient(0deg, hsl(var(--foreground)/0.07) 0 1px, transparent 1px 3px)",
          transition: "opacity 220ms var(--ease-out)",
        }}
      />
      {/* Ignite/powerdown overlays only in animated mode */}
      {!staticGlow && (
        <>
          <span
            className={cn(
              "pointer-events-none absolute inset-0 rounded-full",
              phase === "ignite" && "animate-[igniteFlicker_.62s_steps(18,end)_1]"
            )}
            style={{
              background:
                "radial-gradient(80% 80% at 50% 50%, hsl(var(--foreground)/0.25), transparent 60%)",
              mixBlendMode: "screen",
              opacity: phase === "ignite" ? 0.85 : 0,
            }}
          />
          <span
            className={cn(
              "pointer-events-none absolute inset-0 rounded-full",
              phase === "powerdown" && "animate-[powerDown_.36s_linear_1]"
            )}
            style={{
              background:
                "radial-gradient(120% 120% at 50% 50%, hsl(var(--foreground)/0.16), transparent 60%)",
              mixBlendMode: "screen",
              opacity: phase === "powerdown" ? 0.6 : 0,
            }}
          />
        </>
      )}

      {/* keyframes (scoped) */}
      <style jsx>{`
        @keyframes neonCore {
          0% { opacity: .66; transform: scale(1) }
          50%{ opacity: .88; transform: scale(1.012) }
          100%{ opacity: .66; transform: scale(1) }
        }
        @keyframes neonAura {
          0% { opacity: .32 }
          50%{ opacity: .52 }
          100%{ opacity: .32 }
        }
        @keyframes crtScan {
          0% { transform: translateY(-28%) }
          100%{ transform: translateY(28%) }
        }
        @keyframes igniteFlicker {
          0%{ opacity:.1; filter:blur(.6px) }
          8%{ opacity:1 }
          12%{ opacity:.25 }
          20%{ opacity:1 }
          28%{ opacity:.35 }
          40%{ opacity:1 }
          55%{ opacity:.45; filter:blur(.2px) }
          70%{ opacity:1 }
          100%{ opacity:0 }
        }
        @keyframes powerDown {
          0%{ opacity:.8; transform:scale(1) }
          30%{ opacity:.35; transform:scale(.992) translateY(.2px) }
          60%{ opacity:.12; transform:scale(.985) translateY(-.2px) }
          100%{ opacity:0; transform:scale(.985) }
        }
      `}</style>
    </span>
  );
}

type Props = {
  review: Review;
  onEdit?: () => void;
  className?: string;
};

export default function ReviewSummary({ review, onEdit, className }: Props) {
  const role: Role | undefined = review.role as Role | undefined;
  const result: "Win" | "Loss" | undefined = review.result;
  const score = Number(review.score ?? NaN);

  const focusOn: boolean = Boolean(review.focusOn);
  const focus = Number.isFinite(review.focus) ? Number(review.focus) : 5;

  const markers: ReviewMarker[] = Array.isArray(review.markers) ? review.markers : [];

  const laneTitle = review.lane ?? review.title ?? "";
  const opponent = review.opponent ?? "";

  // Score copy
  const msgIndex = pickIndex(String(review.id ?? "seed") + (Number.isFinite(score) ? score : 5), 5);
  const pool = SCORE_POOLS[Number.isFinite(score) ? score : 5];
  const msg = pool[msgIndex];
  const { Icon: ScoreIcon, cls: scoreIconCls } = scoreIcon(Number.isFinite(score) ? score : 5);

  // Focus copy
  const focusMsgIndex = pickIndex(String(review.id ?? "seed-focus") + focus, 10);
  const focusMsg = (FOCUS_POOLS[focus] ?? FOCUS_POOLS[5])[focusMsgIndex % 10];

  const RoleIcon = role ? ROLE_OPTIONS.find((r) => r.value === role)?.Icon : undefined;
  const roleLabel = role ? ROLE_OPTIONS.find((r) => r.value === role)?.label : undefined;

  // Timestamps summary states for icons
  const hasAny = markers.length > 0;
  const hasTimed = hasAny && markers.some((m) => !m.noteOnly);
  const hasNoteOnly = hasAny && markers.every((m) => m.noteOnly);

  // Result badge (HEADER)
  const ResultBadge =
    result && (
      <span
        className={cn(
          "inline-flex h-10 items-center rounded-2xl border px-3 text-sm font-semibold",
          "border-[hsl(var(--border))] bg-[hsl(var(--card))]",
          result === "Win"
            ? "shadow-[0_0_0_1px_hsl(var(--ring)/.35)_inset] bg-[linear-gradient(90deg,hsla(160,90%,45%,.20),hsla(190,90%,60%,.16))]"
            : "bg-[linear-gradient(90deg,hsla(0,90%,55%,.18),hsla(320,90%,65%,.16))]"
        )}
        aria-label={`Result: ${result}`}
        title={`Result: ${result}`}
      >
        {result}
      </span>
    );

  return (
    <div className={cn("card-neo-soft r-card-lg overflow-hidden transition-none", className)}>
      {/* HEADER: title on the left; role + result + edit pinned to right edge */}
      <div className="section-h sticky">
        <div className="grid w-full grid-cols-[1fr_auto] items-center gap-4">
          {/* Left: Title */}
          <div className="min-w-0">
            <div className="mb-0.5 text-xs text-[hsl(var(--foreground)/0.25)]">Title</div>
            <div className="truncate text-lg font-medium leading-7 text-[hsl(var(--foreground)/0.7)]">
              {laneTitle || "Untitled review"}
            </div>
          </div>

          {/* Right: Role chip, Result badge, Edit IconButton — perfectly aligned */}
          <div className="flex items-center justify-end gap-2">
            {role ? (
              <span
                className={cn(
                  "inline-flex h-10 items-center gap-1.5 rounded-2xl border border-[hsl(var(--border))]",
                  "bg-[hsl(var(--card))] px-3 text-sm font-semibold"
                )}
                title={roleLabel}
              >
                {RoleIcon ? <RoleIcon className="h-5 w-5" /> : null}
                {roleLabel}
              </span>
            ) : null}

            {ResultBadge}

            {onEdit ? (
              <IconButton
                aria-label="Edit review"
                title="Edit review"
                size="md"   // ~h-10
                iconSize="md"
                variant="ring"   // non-destructive, quiet
                onClick={onEdit}
              >
                <Pencil />
              </IconButton>
            ) : null}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="section-b ds-card-pad space-y-6">
        {/* Lane */}
        <div>
          <SectionLabel>Lane</SectionLabel>
          <div className="flex h-10 items-center rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-sm">
            <span className="truncate">{laneTitle || "—"}</span>
          </div>
        </div>

        {/* Opponent */}
        <div>
          <SectionLabel>Opponent</SectionLabel>
          <div className="flex h-10 items-center rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-sm">
            <span className="truncate">{opponent || "—"}</span>
          </div>
        </div>

        {/* Score */}
        <div>
          <SectionLabel>Score</SectionLabel>
          <div className="relative h-12 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4">
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2">
              <div className="relative h-2 w-full rounded-full bg-[hsl(var(--muted))] shadow-[inset_2px_2px_4px_hsl(var(--shadow-color)/0.45),inset_-2px_-2px_4px_hsl(var(--foreground)/0.06)]">
                <div
                  className="absolute left-0 top-0 h-2 rounded-full shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                  style={{
                    width: `calc(${(Number.isFinite(score) ? score : 5) * 10}% + 10px)`,
                    background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))",
                  }}
                />
                <div
                  className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[0_10px_25px_hsl(var(--shadow-color)/.25)]"
                  style={{ left: `calc(${(Number.isFinite(score) ? score : 5) * 10}% - 10px)` }}
                />
              </div>
            </div>
          </div>
          <div className="mt-1 flex items-center gap-2 text-[13px] text-muted-foreground">
            <span className="pill h-6 px-2 text-xs">{Number.isFinite(score) ? score : 5}/10</span>
            <ScoreIcon className={cn("h-4 w-4", scoreIconCls)} />
            <span>{msg}</span>
          </div>

          {/* Focus */}
          {focusOn && (
            <div className="mt-4 space-y-1.5">
              <div className="mb-2 flex items-center gap-2" aria-label="Focus">
                <NeonIcon kind="brain" on={true} size={32} staticGlow />
                <div className="h-px flex-1 bg-gradient-to-r from-[hsl(var(--foreground)/0.20)] via-[hsl(var(--foreground)/0.05)] to-transparent" />
              </div>

              <div className="relative h-12 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4">
                <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2">
              <div className="relative h-2 w-full rounded-full bg-[hsl(var(--muted))] shadow-[inset_2px_2px_4px_hsl(var(--shadow-color)/0.45),inset_-2px_-2px_4px_hsl(var(--foreground)/0.06)]">
                <div
                  className="absolute left-0 top-0 h-2 rounded-full shadow-[0_0_8px_hsl(var(--accent)/0.5)]"
                  style={{
                    width: `calc(${(focus / 10) * 100}% + 10px)`,
                    background:
                      "linear-gradient(90deg, hsl(var(--accent)), hsl(var(--primary)))",
                  }}
                />
                <div
                  className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[0_10px_25px_hsl(var(--shadow-color)/.25)]"
                  style={{ left: `calc(${(focus / 10) * 100}% - 10px)` }}
                />
              </div>
                </div>
              </div>
              <div className="mt-1 flex items-center gap-2 text-[13px] text-muted-foreground">
                <span className="pill h-6 px-2 text-xs">{focus}/10</span>
                <span>{focusMsg}</span>
              </div>
            </div>
          )}
        </div>

        {/* Pillars */}
        <div>
          <SectionLabel>Pillars</SectionLabel>
          {Array.isArray(review.pillars) && review.pillars.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {(review.pillars as Pillar[]).map((p) => (
                <StaticNeonWrap key={p}>
                  <PillarBadge pillar={p} size="md" active />
                </StaticNeonWrap>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No pillars selected.</div>
          )}
        </div>

        {/* Timestamps */}
        <div>
          <div className="mb-2 flex items-center gap-2" aria-label="Timestamps">
            <NeonIcon kind="clock" on={!!hasTimed} size={32} staticGlow />
            <NeonIcon kind="file" on={!!hasNoteOnly} size={32} staticGlow />
            <div className="h-px flex-1 bg-gradient-to-r from-[hsl(var(--foreground)/0.20)] via-[hsl(var(--foreground)/0.05)] to-transparent" />
          </div>

          {!markers.length ? (
            <div className="text-sm text-muted-foreground">No timestamps yet.</div>
          ) : (
            <ul className="space-y-2">
              {[...markers]
                .sort((a, b) => a.seconds - b.seconds)
                .map((m) => (
                  <li
                    key={m.id}
                    className="grid grid-cols-[auto_1fr] items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2"
                  >
                    {m.noteOnly ? (
                      <span
                        className="pill flex h-7 w-[56px] items-center justify-center px-0"
                        title="Note"
                        aria-label="Note"
                      >
                        <FileText size={14} className="opacity-80" />
                      </span>
                    ) : (
                      <span className="pill h-7 px-3 text-[11px] font-mono tabular-nums leading-none">
                        {m.time ?? "00:00"}
                      </span>
                    )}
                    <span className="truncate text-sm">{m.note || "—"}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* Notes */}
        {review.notes ? (
          <div>
            <SectionLabel>Notes</SectionLabel>
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 text-sm leading-6 text-[hsl(var(--foreground)/0.7)]">
              {review.notes}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
