import * as React from "react";

import { cn } from "@/lib/utils";
import { getRingMetrics, type RingSize } from "@/lib/tokens";

import styles from "./ProgressRing.module.css";

type ProgressRingTone = "accent" | "primary" | "info" | "danger";

const toneClassNames: Record<ProgressRingTone, string> = {
  accent: "text-accent",
  primary: "text-primary",
  info: "text-accent-2",
  danger: "text-danger",
};

interface StyleWithVars extends React.CSSProperties {
  "--progress-ring-size"?: string;
}

const clampValue = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  if (value < 0) {
    return 0;
  }
  if (value > 100) {
    return 100;
  }
  return Math.round(value);
};

export interface ProgressRingProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  value: number;
  size?: RingSize;
  tone?: ProgressRingTone;
  showValue?: boolean;
  label?: React.ReactNode;
  valueFormatter?: (value: number) => React.ReactNode;
  children?: React.ReactNode;
}

const ProgressRing = React.forwardRef<HTMLDivElement, ProgressRingProps>(
  (
    {
      value,
      size = "m",
      tone = "accent",
      showValue = true,
      label,
      valueFormatter,
      className,
      children,
      style,
      ...rest
    },
    ref,
  ) => {
    const metrics = React.useMemo(() => getRingMetrics(size), [size]);
    const clamped = clampValue(value);
    const { diameter, inset, stroke } = metrics;
    const radius = Math.max(diameter / 2 - inset, 0);
    const circumference = radius > 0 ? 2 * Math.PI * radius : 0;
    const dashOffset = circumference - (clamped / 100) * circumference;

    const formattedValue = valueFormatter?.(clamped) ?? `${clamped}%`;
    const resolvedLabel = label ?? children ?? null;

    const {
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
      "aria-describedby": ariaDescribedby,
      ...restProps
    } = rest;

    const mergedStyle: StyleWithVars = {
      ...(style as React.CSSProperties | undefined),
      "--progress-ring-size": `${diameter}px`,
    };

    return (
      <div
        {...restProps}
        ref={ref}
        className={cn(styles.root, toneClassNames[tone], className)}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        data-tone={tone}
        style={mergedStyle}
      >
        <div className={styles.figure}>
          <svg
            className={styles.svg}
            viewBox={`0 0 ${diameter} ${diameter}`}
            width={diameter}
            height={diameter}
            aria-hidden="true"
            focusable="false"
          >
            <circle
              className={styles.track}
              cx={diameter / 2}
              cy={diameter / 2}
              r={radius}
              strokeWidth={stroke}
            />
            <circle
              className={styles.progress}
              cx={diameter / 2}
              cy={diameter / 2}
              r={radius}
              strokeWidth={stroke}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          {showValue ? (
            <span className={cn(styles.value, "text-label font-semibold text-foreground")}>
              {formattedValue}
            </span>
          ) : null}
        </div>
        {resolvedLabel ? (
          <span className={cn(styles.label, "text-caption text-muted-foreground")}>{resolvedLabel}</span>
        ) : null}
      </div>
    );
  },
);

ProgressRing.displayName = "ProgressRing";

export default ProgressRing;
