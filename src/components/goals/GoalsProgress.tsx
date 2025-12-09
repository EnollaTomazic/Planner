"use client";

import * as React from "react";

import { ProgressRing } from "@/components/ui";
import { getRingMetrics, type RingSize } from "@/lib/tokens";

const DEFAULT_RING_SIZE: RingSize = "m";

interface GoalsProgressProps {
  total: number;
  pct: number; // 0..100
  maxWidth?: number | string;
}

export function GoalsProgress({
  total,
  pct,
  maxWidth,
}: GoalsProgressProps) {
  const v = Math.max(0, Math.min(100, Math.round(pct)));
  const baseMetrics = React.useMemo(() => getRingMetrics(DEFAULT_RING_SIZE), []);
  const baseDiameter = baseMetrics.diameter;
  const baseStroke = baseMetrics.stroke;
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
  const resolvedRingSize = ringSize ?? DEFAULT_RING_SIZE;
  const resolvedStrokeWidth = React.useMemo(() => {
    if (typeof ringSize === "number" && baseDiameter > 0) {
      const scale = ringSize / baseDiameter;
      const scaledStroke = baseStroke * scale;
      return Number.isFinite(scaledStroke) ? scaledStroke : baseStroke;
    }

    return baseStroke;
  }, [ringSize, baseDiameter, baseStroke]);
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
      className="relative inline-flex size-[var(--goals-progress-size,var(--ring-diameter-m))] items-center justify-center rounded-full bg-panel-tilt shadow-neo-soft"
      aria-label={ariaLabel}
      style={customStyle}
    >
      <ProgressRing
        value={v}
        size={resolvedRingSize}
        strokeWidth={resolvedStrokeWidth}
        aria-hidden
      />
      <span
        aria-live="polite"
        className="absolute inset-0 flex items-center justify-center text-label font-medium tracking-[0.02em] tabular-nums"
      >
        {v}%
      </span>
    </div>
  );
}
