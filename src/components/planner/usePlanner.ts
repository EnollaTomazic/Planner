"use client";

/**
 * Planner store (Lavender-Glitch)
 * - Central day data + per-day selection state (projectId | taskId)
 * - Single source of truth for cross-component selection
 */

import "./style.css";
import * as React from "react";
import { useLocalDB, uid } from "@/lib/db";
import { toISO, addDays, weekRangeFromISO } from "@/lib/date";
import {
  addProject as dayAddProject,
  renameProject as dayRenameProject,
  toggleProject as dayToggleProject,
  removeProject as dayRemoveProject,
  addTask as dayAddTask,
  renameTask as dayRenameTask,
  toggleTask as dayToggleTask,
  removeTask as dayRemoveTask,
} from "./dayCrud";

/* ───────────────── Types ───────────────── */
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

type Selection = {
  projectId?: string; // if present, taskId must be undefined
  taskId?: string; // if present, projectId is auto-derived for that task
};

/* ───────────────── Date helpers ───────────────── */
function todayISO(): ISODate {
  return toISO(new Date());
}

/* ───────────────── Context ───────────────── */
type PlannerState = {
  days: Record<ISODate, DayRecord>;
  setDays: React.Dispatch<React.SetStateAction<Record<ISODate, DayRecord>>>;
  focus: ISODate;
  setFocus: (iso: ISODate) => void;

  // NEW: per-day selection map (projectId | taskId)
  selected: Record<ISODate, Selection>;
  setSelected: React.Dispatch<React.SetStateAction<Record<ISODate, Selection>>>;
};

const PlannerCtx = React.createContext<PlannerState | null>(null);

