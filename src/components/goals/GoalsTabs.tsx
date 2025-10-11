"use client";

import * as React from "react";
import { type TabItem, TabBar } from "@/components/ui/layout/TabBar";
import { Circle, CircleDot, CircleCheck } from "lucide-react";

export type FilterKey = "All" | "Active" | "Done";

const FILTER_ITEMS: TabItem<FilterKey>[] = [
  { key: "All", label: "All", icon: <Circle aria-hidden="true" /> },
  { key: "Active", label: "Active", icon: <CircleDot aria-hidden="true" /> },
  { key: "Done", label: "Done", icon: <CircleCheck aria-hidden="true" /> },
];

interface GoalsTabsProps {
  value: FilterKey;
  onChange: (val: FilterKey) => void;
}

export function GoalsTabs({ value, onChange }: GoalsTabsProps) {
  return (
    <TabBar<FilterKey>
      items={FILTER_ITEMS}
      value={value}
      onValueChange={onChange}
      size="sm"
      ariaLabel="Filter goals"
      linkPanels={false}
    />
  );
}
