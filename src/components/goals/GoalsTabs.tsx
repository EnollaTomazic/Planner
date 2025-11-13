"use client";

import * as React from "react";
import { type TabItem, TabBar } from "@/components/ui/layout/TabBar";
import { Circle, CircleDot, CircleCheck, Plus } from "lucide-react";

export type FilterKey = "All" | "Active" | "Done" | "New goal";

export type SegmentFilterKey = Exclude<FilterKey, "New goal">;

const FILTER_ITEMS: TabItem<FilterKey>[] = [
  { key: "All", label: "All", icon: <Circle aria-hidden="true" /> },
  { key: "Active", label: "Active", icon: <CircleDot aria-hidden="true" /> },
  { key: "Done", label: "Done", icon: <CircleCheck aria-hidden="true" /> },
  {
    key: "New goal",
    label: "New goal",
    icon: <Plus aria-hidden="true" />,
  },
];

interface GoalsTabsProps {
  value: SegmentFilterKey;
  onChange: (val: SegmentFilterKey) => void;
  onNewGoal: () => void;
  newGoalDisabled?: boolean;
}

export function GoalsTabs({ value, onChange, onNewGoal, newGoalDisabled = false }: GoalsTabsProps) {
  const items = React.useMemo(
    () =>
      FILTER_ITEMS.map((item) =>
        item.key === "New goal" ? { ...item, disabled: newGoalDisabled } : item,
      ),
    [newGoalDisabled],
  );

  const handleChange = React.useCallback(
    (next: FilterKey) => {
      if (next === "New goal") {
        if (!newGoalDisabled) {
          onNewGoal();
        }
        return;
      }
      onChange(next);
    },
    [newGoalDisabled, onChange, onNewGoal],
  );

  return (
    <TabBar<FilterKey>
      items={items}
      value={value}
      onValueChange={handleChange}
      size="sm"
      ariaLabel="Filter goals"
      linkPanels={false}
    />
  );
}