export function PlannerProvider({ children }: { children: React.ReactNode }) {
  const [days, setDays] = useLocalDB<Record<ISODate, DayRecord>>(
    "planner:days",
    {},
  );
  const [focus, setFocus] = useLocalDB<ISODate>("planner:focus", todayISO());
  const [selected, setSelected] = useLocalDB<Record<ISODate, Selection>>(
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

function usePlannerStore(): PlannerState {
  const ctx = React.useContext(PlannerCtx);
  if (!ctx)
    throw new Error(
      "PlannerProvider is missing. Wrap your planner page with <PlannerProvider>.",
    );
  return ctx;
}

/* ───────────────── Public week + focus ───────────────── */
export function useFocusDate() {
  const { focus, setFocus } = usePlannerStore();
  const today = todayISO();
  return { iso: focus, setIso: setFocus, today } as const;
}
export function useWeek(iso: ISODate) {
  return React.useMemo(() => {
    const { start, end } = weekRangeFromISO(iso);
    const days: ISODate[] = [];
    for (let i = 0; i < 7; i++) days.push(toISO(addDays(start, i)));
    const today = todayISO();
    const isToday = (d: ISODate) => d === today;
    return { start, end, days, isToday } as const;
  }, [iso]);
}

/* ───────────────── Internals ───────────────── */
function ensureDay(map: Record<ISODate, DayRecord>, date: ISODate) {
  return map[date] ?? { projects: [], tasks: [] };
}
function writeThroughLegacy(
  storage: Storage,
  days: Record<ISODate, DayRecord>,
  iso: ISODate,
) {
  try {
    const cur = days[iso] ?? { projects: [], tasks: [] };
    storage.setItem("planner:projects", JSON.stringify(cur.projects));
    storage.setItem("planner:tasks", JSON.stringify(cur.tasks));
  } catch {
    /* ignore */
  }
}

/* ───────────────── High-level API ───────────────── */
export function usePlanner() {
  const { days, setDays, focus, setFocus } = usePlannerStore();

  const setDaysAndMirror = React.useCallback(
    (
      date: ISODate,
      updater: (prev: Record<ISODate, DayRecord>) => Record<ISODate, DayRecord>,
    ) => {
      setDays((prev) => {
        const nextMap = updater(prev);
        queueMicrotask(() => {
          if (typeof window !== "undefined")
            writeThroughLegacy(window.localStorage, nextMap, date);
        });
        return nextMap;
      });
    },
    [setDays],
  );

  const upsertDay = React.useCallback(
    (date: ISODate, fn: (d: DayRecord) => DayRecord) => {
      setDaysAndMirror(date, (prev) => {
        const base = ensureDay(prev, date);
        const next = fn(base);
        return { ...prev, [date]: next };
      });
    },
    [setDaysAndMirror],
  );

  const getDay = React.useCallback(
    (date: ISODate): DayRecord => ensureDay(days, date),
    [days],
  );

  const setDay = React.useCallback(
    (date: ISODate, next: DayRecord) => {
      setDaysAndMirror(date, (prev) => ({ ...prev, [date]: next }));
    },
    [setDaysAndMirror],
  );

  // Focus-scoped CRUD
  const addProject = React.useCallback(
    (name: string) => {
      const id = uid("proj");
      upsertDay(focus, (d) => dayAddProject(d, id, name));
      return id;
    },
    [focus, upsertDay],
  );

  const renameProject = React.useCallback(
    (id: string, name: string) =>
      upsertDay(focus, (d) => dayRenameProject(d, id, name)),
    [focus, upsertDay],
  );

  const toggleProject = React.useCallback(
    (id: string) => upsertDay(focus, (d) => dayToggleProject(d, id)),
    [focus, upsertDay],
  );

  const removeProject = React.useCallback(
    (id: string) => upsertDay(focus, (d) => dayRemoveProject(d, id)),
    [focus, upsertDay],
  );

  const addTask = React.useCallback(
    (title: string, projectId?: string) => {
      const id = uid("task");
      upsertDay(focus, (d) => dayAddTask(d, id, title, projectId));
      return id;
    },
    [focus, upsertDay],
  );

  const renameTask = React.useCallback(
    (id: string, next: string) =>
      upsertDay(focus, (d) => dayRenameTask(d, id, next)),
    [focus, upsertDay],
  );

  const toggleTask = React.useCallback(
    (id: string) => upsertDay(focus, (d) => dayToggleTask(d, id)),
    [focus, upsertDay],
  );

  const removeTask = React.useCallback(
    (id: string) => upsertDay(focus, (d) => dayRemoveTask(d, id)),
    [focus, upsertDay],
  );

  const setNotes = React.useCallback(
    (notes: string) => upsertDay(focus, (d) => ({ ...d, notes })),
    [focus, upsertDay],
  );

  return {
    // raw store
    days,
    focus,
    setFocus,

    // day accessors
    day: getDay(focus),
    getDay,
    setDay,
    upsertDay,

    // focus-scoped CRUD
    addProject,
    renameProject,
    toggleProject,
    removeProject,
    addTask,
    renameTask,
    toggleTask,
    removeTask,
    setNotes,
  } as const;
}

/* ───────────────── Day-scoped view ───────────────── */
export function useDay(iso: ISODate) {
  const { days, upsertDay } = usePlanner();

  const rec: DayRecord = React.useMemo(() => ensureDay(days, iso), [days, iso]);

  const tasks = React.useMemo(
    () =>
      rec.tasks.map((t) => ({
        id: t.id,
        title: t.title,
        text: t.title, // adapter for UIs expecting `text`
        done: t.done,
        projectId: t.projectId,
        createdAt: t.createdAt,
      })),
    [rec.tasks],
  );

  const addProject = (name: string) => {
    const id = uid("proj");
    upsertDay(iso, (d) => dayAddProject(d, id, name));
    return id;
  };

  const renameProject = (id: string, name: string) =>
    upsertDay(iso, (d) => dayRenameProject(d, id, name));

  const toggleProject = (id: string) =>
    upsertDay(iso, (d) => dayToggleProject(d, id));

  const deleteProject = (id: string) =>
    upsertDay(iso, (d) => dayRemoveProject(d, id));

  const addTask = (title: string, projectId?: string) => {
    const id = uid("task");
    upsertDay(iso, (d) => dayAddTask(d, id, title, projectId));
    return id;
  };

  const renameTask = (id: string, next: string) =>
    upsertDay(iso, (d) => dayRenameTask(d, id, next));

  const toggleTask = (id: string) =>
    upsertDay(iso, (d) => dayToggleTask(d, id));

  const deleteTask = (id: string) =>
    upsertDay(iso, (d) => dayRemoveTask(d, id));

  const doneTasks = React.useMemo(
    () => tasks.filter((t) => t.done).length,
    [tasks],
  );
  const totalTasks = tasks.length;

  return {
    projects: rec.projects,
    tasks,
    addProject,
    renameProject,
    deleteProject,
    toggleProject,
    addTask,
    renameTask,
    deleteTask,
    toggleTask,
    doneTasks,
    totalTasks,
  } as const;
}

/* ───────────────── Selection hooks (single-select per day) ───────────────── */

export function useSelectedProject(iso: ISODate) {
  const { selected, setSelected } = usePlannerStore();
  const current = selected[iso]?.projectId ?? "";
  const set = React.useCallback(
    (projectId: string) => {
      setSelected((prev) => ({
        ...prev,
        [iso]: projectId ? { projectId } : {}, // clears taskId implicitly
      }));
    },
    [iso, setSelected],
  );
  return [current, set] as const;
}

export function useSelectedTask(iso: ISODate) {
  const { selected, setSelected, days } = usePlannerStore();
  const current = selected[iso]?.taskId ?? "";

  const set = React.useCallback(
    (taskId: string) => {
      if (!taskId) {
        setSelected((prev) => ({ ...prev, [iso]: {} }));
        return;
      }
      const rec = ensureDay(days, iso);
      const projectId = rec.tasks.find((t) => t.id === taskId)?.projectId;
      setSelected((prev) => ({
        ...prev,
        [iso]: { taskId, projectId }, // selecting a task auto-selects its project
      }));
    },
    [iso, setSelected, days],
  );

  return [current, set] as const;
}
