// src/components/ui/NeonIcon.tsx
"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import styles from "./NeonIcon.module.css";

type Phase = "steady-on" | "ignite" | "off" | "powerdown";
type NeonIconSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
type NeonIconTone = "accent" | "primary" | "ring" | "success" | "warning" | "danger" | "info";

type NeonIconProps = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  on: boolean;
  size?: NeonIconSize;
  /** CSS variable name like "--accent", "--primary", "--ring" */
  colorVar?: string;
  /** Preferred tone shorthand; overrides colorVar when provided. */
  tone?: NeonIconTone;
  title?: string;
  className?: string;
  /** toggle CRT scanlines layer */
  scanlines?: boolean;
  /** toggle wide aura layer */
  aura?: boolean;
} & Omit<React.HTMLAttributes<HTMLSpanElement>, "children" | "color">;

const TONE_SET = new Set<NeonIconTone>([
  "accent",
  "primary",
  "ring",
  "success",
  "warning",
  "danger",
  "info",
]);

const toTone = (tone?: NeonIconTone, colorVar?: string): NeonIconTone => {
  if (tone && TONE_SET.has(tone)) return tone;
  if (colorVar) {
    const normalized = colorVar.startsWith("--") ? colorVar.slice(2) : colorVar;
    if (TONE_SET.has(normalized as NeonIconTone)) {
      return normalized as NeonIconTone;
    }
  }
  return "accent";
};

export function NeonIcon({
  icon: Icon,
  on,
  size = "md",
  colorVar = "--accent",
  tone,
  title,
  className,
  scanlines = true,
  aura = true,
  ...rest
}: NeonIconProps) {
  const prev = React.useRef(on);
  const [phase, setPhase] = React.useState<Phase>(on ? "steady-on" : "off");

  React.useEffect(() => {
    if (on !== prev.current) {
      if (on) {
        setPhase("ignite");
        const t = setTimeout(() => setPhase("steady-on"), 620);
        prev.current = on;
        return () => clearTimeout(t);
      } else {
        setPhase("powerdown");
        const t = setTimeout(() => setPhase("off"), 360);
        prev.current = on;
        return () => clearTimeout(t);
      }
    }
    prev.current = on;
  }, [on]);

  const lit = phase === "ignite" || phase === "steady-on";
  const toneAttr = toTone(tone, colorVar);

  return (
    <span
      className={cn(
        styles.root,
        "relative inline-grid place-items-center overflow-visible rounded-full border border-border bg-card/35",
        className,
      )}
      data-phase={phase}
      data-size={size}
      data-tone={toneAttr}
      aria-hidden
      title={title}
      {...rest}
    >
      {/* Base glyph */}
      <Icon
        className={styles.icon}
        width="100%"
        height="100%"
        strokeWidth="var(--icon-stroke-100, 2)"
        aria-hidden
      />

      {/* Tight glow */}
      <Icon
        className={cn(styles.core, "absolute", lit && styles.coreAnimated)}
        aria-hidden
      />

      {/* Wide aura (optional) */}
      {aura && (
        <Icon
          className={cn(styles.aura, "absolute", lit && styles.auraAnimated)}
          aria-hidden
        />
      )}

      {/* CRT scanlines (optional) */}
      {scanlines && (
        <span
          className={cn(styles.scanlines, "rounded-full", lit && styles.scanlinesAnimated)}
          aria-hidden
        />
      )}

      {/* One-shot overlays */}
      <span
        className={cn(styles.ignite, phase === "ignite" && styles.igniteAnimated)}
        aria-hidden
      />
      <span
        className={cn(styles.powerdown, phase === "powerdown" && styles.powerdownAnimated)}
        aria-hidden
      />
    </span>
  );
}

export function NeonGlowWrap({ lit, children }: { lit: boolean; children: React.ReactNode }) {
  return (
    <span className={cn(styles.wrap, lit && styles.wrapLit)}>
      <span className={styles.glowPrimary} aria-hidden />
      <span className={cn(styles.glowAura, lit && styles.auraAnimated)} aria-hidden />
      <span className={styles.content}>{children}</span>
    </span>
  );
}

export type { NeonIconSize, NeonIconTone };
