"use client";

import * as React from "react";
import {
  RemindersContext,
  RemindersProvider,
  useReminders,
  type RemindersContextValue,
} from "../goals/reminders/useReminders";

const PlannerRemindersContext = React.createContext<
  RemindersContextValue | null
>(null);

export function PlannerRemindersProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const parentContext = React.useContext(RemindersContext);
  const reminders = useReminders();

  if (parentContext) {
    return (
      <PlannerRemindersContext.Provider value={parentContext}>
        {children as React.ReactNode}
      </PlannerRemindersContext.Provider>
    );
  }

  return (
    <RemindersProvider>
      <PlannerRemindersContext.Provider value={reminders}>
        {children as React.ReactNode}
      </PlannerRemindersContext.Provider>
    </RemindersProvider>
  );
}

export function usePlannerReminders(): RemindersContextValue {
  const ctx = React.useContext(PlannerRemindersContext);
  if (!ctx) {
    throw new Error(
      "PlannerProvider missing. Wrap your planner page with <PlannerProvider>.",
    );
  }
  return ctx;
}
