import * as React from "react";
import { getRingMetrics, type RingSize } from "@/lib/tokens";
import { cn } from "@/lib/utils";
import RingNoiseDefs from "./RingNoiseDefs";

interface TimerRingIconProps {
  pct: number; // 0..100
  size?: number | RingSize;
}

const DEFAULT_RING_SIZE: RingSize = "l";

export default function TimerRingIcon({
  pct,
  size,
}: TimerRingIconProps) {
  const uniqueId = React.useId();
  const gradientId = `ring-gradient-${uniqueId}`;
  const noiseFilterId = `ring-noise-${uniqueId}`;
  const ringSize = typeof size === "string" ? size : DEFAULT_RING_SIZE;
  const metrics = React.useMemo(() => getRingMetrics(ringSize), [ringSize]);
  const resolvedSize = typeof size === "number" ? size : metrics.diameter;
  const strokeWidth = metrics.stroke;
  const trackInset = metrics.inset;
  const radius = Math.max(resolvedSize / 2 - trackInset, 0);
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const pulse = pct >= 90;
  const accessibleLabel = `Timer ${pct}% complete`;
  return (
    <svg
      className="h-full w-full rotate-[-90deg]"
      viewBox={`0 0 ${resolvedSize} ${resolvedSize}`}
      role="img"
      aria-label={accessibleLabel}
    >
      <defs>
        <RingNoiseDefs id={noiseFilterId} />
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--accent))" />
          <stop offset="100%" stopColor="hsl(var(--accent-2))" />
        </linearGradient>
      </defs>
      <circle
        cx={resolvedSize / 2}
        cy={resolvedSize / 2}
        r={radius}
        stroke="hsl(var(--card-hairline))"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx={resolvedSize / 2}
        cy={resolvedSize / 2}
        r={radius}
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className={cn(
          "drop-shadow-[0_0_calc(var(--space-3)/2)_hsl(var(--neon-soft))] transition-[stroke-dashoffset] duration-quick ease-linear motion-reduce:transition-none",
          pulse && "motion-safe:animate-pulse motion-reduce:animate-none",
        )}
        filter={`url(#${noiseFilterId})`}
        fill="none"
      />
    </svg>
  );
}
