import * as React from "react";
import { spacingTokens } from "@/lib/tokens";
import { cn } from "@/lib/utils";

interface TimerRingIconProps {
  pct: number; // 0..100
  size?: number;
}

const RING_DIAMETER = (spacingTokens[7] * 7) / 2;
const TRACK_INSET = spacingTokens[2] / 2;
const STROKE_WIDTH = spacingTokens[0];

export default function TimerRingIcon({
  pct,
  size = RING_DIAMETER,
}: TimerRingIconProps) {
  const uniqueId = React.useId();
  const gradientId = `timer-ring-grad-${uniqueId}`;
  const radius = size / 2 - TRACK_INSET;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const pulse = pct >= 90;
  const accessibleLabel = `Timer ${pct}% complete`;
  return (
    <svg
      className="h-full w-full rotate-[-90deg]"
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={accessibleLabel}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--accent))" />
          <stop offset="100%" stopColor="hsl(var(--accent-2))" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="hsl(var(--card-hairline))"
        strokeWidth={STROKE_WIDTH}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={`url(#${gradientId})`}
        strokeWidth={STROKE_WIDTH}
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
