"use client";

import { usePlanner } from "@/components/planner";
import { ACTIVE_CAP, decodeGoals, type AddGoalInput } from "./goalsPersistence";

export { ACTIVE_CAP, decodeGoals, type AddGoalInput };

export function useGoals() {
  const { goals } = usePlanner();
  return goals;
}

