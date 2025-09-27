"use client";

import * as React from "react";
import TimerRingIcon from "@/icons/TimerRingIcon";
import { cn } from "@/lib/utils";

interface TimerRingProps {
  pct: number; // 0..100
  className?: string;
  size?: number;
}

export default function TimerRing({
  pct,
  className,
  size,
}: TimerRingProps) {
  return (
    <div
      className={cn(
        "relative aspect-square",
        className ?? "size-[var(--timer-ring-diameter,calc(var(--space-8)*3.5))]",
      )}
    >
      <TimerRingIcon pct={pct} size={size} />
    </div>
  );
}
