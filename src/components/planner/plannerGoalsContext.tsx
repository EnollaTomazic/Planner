"use client";

import * as React from "react";
import type { PlannerGoalsState } from "./goals/usePlannerGoals";
import { usePlannerGoals } from "./goals/usePlannerGoals";

const PlannerGoalsContext = React.createContext<PlannerGoalsState | null>(null);

export function PlannerGoalsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const value = usePlannerGoals();
  return (
    <PlannerGoalsContext.Provider value={value}>
      {children as React.ReactNode}
    </PlannerGoalsContext.Provider>
  );
}

export function usePlannerGoalsContext(): PlannerGoalsState {
  const ctx = React.useContext(PlannerGoalsContext);
  if (!ctx) {
    throw new Error(
      "PlannerProvider missing. Wrap your planner page with <PlannerProvider>.",
    );
  }
  return ctx;
}
