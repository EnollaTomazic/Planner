// src/components/ui/PillarSelector.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { Pillar } from "@/lib/types";
import styles from "./PillarSelector.module.css";

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

  function handleKeyDown(p: Pillar, event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === " " || event.key === "Space" || event.key === "Spacebar" || event.key === "Enter") {
      event.preventDefault();
      toggle(p);
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="overline mb-[var(--space-2)]">{label}</div>
      <div className="flex flex-wrap gap-[var(--space-2)]">
        {ORDER.map((p) => {
          const active = set.has(p);
          return (
            <button
              key={p}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(p)}
              onKeyDown={(event) => handleKeyDown(p, event)}
              className={cn(
                "pill transition",
                styles.button,
                active &&
                  "pill--medium text-foreground shadow-[var(--depth-shadow-soft)]",
              )}
              data-active={active ? "true" : undefined}
            >
              <span
                aria-hidden
                className={cn(
                  "h-[var(--space-2)] w-[var(--space-2)] rounded-full",
                  active ? "" : "bg-muted-foreground",
                  styles.indicator,
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
