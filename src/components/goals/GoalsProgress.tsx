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
  const customSize =
    maxWidth == null
      ? undefined
      : typeof maxWidth === "number"
        ? `${maxWidth}px`
        : maxWidth;
  const ringSize = typeof maxWidth === "number" ? maxWidth : undefined;
  const ariaLabel =
    total === 0
      ? "Goals progress: no goals yet"
      : `Goals progress: ${v}% complete`;
  return (
    <div
      className="relative inline-flex size-[var(--goals-progress-size,var(--ring-diameter-m))] items-center justify-center"
      style={
        customSize
          ? ({
              "--goals-progress-size": customSize,
            } as React.CSSProperties)
          : undefined
      }
      aria-label={ariaLabel}
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
