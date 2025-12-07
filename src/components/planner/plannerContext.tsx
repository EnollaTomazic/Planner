"use client";

import "./style.css";
import * as React from "react";
import type { PlannerGoalsState } from "./goals/usePlannerGoals";
import {
  PlannerDaysProvider,
  useDays,
  useFocus,
  usePlannerState,
  useSelection,
  type PlannerStateSlice,
  type PlannerViewMode,
} from "./plannerDaysContext";
import { PlannerGoalsProvider, usePlannerGoalsContext } from "./plannerGoalsContext";
import {
  PlannerRemindersProvider,
  usePlannerReminders,
} from "./plannerRemindersContext";
import type { RemindersContextValue } from "../goals/reminders/useReminders";

type PlannerState = PlannerStateSlice & {
  goals: PlannerGoalsState;
  reminders: RemindersContextValue;
};

export function PlannerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlannerRemindersProvider>
      <PlannerGoalsProvider>
        <PlannerDaysProvider>{children}</PlannerDaysProvider>
      </PlannerGoalsProvider>
    </PlannerRemindersProvider>
  );
}

export function usePlanner(): PlannerState {
  const state = usePlannerState();
  const goals = usePlannerGoalsContext();
  const reminders = usePlannerReminders();
  return {
    ...state,
    goals,
    reminders,
  } as const;
}

export { useDays, useFocus, useSelection } from "./plannerDaysContext";
export { usePlannerGoalsContext as usePlannerGoals } from "./plannerGoalsContext";
export type { PlannerViewMode };
export { usePlannerReminders } from "./plannerRemindersContext";
