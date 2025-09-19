import * as React from "react";
import { cn } from "@/lib/utils";

interface TimerRingIconProps {
  pct: number; // 0..100
  size?: number;
}

export default function TimerRingIcon({ pct, size = 200 }: TimerRingIconProps) {
  const uniqueId = React.useId();
  const gradientId = `timer-ring-grad-${uniqueId}`;
  const radius = size / 2 - 6;
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
        strokeWidth={4}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={`url(#${gradientId})`}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className={cn(
          "drop-shadow-[0_0_6px_hsl(var(--neon-soft))] transition-[stroke-dashoffset] duration-200 ease-linear motion-reduce:transition-none",
          pulse && "animate-pulse",
        )}
        fill="none"
      />
    </svg>
  );
}
