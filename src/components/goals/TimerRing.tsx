"use client";

import * as React from "react";
import TimerRingIcon from "@/icons/TimerRingIcon";
import { spacingTokens } from "@/lib/tokens";
import { cn } from "@/lib/utils";

interface TimerRingProps {
  pct: number; // 0..100
  className?: string;
  size?: number;
}

const DEFAULT_VIEWBOX = (spacingTokens[7] * 7) / 2;

export default function TimerRing({
  pct,
  className,
  size = DEFAULT_VIEWBOX,
}: TimerRingProps) {
  return (
    <div
      className={cn(
        "relative aspect-square",
        className ?? "size-[calc(var(--space-8)*3.5)]",
      )}
    >
      <TimerRingIcon pct={pct} size={size} />
    </div>
  );
}
