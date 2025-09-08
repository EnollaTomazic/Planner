"use client";

import * as React from "react";
import { addDays, toISODate, weekRangeFromISO } from "@/lib/date";
import {
  ensureDay,
  todayISO,
  usePlannerStore,
  type DayRecord,
  type ISODate,
} from "./plannerStore";
import { makeCrud } from "./plannerCrud";

export type { ISODate, DayRecord, Project, DayTask } from "./plannerStore";

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
    for (let i = 0; i < 7; i++) days.push(toISODate(addDays(start, i)));
    const today = todayISO();
    const isToday = (d: ISODate) => d === today;
    return { start, end, days, isToday } as const;
  }, [iso]);
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

  const crud = React.useMemo(() => makeCrud(focus, upsertDay), [focus, upsertDay]);

  return {
    days,
    focus,
    setFocus,
    day: getDay(focus),
    getDay,
    setDay,
    upsertDay,
    ...crud,
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
        [iso]: projectId ? { projectId } : {},
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
        [iso]: { taskId, projectId },
      }));
    },
    [iso, setSelected, days],
  );

  return [current, set] as const;
}
