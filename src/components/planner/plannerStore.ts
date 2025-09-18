"use client";

import "./style.css";
import * as React from "react";
import { usePersistentState } from "@/lib/db";
import { fromISODate, toISODate } from "@/lib/date";

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function decodeProject(value: unknown): Project | null {
  if (!isRecord(value)) return null;
  const id = value["id"];
  const name = value["name"];
  const done = value["done"];
  const createdAt = value["createdAt"];
  if (typeof id !== "string") return null;
  if (typeof name !== "string") return null;
  if (typeof done !== "boolean") return null;
  if (typeof createdAt !== "number" || !Number.isFinite(createdAt)) return null;
  return { id, name, done, createdAt };
}

function decodeImages(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const result: string[] = [];
  for (const item of value) {
    if (typeof item === "string") result.push(item);
  }
  return result;
}

function decodeTask(value: unknown): DayTask | null {
  if (!isRecord(value)) return null;
  const id = value["id"];
  const title = value["title"];
  const done = value["done"];
  const createdAt = value["createdAt"];
  if (typeof id !== "string") return null;
  if (typeof title !== "string") return null;
  if (typeof done !== "boolean") return null;
  if (typeof createdAt !== "number" || !Number.isFinite(createdAt)) return null;
  const projectId = value["projectId"];
  const images = decodeImages(value["images"]);
  return {
    id,
    title,
    done,
    createdAt,
    ...(typeof projectId === "string" ? { projectId } : {}),
    images,
  };
}

function decodeDayRecord(value: unknown): DayRecord | null {
  if (!isRecord(value)) return null;
  const rawProjects = value["projects"];
  const rawTasks = value["tasks"];
  const projects = Array.isArray(rawProjects)
    ? rawProjects.map(decodeProject).filter((p): p is Project => p !== null)
    : [];
  const tasks = Array.isArray(rawTasks)
    ? rawTasks.map(decodeTask).filter((t): t is DayTask => t !== null)
    : [];
  const { tasksById, tasksByProject } = buildTaskLookups(tasks);
  const { doneCount, totalCount } = computeDayCounts(projects, tasks);
  const focusValue = value["focus"];
  const notesValue = value["notes"];
  const hasFocus = typeof focusValue === "string";
  const hasNotes = typeof notesValue === "string";
  if (!projects.length && !tasks.length && !hasFocus && !hasNotes) {
    return null;
  }
  const day: DayRecord = {
    projects,
    tasks,
    tasksById,
    tasksByProject,
    doneCount,
    totalCount,
  };
  if (hasFocus) day.focus = focusValue as string;
  if (hasNotes) day.notes = notesValue as string;
  return day;
}

export function decodePlannerDays(value: unknown): Record<ISODate, DayRecord> {
  if (!isRecord(value)) return {};
  const result: Record<ISODate, DayRecord> = {};
  for (const [iso, rawDay] of Object.entries(value)) {
    const decoded = decodeDayRecord(rawDay);
    if (!decoded) continue;
    result[iso as ISODate] = decoded;
  }
  return result;
}

const FOCUS_PLACEHOLDER: ISODate = "";
const DEFAULT_MAX_DAY_AGE_DAYS = 365;

export type PruneOldDaysOptions = {
  maxAgeDays?: number;
  now?: Date | number | string;
};

