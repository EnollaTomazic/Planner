import * as React from "react";
import { spacingTokens, readNumberToken } from "@/lib/tokens";

interface ProgressRingIconProps {
  pct: number; // 0..100
  size?: number;
}

const PROGRESS_DIAMETER_FALLBACK = spacingTokens[7];
const TRACK_INSET_FALLBACK = spacingTokens[2] / 2;
const STROKE_WIDTH_FALLBACK = spacingTokens[0];

export default function ProgressRingIcon({
  pct,
  size,
}: ProgressRingIconProps) {
  const defaultDiameter = React.useMemo(
    () => readNumberToken("--progress-ring-diameter", PROGRESS_DIAMETER_FALLBACK),
    [],
  );
  const strokeWidth = React.useMemo(
    () => readNumberToken("--progress-ring-stroke", STROKE_WIDTH_FALLBACK),
    [],
  );
  const trackInset = React.useMemo(
    () => readNumberToken("--progress-ring-inset", TRACK_INSET_FALLBACK),
    [],
  );
  const resolvedSize = size ?? defaultDiameter;
  const radius = resolvedSize / 2 - trackInset;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  return (
    <svg
      className="h-full w-full rotate-[-90deg]"
      viewBox={`0 0 ${resolvedSize} ${resolvedSize}`}
      aria-hidden="true"
      focusable="false"
    >
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
        fill="none"
      />
    </svg>
  );
}
