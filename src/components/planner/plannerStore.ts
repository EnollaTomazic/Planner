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
  doneCount: number;
  totalCount: number;
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

export function computeDayCounts(projects: Project[], tasks: DayTask[]) {
  let doneCount = 0;
  let totalCount = 0;
  for (const project of projects) {
    totalCount += 1;
    if (project.done) doneCount += 1;
  }
  for (const task of tasks) {
    totalCount += 1;
    if (task.done) doneCount += 1;
  }
  return { doneCount, totalCount };
}

export function buildTaskLookups(tasks: DayTask[]) {
  const tasksByProject: Record<string, string[]> = {};
  const tasksById: Record<string, DayTask> = {};
  for (const task of tasks) {
    tasksById[task.id] = task;
    const projectId = task.projectId;
    if (!projectId) continue;
    (tasksByProject[projectId] ??= []).push(task.id);
  }
  return { tasksById, tasksByProject };
}

function taskMapsEqual(
  a: Record<string, DayTask>,
  b: Record<string, DayTask>,
) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (a[key] !== b[key]) return false;
  }
  return true;
}

function projectMapsEqual(
  a: Record<string, string[]>,
  b: Record<string, string[]>,
) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    const arrA = a[key] ?? [];
    const arrB = b[key];
    if (!arrB || arrA.length !== arrB.length) return false;
    for (let i = 0; i < arrA.length; i += 1) {
      if (arrA[i] !== arrB[i]) return false;
    }
  }
  return true;
}

export function ensureDay(map: Record<ISODate, DayRecord>, date: ISODate) {
  const existing = map[date];
  if (!existing)
    return {
      projects: [],
      tasks: [],
      tasksById: {},
      tasksByProject: {},
      doneCount: 0,
      totalCount: 0,
    };
  let tasks = existing.tasks;
  let tasksChanged = false;
  if (!existing.tasks.every((t) => Array.isArray(t.images))) {
    tasksChanged = true;
    tasks = existing.tasks.map((t) => ({ ...t, images: t.images ?? [] }));
  }

  const { tasksById: nextTasksById, tasksByProject: nextTasksByProject } =
    buildTaskLookups(tasks);

  const baseTasksByProject = existing.tasksByProject ?? {};
  const baseTasksById = existing.tasksById ?? {};
  const tasksByProjectChanged =
    !Object.prototype.hasOwnProperty.call(existing, "tasksByProject") ||
    !projectMapsEqual(baseTasksByProject, nextTasksByProject);
  const tasksByIdChanged =
    !Object.prototype.hasOwnProperty.call(existing, "tasksById") ||
    !taskMapsEqual(baseTasksById, nextTasksById);

  const { doneCount, totalCount } = computeDayCounts(existing.projects, tasks);
  const countsChanged =
    existing.doneCount !== doneCount || existing.totalCount !== totalCount;

  if (
    !tasksChanged &&
    !tasksByProjectChanged &&
    !tasksByIdChanged &&
    !countsChanged
  )
    return existing;

  return {
    ...existing,
    ...(tasksChanged ? { tasks } : {}),
    ...(tasksByProjectChanged ? { tasksByProject: nextTasksByProject } : {}),
    ...(tasksByIdChanged ? { tasksById: nextTasksById } : {}),
    doneCount,
    totalCount,
  };
}

function sanitizeDay(
  map: Record<ISODate, DayRecord>,
  iso: ISODate,
): DayRecord | undefined {
  if (!Object.prototype.hasOwnProperty.call(map, iso)) return undefined;
  const ensured = ensureDay(map, iso);
  return ensured === map[iso] ? undefined : ensured;
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

  const days = rawDays;

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
        const next =
          typeof update === "function"
            ? (update as (
                current: Record<ISODate, DayRecord>,
              ) => Record<ISODate, DayRecord>)(prev)
            : update;

        if (Object.is(prev, next)) {
          return prev;
        }

        let result = next;
        let mutated = false;

        for (const iso of Object.keys(next)) {
          if (prev[iso] === next[iso]) continue;
          const ensured = sanitizeDay(result, iso);
          if (!ensured) continue;
          if (!mutated) {
            mutated = true;
            result = { ...result };
          }
          result[iso] = ensured;
        }

        return mutated ? result : next;
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
