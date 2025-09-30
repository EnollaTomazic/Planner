import * as React from "react";

import { getRingMetrics, type RingSize } from "@/lib/tokens";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";

import styles from "./ProgressRing.module.css";

type ProgressRingStyle = React.CSSProperties & {
  "--progress-ring-indicator"?: string;
  "--progress-ring-track"?: string;
};

type ProgressRingTone = "primary" | "accent" | "info" | "danger" | "success";

type ProgressRingTrackTone = "muted" | "surface";

export interface ProgressRingProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, "children"> {
  value: number;
  size?: RingSize | number;
  tone?: ProgressRingTone;
  trackTone?: ProgressRingTrackTone;
  label?: string;
}

const toneColorVars: Record<ProgressRingTone, string> = {
  primary: "--primary",
  accent: "--accent",
  info: "--accent-2",
  danger: "--danger",
  success: "--success",
};

const trackToneColors: Record<ProgressRingTrackTone, string> = {
  muted: "hsl(var(--ring-muted) / 0.45)",
  surface: "hsl(var(--line) / 0.45)",
};

const clampValue = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, value));
};

const ProgressRing = React.forwardRef<SVGSVGElement, ProgressRingProps>(
  (
    {
      value,
      size = "m",
      tone = "accent",
      trackTone = "muted",
      label,
      className,
      style,
      ...restProps
    },
    ref,
  ) => {
    const reduceMotion = usePrefersReducedMotion();
    const ringSize = typeof size === "string" ? size : "m";
    const metrics = React.useMemo(() => getRingMetrics(ringSize), [ringSize]);
    const resolvedSize =
      typeof size === "number" && Number.isFinite(size)
        ? size
        : metrics.diameter;
    const strokeWidth = metrics.stroke;
    const radius = Math.max(resolvedSize / 2 - metrics.inset, 0);
    const circumference = 2 * Math.PI * radius;
    const clamped = clampValue(value);
    const dashOffset = circumference - (clamped / 100) * circumference;
    const indicatorStyle: React.CSSProperties = {
      strokeDasharray: circumference,
      strokeDashoffset: dashOffset,
    };

    if (reduceMotion) {
      indicatorStyle.transition = "none";
    }

    const toneVar = toneColorVars[tone] ?? toneColorVars.accent;
    const trackColor = trackToneColors[trackTone] ?? trackToneColors.muted;
    const mergedStyle: ProgressRingStyle = {
      ...(style as ProgressRingStyle | undefined),
      "--progress-ring-indicator": `hsl(var(${toneVar}))`,
      "--progress-ring-track": trackColor,
    };

    const { ["aria-label"]: ariaLabel, ["aria-labelledby"]: labelledBy, ...svgProps } =
      restProps;

    const titleId = React.useId();
    const resolvedLabelId =
      label && !ariaLabel && !labelledBy ? `${titleId}-label` : undefined;

    return (
      <svg
        {...svgProps}
        ref={ref}
        role="img"
        aria-label={ariaLabel}
        aria-labelledby={resolvedLabelId ?? (labelledBy as string | undefined)}
        viewBox={`0 0 ${resolvedSize} ${resolvedSize}`}
        width={resolvedSize}
        height={resolvedSize}
        className={cn(styles.root, styles.svg, className)}
        style={mergedStyle}
      >
        {resolvedLabelId ? <title id={resolvedLabelId}>{label}</title> : null}
        <circle
          cx={resolvedSize / 2}
          cy={resolvedSize / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className={styles.track}
        />
        <circle
          cx={resolvedSize / 2}
          cy={resolvedSize / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className={styles.indicator}
          style={indicatorStyle}
          data-motion={reduceMotion ? "reduced" : "default"}
        />
      </svg>
    );
  },
);

ProgressRing.displayName = "ProgressRing";

export default ProgressRing;
