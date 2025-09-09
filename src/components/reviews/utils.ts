import type * as React from "react";

export type Result = "Win" | "Loss";

/** Parse "m:ss" or "mm:ss" into seconds. Returns null for invalid input. */
export function parseTime(mmss: string): number | null {
  const m = mmss.trim().match(/^(\d{1,2}):([0-5]\d)$/);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

/** Convert seconds to "m:ss" with zero-padded seconds. */
export function formatSeconds(total: number): string {
  const minutes = Math.max(0, Math.floor(total / 60));
  const seconds = Math.max(0, total % 60);
  return `${String(minutes)}:${String(seconds).padStart(2, "0")}`;
}

export function onIconKey(
  e: React.KeyboardEvent,
  handler: () => void,
): void {
  if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    handler();
  }
}
