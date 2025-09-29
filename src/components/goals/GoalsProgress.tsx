"use client";

import * as React from "react";

import ProgressRingIcon from "@/icons/ProgressRingIcon";

interface GoalsProgressProps {
  total: number;
  pct: number; // 0..100
  maxWidth?: number | string;
}

export default function GoalsProgress({
  total,
  pct,
  maxWidth,
}: GoalsProgressProps) {
  const v = Math.max(0, Math.min(100, Math.round(pct)));
  const customSizeValue = React.useMemo(() => {
    if (maxWidth == null) {
      return null;
    }
    if (typeof maxWidth === "number") {
      return Number.isFinite(maxWidth) ? `${maxWidth}px` : null;
    }

    return maxWidth;
  }, [maxWidth]);
  const ringSize =
    typeof maxWidth === "number" && Number.isFinite(maxWidth)
      ? maxWidth
      : undefined;
  const ariaLabel =
    total === 0
      ? "Goals progress: no goals yet"
      : `Goals progress: ${v}% complete`;
  const customStyle = React.useMemo<
    (React.CSSProperties & Record<string, string>) | undefined
  >(() => {
    if (!customSizeValue) {
      return undefined;
    }
    return {
      "--goals-progress-size": customSizeValue,
    };
  }, [customSizeValue]);

  return (
    <div
      className="relative inline-flex size-[var(--goals-progress-size,var(--ring-diameter-m))] items-center justify-center"
      aria-label={ariaLabel}
      style={customStyle}
    >
      <ProgressRingIcon pct={v} size={ringSize} />
      <span
        aria-live="polite"
        className="absolute inset-0 flex items-center justify-center text-label font-medium tracking-[0.02em] tabular-nums"
      >
        {v}%
      </span>
    </div>
  );
}
