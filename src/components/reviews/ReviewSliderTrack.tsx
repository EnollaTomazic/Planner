import { cn } from "@/lib/utils";
import * as React from "react";

import styles from "./ReviewSliderTrack.module.css";

export type ReviewSliderTone = "score" | "focus";
export type ReviewSliderVariant = "input" | "display";

type ReviewSliderTrackProps = {
  value: number;
  tone?: ReviewSliderTone;
  variant?: ReviewSliderVariant;
  className?: string;
  trackClassName?: string;
  fillClassName?: string;
  knobClassName?: string;
  glitch?: boolean;
};

const toneTokenClassNames: Record<ReviewSliderTone, string> = {
  score:
    "[--slider-fill-tint:hsl(var(--accent)/0.35)] [--slider-fill-tint-hover:hsl(var(--accent)/0.45)] [--slider-fill-tint-active:hsl(var(--accent)/0.55)] [--slider-focus-ring:var(--ring-contrast)] [--slider-knob-hover-surface:hsl(var(--accent)/0.28)] [--slider-knob-active-surface:hsl(var(--accent)/0.36)] [--slider-knob-focus-ring:var(--ring-contrast)]",
  focus:
    "[--slider-fill-tint:hsl(var(--focus)/0.35)] [--slider-fill-tint-hover:hsl(var(--focus)/0.45)] [--slider-fill-tint-active:hsl(var(--focus)/0.55)] [--slider-focus-ring:var(--ring-contrast)] [--slider-knob-hover-surface:hsl(var(--focus)/0.3)] [--slider-knob-active-surface:hsl(var(--focus)/0.4)] [--slider-knob-focus-ring:var(--ring-contrast)]",
};

const knobSizeByVariant: Record<ReviewSliderVariant, string> = {
  display: "h-[calc(var(--space-4)+var(--space-1))] w-[calc(var(--space-4)+var(--space-1))] -translate-x-1/2",
  input:
    "h-[calc(var(--space-4)+var(--space-1))] w-[calc(var(--space-4)+var(--space-1))]",
};

const ReviewSliderTrack = ({
  value,
  tone = "score",
  variant = "input",
  className,
  trackClassName,
  fillClassName,
  knobClassName,
  glitch = false,
}: ReviewSliderTrackProps) => {
  const clamped = Math.round(Math.min(10, Math.max(0, value)));
  const isInteractive = variant === "input";

  return (
    <div
      className={cn(
        "group/slider absolute left-[var(--space-4)] right-[var(--space-4)] top-1/2 -translate-y-1/2",
        "[--slider-fill-background:var(--edge-iris)]",
        glitch && styles.glitch,
        toneTokenClassNames[tone],
        styles.root,
        className,
      )}
      data-tone={tone}
      data-variant={variant}
      data-value={clamped}
      data-glitch={glitch ? "true" : undefined}
    >
      <div
        className={cn(
          "relative h-[var(--space-2)] w-full overflow-hidden rounded-full bg-muted shadow-[var(--slider-track-shadow)]",
          "before:pointer-events-none before:absolute before:inset-0 before:rounded-full before:bg-[var(--card-overlay-scanlines)] before:opacity-0 before:transition-opacity before:duration-motion-sm before:ease-out",
          isInteractive
            ? "group-hover/slider:before:opacity-70 group-active/slider:before:opacity-90 group-focus-visible/slider:before:opacity-80"
            : undefined,
          trackClassName,
        )}
      >
        <div
          className={cn(
            "absolute left-0 top-0 h-[var(--space-2)] rounded-full [background:var(--slider-fill-background)] shadow-[var(--slider-fill-shadow)]",
            "after:pointer-events-none after:absolute after:inset-0 after:rounded-full after:bg-[--slider-fill-tint] after:opacity-80 after:transition-colors after:duration-motion-sm after:ease-out",
            variant === "display" ? "progress-fill" : undefined,
            styles.fill,
            isInteractive &&
              cn(
                "ring-1 ring-transparent transition-[box-shadow,opacity] duration-motion-sm ease-out",
                "group-hover/slider:[--slider-fill-shadow:var(--slider-fill-shadow-hover)] group-active/slider:[--slider-fill-shadow:var(--slider-fill-shadow-active)]",
                "group-hover/slider:after:bg-[--slider-fill-tint-hover] group-active/slider:after:bg-[--slider-fill-tint-active]",
                "group-focus-visible/slider:ring-[var(--slider-focus-ring)]",
              ),
            fillClassName,
          )}
        />
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 rounded-full border border-border bg-card shadow-[var(--slider-knob-shadow)]",
            knobSizeByVariant[variant],
            styles.knob,
            isInteractive &&
              cn(
                "transition-[background-color,border-color,box-shadow] duration-motion-sm ease-out",
                "group-hover/slider:bg-[--slider-knob-hover-surface] group-active/slider:bg-[--slider-knob-active-surface] group-hover/slider:border-transparent group-active/slider:border-transparent",
                "group-hover/slider:[--slider-knob-shadow:var(--slider-knob-shadow-hover)] group-active/slider:[--slider-knob-shadow:var(--slider-knob-shadow-active)]",
                "group-focus-visible/slider:ring-2 group-focus-visible/slider:ring-[var(--slider-knob-focus-ring)] group-focus-visible/slider:shadow-[var(--slider-knob-shadow-active)]",
              ),
            knobClassName,
          )}
        />
      </div>
    </div>
  );
};

export default ReviewSliderTrack;
