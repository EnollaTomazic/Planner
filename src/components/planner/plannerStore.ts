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
  tasksById: Record<string, DayTask>;
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

function shallowEqualTasksById(
  computed: Record<string, DayTask>,
  existing: Record<string, DayTask>,
): boolean {
  const computedKeys = Object.keys(computed);
  const existingKeys = Object.keys(existing);
  if (computedKeys.length !== existingKeys.length) return false;
  for (const key of computedKeys) {
    if (existing[key] !== computed[key]) return false;
  }
  return true;
}

function shallowEqualTasksByProject(
  computed: Record<string, string[]>,
  existing: Record<string, string[]>,
): boolean {
  const computedKeys = Object.keys(computed);
  const existingKeys = Object.keys(existing);
  if (computedKeys.length !== existingKeys.length) return false;
  for (const key of computedKeys) {
    const nextIds = computed[key];
    const prevIds = existing[key];
    if (!prevIds || prevIds.length !== nextIds.length) return false;
    for (let i = 0; i < nextIds.length; i += 1) {
      if (prevIds[i] !== nextIds[i]) return false;
    }
  }
  return true;
}

export function ensureDay(map: Record<ISODate, DayRecord>, date: ISODate) {
  const existing = map[date];
  if (!existing)
    return { projects: [], tasks: [], tasksById: {}, tasksByProject: {} };
  let tasks = existing.tasks;
  let tasksChanged = false;
  if (!existing.tasks.every((t) => Array.isArray(t.images))) {
    tasksChanged = true;
    tasks = existing.tasks.map((t) => ({ ...t, images: t.images ?? [] }));
  }

  const computedTasksById: Record<string, DayTask> = {};
  const computedTasksByProject: Record<string, string[]> = {};
  for (const task of tasks) {
    computedTasksById[task.id] = task;
    if (task.projectId) {
      (computedTasksByProject[task.projectId] ??= []).push(task.id);
    }
  }

  const baseTasksById = existing.tasksById ?? {};
  const hasTasksById = Object.prototype.hasOwnProperty.call(
    existing,
    "tasksById",
  );
  const tasksById =
    hasTasksById &&
    shallowEqualTasksById(computedTasksById, baseTasksById)
      ? baseTasksById
      : computedTasksById;
  const tasksByIdChanged = tasksById !== baseTasksById;

  const baseTasksByProject = existing.tasksByProject ?? {};
  const hasTasksByProject = Object.prototype.hasOwnProperty.call(
    existing,
    "tasksByProject",
  );
  const tasksByProject =
    hasTasksByProject &&
    shallowEqualTasksByProject(computedTasksByProject, baseTasksByProject)
      ? baseTasksByProject
      : computedTasksByProject;
  const tasksByProjectChanged = tasksByProject !== baseTasksByProject;

  if (!tasksChanged && !tasksByIdChanged && !tasksByProjectChanged)
    return existing;

  return {
    ...existing,
    ...(tasksChanged ? { tasks } : {}),
    ...(tasksByIdChanged ? { tasksById } : {}),
    ...(tasksByProjectChanged ? { tasksByProject } : {}),
  };
}

function sanitizeDaysMap(map: Record<ISODate, DayRecord>) {
  let mutated = false;
  const next: Record<ISODate, DayRecord> = {};
  for (const iso of Object.keys(map)) {
    const ensured = ensureDay(map, iso);
    next[iso] = ensured;
    if (ensured !== map[iso]) mutated = true;
  }
  return mutated ? next : map;
}
type TaskIdMap = Record<ISODate, Record<string, DayTask>>;

type DaysState = {
  days: Record<ISODate, DayRecord>;
  setDays: React.Dispatch<React.SetStateAction<Record<ISODate, DayRecord>>>;
  tasksById: TaskIdMap;
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
  const [rawDays, setRawDays] = usePersistentState<Record<ISODate, DayRecord>>(
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

  const days = React.useMemo(
    () => sanitizeDaysMap(rawDays),
    [rawDays],
  );

  const tasksById = React.useMemo<TaskIdMap>(() => {
    const map: TaskIdMap = {};
    for (const [iso, record] of Object.entries(days)) {
      map[iso] = record.tasksById ?? {};
    }
    return map;
  }, [days]);

  React.useEffect(() => {
    if (!Object.is(rawDays, days)) {
      setRawDays(days);
    }
  }, [rawDays, days, setRawDays]);

  const setDays = React.useCallback<
    React.Dispatch<React.SetStateAction<Record<ISODate, DayRecord>>>
  >(
    (update) => {
      setRawDays((prev) => {
        const base = sanitizeDaysMap(prev);
        const next =
          typeof update === "function"
            ? (update as (
                current: Record<ISODate, DayRecord>,
              ) => Record<ISODate, DayRecord>)(base)
            : update;
        return sanitizeDaysMap(next);
      });
    },
    [setRawDays],
  );

  const daysValue = React.useMemo(
    () => ({ days, setDays, tasksById }),
    [days, setDays, tasksById],
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
