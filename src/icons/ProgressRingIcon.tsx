import * as React from "react";
import { spacingTokens } from "@/lib/tokens";

interface ProgressRingIconProps {
  pct: number; // 0..100
  size?: number;
}

const PROGRESS_DIAMETER = spacingTokens[7];
const TRACK_INSET = spacingTokens[2] / 2;
const STROKE_WIDTH = spacingTokens[0];

export default function ProgressRingIcon({
  pct,
  size = PROGRESS_DIAMETER,
}: ProgressRingIconProps) {
  const radius = size / 2 - TRACK_INSET;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  return (
    <svg
      className="h-full w-full rotate-[-90deg]"
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={STROKE_WIDTH}
        className="text-foreground/20"
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="text-accent shadow-ring motion-safe:animate-pulse [--ring:var(--accent)]"
        fill="none"
      />
    </svg>
  );
}
