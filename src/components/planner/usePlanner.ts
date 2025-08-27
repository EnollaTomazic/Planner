"use client";

/**
 * Planner store (Lavender-Glitch)
 * - Central day data + per-day selection state (projectId | taskId)
 * - Single source of truth for cross-component selection
 */

import "./style.css";
import * as React from "react";
import { useLocalDB, uid } from "@/lib/db";

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
  taskId?: string;    // if present, projectId is auto-derived for that task
};

/* ───────────────── Date helpers ───────────────── */
export function toISO(d: Date): ISODate {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function todayISO(): ISODate { return toISO(new Date()); }
export function addDays(date: Date, n: number): Date { const d = new Date(date); d.setDate(d.getDate() + n); return d; }
function mondayStartOfWeek(d: Date): Date { const copy = new Date(d); const day = copy.getDay(); const diff = (day + 6) % 7; copy.setHours(0,0,0,0); return addDays(copy, -diff); }
function sundayEndOfWeek(d: Date): Date { const start = mondayStartOfWeek(d); const end = addDays(start, 6); end.setHours(23,59,59,999); return end; }
export function weekRangeFromISO(iso: ISODate): { start: Date; end: Date } { const d = new Date(`${iso}T00:00:00`); return { start: mondayStartOfWeek(d), end: sundayEndOfWeek(d) }; }

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
  const [days, setDays] = useLocalDB<Record<ISODate, DayRecord>>("planner:days", {});
  const [focus, setFocus] = useLocalDB<ISODate>("planner:focus", todayISO());
  const [selected, setSelected] = useLocalDB<Record<ISODate, Selection>>("planner:selected", {});

  const value = React.useMemo<PlannerState>(
    () => ({ days, setDays, focus, setFocus, selected, setSelected }),
    [days, focus, selected, setDays, setFocus, setSelected]
  );

  return React.createElement(PlannerCtx.Provider, { value }, children as React.ReactNode);
}

