import * as React from "react";
import { getRingMetrics, type RingSize } from "@/lib/tokens";
import RingNoiseDefs from "./RingNoiseDefs";

interface ProgressRingIconProps {
  pct: number; // 0..100
  size?: number | RingSize;
  strokeWidth?: number;
}

const DEFAULT_RING_SIZE: RingSize = "m";

export default function ProgressRingIcon({
  pct,
  size,
  strokeWidth,
}: ProgressRingIconProps) {
  const uniqueId = React.useId();
  const noiseFilterId = React.useMemo(
    () => `ring-noise-${uniqueId}`,
    [uniqueId],
  );
  const ringSize = typeof size === "string" ? size : DEFAULT_RING_SIZE;
  const metrics = React.useMemo(
    () =>
      strokeWidth == null
        ? getRingMetrics(ringSize)
        : getRingMetrics(ringSize, { stroke: strokeWidth }),
    [ringSize, strokeWidth],
  );
  const resolvedSize = typeof size === "number" ? size : metrics.diameter;
  const ringStrokeWidth = strokeWidth ?? metrics.stroke;
  const trackInset = metrics.inset;
  const radius = Math.max(resolvedSize / 2 - trackInset, 0);
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  return (
    <svg
      className="h-full w-full rotate-[-90deg]"
      viewBox={`0 0 ${resolvedSize} ${resolvedSize}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <RingNoiseDefs id={noiseFilterId} />
      </defs>
      <circle
        cx={resolvedSize / 2}
        cy={resolvedSize / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={ringStrokeWidth}
        className="text-foreground/20"
        fill="none"
      />
      <circle
        cx={resolvedSize / 2}
        cy={resolvedSize / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={ringStrokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="text-accent shadow-ring motion-safe:animate-pulse [--ring:var(--accent-1)]"
        filter={`url(#${noiseFilterId})`}
        fill="none"
      />
    </svg>
  );
}