export function pruneOldDays(
  days: Record<ISODate, DayRecord>,
  options: PruneOldDaysOptions = {},
) {
  const { maxAgeDays = DEFAULT_MAX_DAY_AGE_DAYS, now } = options;
  const normalizedMaxAge = Math.floor(maxAgeDays);
  if (!Number.isFinite(normalizedMaxAge) || normalizedMaxAge < 0) {
    return days;
  }

  let reference: Date;
  if (now === undefined) {
    reference = new Date();
  } else if (typeof now === "string") {
    reference = fromISODate(now) ?? new Date(now);
  } else {
    reference = new Date(now);
  }
  if (Number.isNaN(reference.getTime())) {
    return days;
  }

  const cutoff = new Date(reference.getTime());
  cutoff.setDate(cutoff.getDate() - normalizedMaxAge);
  cutoff.setHours(0, 0, 0, 0);
  const cutoffTime = cutoff.getTime();
  const ceiling = new Date(reference.getTime());
  ceiling.setHours(23, 59, 59, 999);
  const ceilingTime = ceiling.getTime();

  const keys = Object.keys(days);
  if (!keys.length) {
    return days;
  }

  type ParsedEntry = { iso: ISODate; time: number | null };
  const parsed: ParsedEntry[] = [];
  let hasValid = false;
  let oldestTime = Number.POSITIVE_INFINITY;
  let newestTime = Number.NEGATIVE_INFINITY;

  for (const key of keys) {
    const isoDate = fromISODate(key);
    if (!isoDate) {
      parsed.push({ iso: key as ISODate, time: null });
      continue;
    }
    const time = isoDate.getTime();
    parsed.push({ iso: key as ISODate, time });
    hasValid = true;
    if (time < oldestTime) {
      oldestTime = time;
    }
    if (time > newestTime) {
      newestTime = time;
    }
  }

  if (hasValid && oldestTime >= cutoffTime && newestTime <= ceilingTime) {
    return days;
  }

  let result = days;
  let mutated = false;

  for (const { iso, time } of parsed) {
    if (time === null || time >= cutoffTime) {
      continue;
    }
    if (!mutated) {
      mutated = true;
      result = { ...days };
    }
    delete result[iso];
  }

  return mutated ? result : days;
}

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

function cleanupSelections(
  selected: Record<ISODate, Selection>,
  days: Record<ISODate, DayRecord>,
) {
  let result = selected;
  let mutated = false;

  for (const iso of Object.keys(selected)) {
    const selection = selected[iso];
    const day = days[iso];
    const projectId = selection?.projectId;
    const taskId = selection?.taskId;

    if (!day || (!projectId && !taskId)) {
      if (!mutated) {
        mutated = true;
        result = { ...result };
      }
      delete result[iso];
      continue;
    }

    if (
      projectId &&
      !day.projects.some((project) => project.id === projectId)
    ) {
      if (!mutated) {
        mutated = true;
        result = { ...result };
      }
      delete result[iso];
      continue;
    }

    if (
      taskId &&
      !(day.tasksById?.[taskId] ?? day.tasks.find((task) => task.id === taskId))
    ) {
      if (!mutated) {
        mutated = true;
        result = { ...result };
      }
      delete result[iso];
    }
  }

  return mutated ? result : selected;
}
type TaskIdMap = Record<ISODate, Record<string, DayTask>>;

type DaysState = {
  days: Record<ISODate, DayRecord>;
  setDays: React.Dispatch<React.SetStateAction<Record<ISODate, DayRecord>>>;
  tasksById: TaskIdMap;
};

type FocusState = {
  focus: ISODate;
  setFocus: React.Dispatch<React.SetStateAction<ISODate>>;
};

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
    { decode: decodePlannerDays },
  );
  const [focus, setFocus] = usePersistentState<ISODate>(
    "planner:focus",
    FOCUS_PLACEHOLDER,
  );
  const [selectedState, setSelectedState] = usePersistentState<
    Record<ISODate, Selection>
  >("planner:selected", {});

  const days = rawDays;

  React.useEffect(() => {
    if (focus === FOCUS_PLACEHOLDER) {
      setFocus((prev) =>
        prev === FOCUS_PLACEHOLDER ? todayISO() : prev,
      );
    }
  }, [focus, setFocus]);

  const selected = React.useMemo(
    () => cleanupSelections(selectedState, days),
    [selectedState, days],
  );

  React.useEffect(() => {
    if (!Object.is(selected, selectedState)) {
      setSelectedState(selected);
    }
  }, [selected, selectedState, setSelectedState]);

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

        let result = pruneOldDays(next);
        let mutated = !Object.is(result, next);

        for (const iso of Object.keys(result)) {
          if (prev[iso] === result[iso]) continue;
          const ensured = sanitizeDay(result, iso);
          if (!ensured) continue;
          if (!mutated) {
            mutated = true;
            result = { ...result };
          }
          result[iso] = ensured;
        }

        if (!mutated && Object.is(prev, result)) {
          return prev;
        }

        return result;
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
  const setSelected = React.useCallback<
    React.Dispatch<React.SetStateAction<Record<ISODate, Selection>>>
  >(
    (update) => {
      setSelectedState((prev) => {
        const next =
          typeof update === "function"
            ? (update as (
                current: Record<ISODate, Selection>,
              ) => Record<ISODate, Selection>)(prev)
            : update;

        if (Object.is(prev, next)) {
          return prev;
        }
        return next;
      });
    },
    [setSelectedState],
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