function usePlannerStore(): PlannerState {
  const ctx = React.useContext(PlannerCtx);
  if (!ctx) throw new Error("PlannerProvider is missing. Wrap your planner page with <PlannerProvider>.");
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
function writeThroughLegacy(storage: Storage, days: Record<ISODate, DayRecord>, iso: ISODate) {
  try {
    const cur = days[iso] ?? { projects: [], tasks: [] };
    storage.setItem("planner:projects", JSON.stringify(cur.projects));
    storage.setItem("planner:tasks", JSON.stringify(cur.tasks));
  } catch { /* ignore */ }
}

/* ───────────────── High-level API ───────────────── */
export function usePlanner() {
  const { days, setDays, focus, setFocus } = usePlannerStore();

  const setDaysAndMirror = React.useCallback(
    (date: ISODate, updater: (prev: Record<ISODate, DayRecord>) => Record<ISODate, DayRecord>) => {
      setDays(prev => {
        const nextMap = updater(prev);
        queueMicrotask(() => {
          if (typeof window !== "undefined") writeThroughLegacy(window.localStorage, nextMap, date);
        });
        return nextMap;
      });
    },
    [setDays]
  );

  const upsertDay = React.useCallback(
    (date: ISODate, fn: (d: DayRecord) => DayRecord) => {
      setDaysAndMirror(date, prev => {
        const base = ensureDay(prev, date);
        const next = fn(base);
        return { ...prev, [date]: next };
      });
    },
    [setDaysAndMirror]
  );

  const getDay = React.useCallback((date: ISODate): DayRecord => ensureDay(days, date), [days]);

  const setDay = React.useCallback(
    (date: ISODate, next: DayRecord) => {
      setDaysAndMirror(date, prev => ({ ...prev, [date]: next }));
    },
    [setDaysAndMirror]
  );

  // Focus-scoped CRUD
  const addProject = React.useCallback(
    (name: string) => {
      const id = uid("proj");
      const title = name.trim();
      if (!title) return id;
      const createdAt = Date.now();
      upsertDay(focus, d => ({
        ...d,
        projects: [...d.projects, { id, name: title, done: false, createdAt }],
      }));
      return id;
    },
    [focus, upsertDay]
  );

  const renameProject = React.useCallback(
    (id: string, name: string) =>
      upsertDay(focus, d => ({ ...d, projects: d.projects.map(p => (p.id === id ? { ...p, name } : p)) })),
    [focus, upsertDay]
  );

  const toggleProject = React.useCallback(
    (id: string) =>
      upsertDay(focus, d => {
        const wasDone = d.projects.find(p => p.id === id)?.done ?? false;
        const projects = d.projects.map(p => (p.id === id ? { ...p, done: !wasDone } : p));
        const tasks = d.tasks.map(t => (t.projectId === id ? { ...t, done: !wasDone } : t));
        return { ...d, projects, tasks };
      }),
    [focus, upsertDay]
  );

  const removeProject = React.useCallback(
    (id: string) =>
      upsertDay(focus, d => ({
        ...d,
        projects: d.projects.filter(p => p.id !== id),
        tasks: d.tasks.filter(t => t.projectId !== id),
      })),
    [focus, upsertDay]
  );

  const addTask = React.useCallback(
    (title: string, projectId?: string) => {
      const id = uid("task");
      const name = title.trim();
      if (!name) return id;
      const createdAt = Date.now();
      upsertDay(focus, d => ({
        ...d,
        tasks: [...d.tasks, { id, title: name, done: false, projectId, createdAt }],
      }));
      return id;
    },
    [focus, upsertDay]
  );

  const renameTask = React.useCallback(
    (id: string, next: string) => {
      const title = next.trim(); if (!title) return;
      upsertDay(focus, d => ({ ...d, tasks: d.tasks.map(t => (t.id === id ? { ...t, title } : t)) }));
    },
    [focus, upsertDay]
  );

  const toggleTask = React.useCallback(
    (id: string) =>
      upsertDay(focus, d => ({ ...d, tasks: d.tasks.map(t => (t.id === id ? { ...t, done: !t.done } : t)) })),
    [focus, upsertDay]
  );

  const removeTask = React.useCallback(
    (id: string) =>
      upsertDay(focus, d => ({ ...d, tasks: d.tasks.filter(t => t.id !== id) })),
    [focus, upsertDay]
  );

  const setNotes = React.useCallback(
    (notes: string) => upsertDay(focus, d => ({ ...d, notes })),
    [focus, upsertDay]
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
      rec.tasks.map(t => ({
        id: t.id,
        title: t.title,
        text: t.title, // adapter for UIs expecting `text`
        done: t.done,
        projectId: t.projectId,
        createdAt: t.createdAt,
      })),
    [rec.tasks]
  );

  const addProject = (name: string) => {
    const id = uid("proj");
    const title = name.trim();
    if (!title) return id;
    const createdAt = Date.now();
    upsertDay(iso, d => ({ ...d, projects: [...d.projects, { id, name: title, done: false, createdAt }] }));
    return id;
  };

  const renameProject = (id: string, name: string) =>
    upsertDay(iso, d => ({ ...d, projects: d.projects.map(p => (p.id === id ? { ...p, name } : p)) }));

  const toggleProject = (id: string) =>
    upsertDay(iso, d => {
      const wasDone = d.projects.find(p => p.id === id)?.done ?? false;
      const projects = d.projects.map(p => (p.id === id ? { ...p, done: !wasDone } : p));
      const tasks2 = d.tasks.map(t => (t.projectId === id ? { ...t, done: !wasDone } : t));
      return { ...d, projects, tasks: tasks2 };
    });

  const deleteProject = (id: string) =>
    upsertDay(iso, d => ({
      ...d,
      projects: d.projects.filter(p => p.id !== id),
      tasks: d.tasks.filter(t => t.projectId !== id),
    }));

  const addTask = (title: string, projectId?: string) => {
    const id = uid("task");
    const name = title.trim();
    if (!name) return id;
    const createdAt = Date.now();
    upsertDay(iso, d => ({ ...d, tasks: [...d.tasks, { id, title: name, done: false, projectId, createdAt }] }));
    return id;
  };

  const renameTask = (id: string, next: string) => {
    const title = next.trim(); if (!title) return;
    upsertDay(iso, d => ({ ...d, tasks: d.tasks.map(t => (t.id === id ? { ...t, title } : t)) }));
  };

  const toggleTask = (id: string) =>
    upsertDay(iso, d => ({ ...d, tasks: d.tasks.map(t => (t.id === id ? { ...t, done: !t.done } : t)) }));

  const deleteTask = (id: string) =>
    upsertDay(iso, d => ({ ...d, tasks: d.tasks.filter(t => t.id !== id) }));

  const doneTasks = React.useMemo(() => tasks.filter(t => t.done).length, [tasks]);
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
      setSelected(prev => ({
        ...prev,
        [iso]: projectId ? { projectId } : {}, // clears taskId implicitly
      }));
    },
    [iso, setSelected]
  );
  return [current, set] as const;
}

export function useSelectedTask(iso: ISODate) {
  const { selected, setSelected, days } = usePlannerStore();
  const current = selected[iso]?.taskId ?? "";

  const set = React.useCallback(
    (taskId: string) => {
      if (!taskId) {
        setSelected(prev => ({ ...prev, [iso]: {} }));
        return;
      }
      const rec = ensureDay(days, iso);
      const projectId = rec.tasks.find(t => t.id === taskId)?.projectId;
      setSelected(prev => ({
        ...prev,
        [iso]: { taskId, projectId }, // selecting a task auto-selects its project
      }));
    },
    [iso, setSelected, days]
  );

  return [current, set] as const;
}
