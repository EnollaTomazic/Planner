// src/components/ui/PillarSelector.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { Pillar } from "@/lib/types";

const ORDER: Pillar[] = ["Wave", "Trading", "Vision", "Tempo", "Positioning", "Comms"];

type PillarHighlightStyle = React.CSSProperties & {
  "--pillar-indicator-gradient"?: string;
};

export default function PillarSelector({
  value = [],
  onChange,
  className,
  label = "Pillars",
}: {
  value?: Pillar[];
  onChange?: (next: Pillar[]) => void;
  className?: string;
  label?: string;
}) {
  const set = new Set(value);

  function toggle(p: Pillar) {
    const next = new Set(value);
    if (next.has(p)) next.delete(p);
    else next.add(p);
    onChange?.(Array.from(next));
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="overline mb-[var(--space-2)]">{label}</div>
      <div className="flex flex-wrap gap-[var(--space-2)]">
        {ORDER.map((p) => {
          const active = set.has(p);
          const activeStyle: PillarHighlightStyle | undefined = active
            ? {
                "--pillar-indicator-gradient":
                  "linear-gradient(90deg, hsl(var(--primary)/0.18), hsl(var(--accent)/0.18))",
              }
            : undefined;
          return (
            <button
              key={p}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(p)}
              className={cn(
                "pill transition",
                active &&
                  "pill--medium text-foreground shadow-[var(--shadow-neo-soft)] [background:var(--pillar-indicator-gradient)]",
              )}
              style={activeStyle}
            >
              <span
                aria-hidden
                className={cn(
                  "h-[var(--space-2)] w-[var(--space-2)] rounded-full",
                  active ? "" : "bg-muted-foreground"
                )}
                style={active ? { background: "var(--accent-overlay)" } : undefined}
              />
              {p}
            </button>
          );
        })}
      </div>
    </div>
  );
}
