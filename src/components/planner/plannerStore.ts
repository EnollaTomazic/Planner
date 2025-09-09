"use client";

import "./style.css";
import * as React from "react";
import { usePersistentState } from "@/lib/db";
import { toISODate } from "@/lib/date";

export type ISODate = string;

export type Project = {
  id: string;
  name: string;
  done: boolean;
  createdAt: number;
};

export type DayTask = {
  id: string;
  title: string;
  done: boolean;
  projectId?: string;
  createdAt: number;
};

export type DayRecord = {
  projects: Project[];
  tasks: DayTask[];
  focus?: string;
  notes?: string;
};

export type Selection = {
  projectId?: string;
  taskId?: string;
};

export function todayISO(): ISODate {
  return toISODate(new Date());
}

export function ensureDay(map: Record<ISODate, DayRecord>, date: ISODate) {
  return map[date] ?? { projects: [], tasks: [] };
}

type PlannerState = {
  days: Record<ISODate, DayRecord>;
  setDays: React.Dispatch<React.SetStateAction<Record<ISODate, DayRecord>>>;
  focus: ISODate;
  setFocus: (iso: ISODate) => void;
  selected: Record<ISODate, Selection>;
  setSelected: React.Dispatch<React.SetStateAction<Record<ISODate, Selection>>>;
};

const PlannerCtx = React.createContext<PlannerState | null>(null);

export function PlannerProvider({ children }: { children: React.ReactNode }) {
  const [days, setDays] = usePersistentState<Record<ISODate, DayRecord>>(
    "planner:days",
    {},
  );
  const [focus, setFocus] = usePersistentState<ISODate>(
    "planner:focus",
    todayISO(),
  );
  const [selected, setSelected] = usePersistentState<Record<ISODate, Selection>>(
    "planner:selected",
    {},
  );

  const value = React.useMemo<PlannerState>(
    () => ({ days, setDays, focus, setFocus, selected, setSelected }),
    [days, focus, selected, setDays, setFocus, setSelected],
  );

  return React.createElement(
    PlannerCtx.Provider,
    { value },
    children as React.ReactNode,
  );
}

export function usePlannerContext(): PlannerState {
  const ctx = React.useContext(PlannerCtx);
  if (!ctx)
    throw new Error(
      "PlannerProvider is missing. Wrap your planner page with <PlannerProvider>.",
    );
  return ctx;
}
