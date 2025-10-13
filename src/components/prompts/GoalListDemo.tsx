"use client";

import * as React from "react";
import { GoalList } from "@/components/goals";
import type { Goal } from "@/lib/types";
import { GOAL_DEMO_ITEMS } from "./demoData";

export function GoalListDemo() {
  const [items, setItems] = React.useState<Goal[]>(GOAL_DEMO_ITEMS);
  return (
    <div className="mb-[var(--space-8)]">
      <GoalList
        goals={items}
        onToggleDone={(id) => {
          setItems((prev) =>
            prev.map((g) => (g.id === id ? { ...g, done: !g.done } : g)),
          );
        }}
        onRemove={(id) => {
          setItems((prev) => prev.filter((g) => g.id !== id));
        }}
        onUpdate={(id, updates) => {
          setItems((prev) =>
            prev.map((g) => (g.id === id ? { ...g, ...updates } : g)),
          );
          return true;
        }}
      />
    </div>
  );
}

