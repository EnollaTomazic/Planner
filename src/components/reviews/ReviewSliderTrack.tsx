import * as React from "react";
import { cn } from "@/lib/utils";

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
};

const gradientClassNames: Record<ReviewSliderTone, string> = {
  score: "bg-gradient-to-r from-primary to-accent [--ring:var(--primary)]",
  focus: "bg-gradient-to-r from-accent to-primary [--ring:var(--accent)]",
};

const knobSizeByVariant: Record<ReviewSliderVariant, string> = {
  display:
    "left-[var(--progress)] h-[calc(var(--space-4)+var(--space-1))] w-[calc(var(--space-4)+var(--space-1))] -translate-x-1/2",
  input: "h-5 w-5",
};

const fillInteractionClassNames: Record<ReviewSliderTone, string> = {
  score:
    "group-hover:ring-[theme('colors.interaction.accent.tintHover')] group-active:ring-[theme('colors.interaction.accent.tintActive')]",
  focus:
    "group-hover:ring-[theme('colors.interaction.focus.tintHover')] group-active:ring-[theme('colors.interaction.focus.tintActive')]",
};

const knobInteractionClassNames: Record<ReviewSliderTone, string> = {
  score:
    "group-hover:bg-[theme('colors.interaction.accent.surfaceHover')] group-active:bg-[theme('colors.interaction.accent.surfaceActive')] group-hover:border-transparent group-active:border-transparent group-hover:shadow-control-hover group-active:shadow-control",
  focus:
    "group-hover:bg-[theme('colors.interaction.focus.surfaceHover')] group-active:bg-[theme('colors.interaction.focus.surfaceActive')] group-hover:border-transparent group-active:border-transparent group-hover:shadow-control-hover group-active:shadow-control",
};

const ReviewSliderTrack = ({
  value,
  tone = "score",
  variant = "input",
  className,
  trackClassName,
  fillClassName,
  knobClassName,
}: ReviewSliderTrackProps) => {
  const clamped = Math.min(10, Math.max(0, value));
  const percent = (clamped / 10) * 100;
  const isInteractive = variant === "input";

  const sliderStyle =
    variant === "display"
      ? ({ "--progress": `${percent}%` } as React.CSSProperties)
      : undefined;

  const fillStyle =
    variant === "input"
      ? ({
          width: `calc(${percent}% + var(--space-2) + var(--space-1) / 2)`,
        } as React.CSSProperties)
      : undefined;

  const knobStyle =
    variant === "input"
      ? ({
          left: `calc(${percent}% - (var(--space-2) + var(--space-1) / 2))`,
        } as React.CSSProperties)
      : undefined;

  return (
    <div
      className={cn(
        "absolute left-[var(--space-4)] right-[var(--space-4)] top-1/2 -translate-y-1/2",
        className,
      )}
      style={sliderStyle}
    >
      <div
        className={cn(
          "relative h-2 w-full rounded-full bg-muted shadow-neo-inset",
          trackClassName,
        )}
      >
        <div
          className={cn(
            "absolute left-0 top-0 h-2 rounded-full shadow-ring",
            gradientClassNames[tone],
            variant === "display" ? "w-[var(--progress)]" : undefined,
            isInteractive &&
              cn(
                "ring-1 ring-transparent transition-[box-shadow] duration-[var(--dur-quick)] ease-out",
                fillInteractionClassNames[tone],
              ),
            fillClassName,
          )}
          style={fillStyle}
        />
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 rounded-full border border-border bg-card shadow-neoSoft",
            knobSizeByVariant[variant],
            isInteractive &&
              cn(
                "transition-[background-color,border-color,box-shadow] duration-[var(--dur-quick)] ease-out",
                knobInteractionClassNames[tone],
              ),
            knobClassName,
          )}
          style={knobStyle}
        />
      </div>
    </div>
  );
};

export default ReviewSliderTrack;
