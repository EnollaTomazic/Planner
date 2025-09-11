"use client";

import * as React from "react";
import TimerRingIcon from "@/icons/TimerRingIcon";

interface TimerRingProps {
  pct: number; // 0..100
  size?: number;
}

export default function TimerRing({ pct, size = 200 }: TimerRingProps) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <TimerRingIcon pct={pct} size={size} />
    </div>
  );
}
