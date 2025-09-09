import * as React from "react";
import { GoalList } from "@/components/goals";
import type { Goal } from "@/lib/types";

const GOAL_DEMO_ITEMS: Goal[] = [
  { id: "g1", title: "Demo active goal", done: false, createdAt: Date.now() },
  {
    id: "g2",
    title: "Demo done goal",
    done: true,
    createdAt: Date.now() - 86_400_000,
  },
];

export default function GoalListDemo() {
  const [items, setItems] = React.useState<Goal[]>(GOAL_DEMO_ITEMS);
  return (
    <div className="mb-8">
      <GoalList
        goals={items}
        onToggleDone={(id) =>
          setItems((prev) =>
            prev.map((g) => (g.id === id ? { ...g, done: !g.done } : g)),
          )
        }
        onRemove={(id) => setItems((prev) => prev.filter((g) => g.id !== id))}
      />
    </div>
  );
}

