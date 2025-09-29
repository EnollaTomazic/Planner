"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type GlitchProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  current: number;
  total: number;
  showPercentage?: boolean;
  trackClassName?: string;
  trackProps?: React.ComponentPropsWithoutRef<"div">;
  percentageClassName?: string;
  percentageProps?: React.ComponentPropsWithoutRef<"span">;
  formatPercentage?: (value: number) => React.ReactNode;
};

const getSafeNumber = (value: number) => (Number.isFinite(value) ? value : 0);

const GlitchProgress = React.forwardRef<HTMLDivElement, GlitchProgressProps>(
  (
    {
      current,
      total,
      className,
      trackClassName,
      showPercentage = false,
      trackProps,
      percentageClassName,
      percentageProps,
      formatPercentage,
      ...rest
    },
    ref,
  ) => {
    const parsedTotal = Math.max(0, getSafeNumber(total));
    const parsedCurrent = getSafeNumber(current);
    const normalizedCurrent =
      parsedTotal === 0
        ? 0
        : Math.min(Math.max(parsedCurrent, 0), parsedTotal);
    const ratio = parsedTotal === 0 ? 0 : normalizedCurrent / parsedTotal;
    const percent = Math.round(ratio * 100);
    const clampedPercent = Math.min(Math.max(percent, 0), 100);
    const hasProgress = clampedPercent > 0;
    const formattedPercentage =
      formatPercentage?.(clampedPercent) ?? `${clampedPercent}%`;
    const progressClassName = hasProgress
      ? `progress-${clampedPercent}`
      : "progress-0";

    const {
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
      "aria-describedby": ariaDescribedby,
      ...nonLabelProps
    } = rest;

    const { className: trackClassNameFromProps, ...restTrackProps } =
      trackProps ?? {};
    const {
      className: percentageClassNameFromProps,
      "aria-live": ariaLive,
      ...restPercentageProps
    } = percentageProps ?? {};

    const progressTrack = (
      <div
        {...restTrackProps}
        {...(!showPercentage ? nonLabelProps : {})}
        className={cn(
          "glitch-track",
          trackClassNameFromProps,
          trackClassName,
          !showPercentage && className,
          clampedPercent >= 100 && "is-complete",
        )}
        data-progress-state={hasProgress ? "active" : "zero"}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clampedPercent}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        ref={ref}
      >
        <div
          className={cn(
            "glitch-fill transition-[width] duration-slow ease-out motion-reduce:transition-none",
            progressClassName,
          )}
        />
        <div className="glitch-scan" />
      </div>
    );

    if (!showPercentage) {
      return progressTrack;
    }

    return (
      <div
        {...nonLabelProps}
        className={cn("flex items-center gap-[var(--space-3)]", className)}
      >
        {progressTrack}
        <span
          {...restPercentageProps}
          className={cn(
            "glitch-percent text-ui font-medium",
            percentageClassNameFromProps,
            percentageClassName,
          )}
          aria-live={ariaLive ?? "polite"}
        >
          {formattedPercentage}
        </span>
      </div>
    );
  },
);

GlitchProgress.displayName = "GlitchProgress";

export default GlitchProgress;
