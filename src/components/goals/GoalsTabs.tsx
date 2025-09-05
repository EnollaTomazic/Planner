"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type FilterKey = "All" | "Active" | "Done";
const FILTERS: FilterKey[] = ["All", "Active", "Done"];

interface GoalsTabsProps {
  value: FilterKey;
  onChange: (val: FilterKey) => void;
}

export default function GoalsTabs({ value, onChange }: GoalsTabsProps) {
  return (
    <div role="tablist" aria-label="Filter goals" className="flex gap-2">
      {FILTERS.map((f) => {
        const active = value === f;
        return (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(f)}
            className={cn(
              "relative inline-flex items-center gap-1 px-3 py-1 text-xs font-mono uppercase tracking-tight transition",
              "rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]",
              "hover:-translate-y-px hover:ring-1 hover:ring-[hsl(var(--ring))]",
              active
                ? "after:absolute after:inset-x-0 after:-bottom-[2px] after:h-[2px] after:bg-[hsl(var(--accent))]"
                : undefined,
            )}
          >
            <span aria-hidden>&gt;</span>
            {f}
          </button>
        );
      })}
    </div>
  );
}

