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
    <div
      role="tablist"
      aria-label="Filter goals"
      className="flex flex-col gap-2"
    >
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
              "text-left font-mono text-sm transition whitespace-pre",
              "px-3 py-2 rounded-2xl",
              "hover:-translate-y-px hover:ring-1 hover:ring-[hsl(var(--ring))]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]",
              active ? "font-semibold" : undefined,
            )}
          >
            {active ? "-> " : "   "}
            {f}
          </button>
        );
      })}
    </div>
  );
}

