import * as React from "react";
import { cn } from "@/lib/utils";

type ScoreMeterTone = "primary" | "accent";

const toneFillClasses: Record<ScoreMeterTone, string> = {
  primary: "from-primary to-accent [--ring:var(--primary)]",
  accent: "from-accent to-primary [--ring:var(--accent)]",
};

export type ScoreMeterProps = {
  value: number;
  max?: number;
  label?: string;
  tone?: ScoreMeterTone;
  trackClassName?: string;
  fillClassName?: string;
  handleClassName?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "children">;

const ScoreMeter = React.forwardRef<HTMLDivElement, ScoreMeterProps>(
  (
    {
      value,
      max = 10,
      label,
      tone = "primary",
      className,
      trackClassName,
      fillClassName,
      handleClassName,
      style,
      ...rest
    },
    ref,
  ) => {
    const clamped = Math.min(Math.max(value, 0), max);
    const progress = `${(clamped / max) * 100}%`;
    const meterStyle = {
      ...style,
      "--meter-progress": progress,
    } as React.CSSProperties;

    return (
      <div
        ref={ref}
        className={cn("w-full", className)}
        style={meterStyle}
        role={label ? "img" : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        {...rest}
      >
        <div
          className={cn(
            "relative h-[var(--space-2)] w-full rounded-full bg-muted shadow-neo-inset",
            trackClassName,
          )}
        >
          <div
            className={cn(
              "absolute left-0 top-0 h-full rounded-full bg-gradient-to-r shadow-ring",
              toneFillClasses[tone],
              fillClassName,
            )}
            style={{
              width: "var(--meter-progress)",
            }}
          />
          <div
            className={cn(
              "absolute top-1/2 h-[calc(var(--space-4)+var(--space-1))] w-[calc(var(--space-4)+var(--space-1))] -translate-y-1/2 -translate-x-1/2 rounded-full border border-border bg-card shadow-neoSoft",
              handleClassName,
            )}
            style={{
              left: "var(--meter-progress)",
            }}
          />
        </div>
      </div>
    );
  },
);

ScoreMeter.displayName = "ScoreMeter";

export default ScoreMeter;
