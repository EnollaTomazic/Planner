"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TimerRingProps {
  pct: number; // 0..100
  size?: number;
}

export default function TimerRing({ pct, size = 200 }: TimerRingProps) {
  const radius = size / 2 - 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const pulse = pct >= 90;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="h-full w-full rotate-[-90deg]" viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="timer-ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
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
          stroke="url(#timer-ring-grad)"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            "drop-shadow-[0_0_6px_hsl(var(--neon-soft))] transition-[stroke-dashoffset] duration-150 ease-linear motion-reduce:transition-none",
            pulse && "animate-pulse",
          )}
          fill="none"
        />
      </svg>
    </div>
  );
}

