// src/components/layout/Split.tsx
"use client";

import * as React from "react";

/**
 * Split — minimal responsive two-column layout
 * - Stacks on small screens, 2 cols on md+
 * - Keeps consistent gaps; no opinion about card chrome
 */
export function Split({
  left,
  right,
  className = "",
}: {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={["grid gap-[var(--space-6)] md:grid-cols-2", className].join(" ")}>
      <div className="min-w-0">{left}</div>
      <div className="min-w-0">{right}</div>
    </div>
  );
}
