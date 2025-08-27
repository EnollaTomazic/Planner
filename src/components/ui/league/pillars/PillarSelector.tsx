// src/components/ui/PillarSelector.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { Pillar } from "@/lib/types";

const ORDER: Pillar[] = ["Wave", "Trading", "Vision", "Tempo", "Positioning", "Comms"];

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
      <div className="overline mb-2">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {ORDER.map((p) => {
          const active = set.has(p);
          return (
            <button
              key={p}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(p)}
              className={cn("pill transition", active ? "pill--medium text-foreground" : "")}
              style={
                active
                  ? {
                      background:
                        "linear-gradient(90deg, hsl(var(--primary)/.18), hsl(var(--accent)/.18))",
                      boxShadow: "0 10px 30px hsl(var(--shadow-color) / .25)",
                    }
                  : undefined
              }
            >
              <span
                aria-hidden
                className={cn(
                  "h-2 w-2 rounded-full",
                  active ? "bg-[hsl(var(--accent))]" : "bg-[hsl(var(--muted-foreground))]"
                )}
              />
              {p}
            </button>
          );
        })}
      </div>
    </div>
  );
}
