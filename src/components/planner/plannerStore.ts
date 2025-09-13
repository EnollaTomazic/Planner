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
  images: string[];
};

export type DayRecord = {
  projects: Project[];
  tasks: DayTask[];
  tasksByProject: Record<string, string[]>;
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
  const existing = map[date];
  if (!existing) return { projects: [], tasks: [], tasksByProject: {} };
  if (existing.tasks.every((t) => Array.isArray(t.images))) return existing;
  return {
    ...existing,
    tasks: existing.tasks.map((t) => ({ ...t, images: t.images ?? [] })),
  };
}
type DaysState = {
  days: Record<ISODate, DayRecord>;
  setDays: React.Dispatch<React.SetStateAction<Record<ISODate, DayRecord>>>;
};

type FocusState = { focus: ISODate; setFocus: (iso: ISODate) => void };

type SelectionState = {
  selected: Record<ISODate, Selection>;
  setSelected: React.Dispatch<React.SetStateAction<Record<ISODate, Selection>>>;
};

const DaysContext = React.createContext<DaysState | null>(null);
const FocusContext = React.createContext<FocusState | null>(null);
const SelectionContext = React.createContext<SelectionState | null>(null);

export function PlannerProvider({ children }: { children: React.ReactNode }) {
  const [days, setDays] = usePersistentState<Record<ISODate, DayRecord>>(
    "planner:days",
    {},
  );
  const [focus, setFocus] = usePersistentState<ISODate>(
    "planner:focus",
    todayISO(),
  );
  const [selected, setSelected] = usePersistentState<
    Record<ISODate, Selection>
  >("planner:selected", {});

  const daysValue = React.useMemo(
    () => ({ days, setDays }),
    [days, setDays],
  );
  const focusValue = React.useMemo(
    () => ({ focus, setFocus }),
    [focus, setFocus],
  );
  const selectionValue = React.useMemo(
    () => ({ selected, setSelected }),
    [selected, setSelected],
  );

  return React.createElement(
    DaysContext.Provider,
    { value: daysValue },
    React.createElement(
      FocusContext.Provider,
      { value: focusValue },
      React.createElement(
        SelectionContext.Provider,
        { value: selectionValue },
        children as React.ReactNode,
      ),
    ),
  );
}

export function useDays(): DaysState {
  const ctx = React.useContext(DaysContext);
  if (!ctx)
    throw new Error(
      "PlannerProvider missing. Wrap your planner page with <PlannerProvider>.",
    );
  return ctx;
}

export function useFocus(): FocusState {
  const ctx = React.useContext(FocusContext);
  if (!ctx)
    throw new Error(
      "PlannerProvider missing. Wrap your planner page with <PlannerProvider>.",
    );
  return ctx;
}

export function useSelection(): SelectionState {
  const ctx = React.useContext(SelectionContext);
  if (!ctx)
    throw new Error(
      "PlannerProvider missing. Wrap your planner page with <PlannerProvider>.",
    );
  return ctx;
}
