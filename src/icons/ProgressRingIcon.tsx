import * as React from "react";

interface ProgressRingIconProps {
  pct: number; // 0..100
  size?: number;
}

export default function ProgressRingIcon({
  pct,
  size = 64,
}: ProgressRingIconProps) {
  const radius = size / 2 - 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  return (
    <svg
      className="h-full w-full rotate-[-90deg]"
      viewBox={`0 0 ${size} ${size}`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={4}
        className="text-muted-foreground/30"
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="text-accent shadow-ring motion-safe:animate-pulse [--ring:var(--accent)]"
        fill="none"
      />
    </svg>
  );
}
