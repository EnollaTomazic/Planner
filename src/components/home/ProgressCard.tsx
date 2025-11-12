"use client";

import * as React from "react";

import ProgressRingIcon from "@/icons/ProgressRingIcon";
import { getRingMetrics, type RingSize } from "@/lib/tokens";
import { cn } from "@/lib/utils";

export interface ProgressCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  value?: React.ReactNode;
  metric?: React.ReactNode;
  percentage: number;
  ringLabel?: React.ReactNode;
  ringSize?: RingSize;
  children?: React.ReactNode;
}

const ProgressCard = React.forwardRef<HTMLDivElement, ProgressCardProps>(
  (
    {
      label,
      value,
      metric,
      percentage,
      ringLabel,
      ringSize = "m",
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const ringMetrics = React.useMemo(() => getRingMetrics(ringSize), [ringSize]);
    const ringDimensions = React.useMemo(
      () => ({
        width: `${ringMetrics.diameter}px`,
        height: `${ringMetrics.diameter}px`,
      }),
      [ringMetrics.diameter],
    );
    const hasHeaderContent = label != null || value != null || metric != null;

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-[var(--space-4)] rounded-[var(--radius-xl)] border border-card-hairline/60 bg-surface/80 p-[var(--space-4)] text-card-foreground shadow-[var(--shadow-outline-subtle)] sm:flex-row sm:items-center sm:gap-[var(--space-5)]",
          className,
        )}
        {...props}
      >
        <div className="flex items-center justify-center">
          <div className="relative flex items-center justify-center rounded-full bg-surface/90 p-[var(--space-2)] shadow-[var(--shadow-inner-md)] ring-1 ring-inset ring-card-hairline/60">
            <div
              className="relative flex items-center justify-center text-accent"
              style={ringDimensions}
            >
              <ProgressRingIcon pct={percentage} size={ringSize} />
              <span className="absolute text-ui font-semibold tabular-nums text-card-foreground">
                {ringLabel ?? (Number.isFinite(percentage) ? `${Math.round(percentage)}%` : "0%")}
              </span>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-[var(--space-3)]">
          {hasHeaderContent ? (
            <div className="space-y-[var(--space-1)]">
              {label ? (
                <p className="text-label font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  {label}
                </p>
              ) : null}
              {value ? (
                <p className="text-title font-semibold text-card-foreground">{value}</p>
              ) : null}
              {metric ? (
                <p className="text-label text-muted-foreground">{metric}</p>
              ) : null}
            </div>
          ) : null}
          {children ? <div className="space-y-[var(--space-2)]">{children}</div> : null}
        </div>
      </div>
    );
  },
);

ProgressCard.displayName = "ProgressCard";

export { ProgressCard };
