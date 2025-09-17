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
            fillClassName,
          )}
          style={fillStyle}
        />
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 rounded-full border border-border bg-card shadow-neoSoft",
            knobSizeByVariant[variant],
            knobClassName,
          )}
          style={knobStyle}
        />
      </div>
    </div>
  );
};

export default ReviewSliderTrack;
