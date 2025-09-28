import * as React from "react";
import { spacingTokens, readNumberToken } from "@/lib/tokens";
import { cn } from "@/lib/utils";
import { renderRingNoiseFilter } from "./ringNoiseFilter";

interface TimerRingIconProps {
  pct: number; // 0..100
  size?: number;
}

const RING_DIAMETER_FALLBACK = (spacingTokens[7] * 7) / 2;
const TRACK_INSET_FALLBACK = spacingTokens[2] / 2;
const STROKE_WIDTH_FALLBACK = spacingTokens[0];

export default function TimerRingIcon({
  pct,
  size,
}: TimerRingIconProps) {
  const uniqueId = React.useId();
  const gradientId = `timer-ring-grad-${uniqueId}`;
  const noiseFilter = React.useMemo(
    () => renderRingNoiseFilter(uniqueId),
    [uniqueId],
  );
  const defaultDiameter = React.useMemo(
    () => readNumberToken("--timer-ring-diameter", RING_DIAMETER_FALLBACK),
    [],
  );
  const strokeWidth = React.useMemo(
    () => readNumberToken("--timer-ring-stroke", STROKE_WIDTH_FALLBACK),
    [],
  );
  const trackInset = React.useMemo(
    () => readNumberToken("--timer-ring-inset", TRACK_INSET_FALLBACK),
    [],
  );
  const resolvedSize = size ?? defaultDiameter;
  const radius = resolvedSize / 2 - trackInset;
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
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--accent))" />
          <stop offset="100%" stopColor="hsl(var(--accent-2))" />
        </linearGradient>
        {noiseFilter.element}
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
        filter={`url(#${noiseFilter.filterId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className={cn(
          "drop-shadow-[0_0_calc(var(--space-3)/2)_hsl(var(--neon-soft))] transition-[stroke-dashoffset] duration-quick ease-linear motion-reduce:transition-none",
          pulse && "motion-safe:animate-pulse motion-reduce:animate-none",
        )}
        fill="none"
      />
    </svg>
  );
}
