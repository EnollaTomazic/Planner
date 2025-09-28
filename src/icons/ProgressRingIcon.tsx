import * as React from "react";
import { getRingMetrics, type RingSize } from "@/lib/tokens";
import RingNoiseDefs from "./RingNoiseDefs";

interface ProgressRingIconProps {
  pct: number; // 0..100
  size?: number | RingSize;
}

const DEFAULT_RING_SIZE: RingSize = "m";

export default function ProgressRingIcon({
  pct,
  size,
}: ProgressRingIconProps) {
  const uniqueId = React.useId();
  const noiseFilterId = React.useMemo(
    () => `ring-noise-${uniqueId}`,
    [uniqueId],
  );
  const ringSize = typeof size === "string" ? size : DEFAULT_RING_SIZE;
  const metrics = React.useMemo(() => getRingMetrics(ringSize), [ringSize]);
  const resolvedSize = typeof size === "number" ? size : metrics.diameter;
  const strokeWidth = metrics.stroke;
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
        strokeWidth={strokeWidth}
        className="text-foreground/20"
        fill="none"
      />
      <circle
        cx={resolvedSize / 2}
        cy={resolvedSize / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="text-accent shadow-ring motion-safe:animate-pulse [--ring:var(--accent)]"
        filter={`url(#${noiseFilterId})`}
        fill="none"
      />
    </svg>
  );
}
