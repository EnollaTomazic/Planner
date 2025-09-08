"use client";

import * as React from "react";
import {
  ensureDay,
  usePlannerStore as useStore,
  type DayRecord,
  type ISODate,
} from "./plannerStore";
import { makeCrud } from "./plannerCrud";

export type { ISODate, DayRecord, Project, DayTask } from "./plannerStore";

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

/**
 * Provides persistent planner state and CRUD helpers for the focused day.
 * @returns Planner state object with CRUD operations.
 */
export function usePlannerStore() {
  const { days, setDays, focus, setFocus } = useStore();

  const setDaysAndMirror = React.useCallback(
    (
      date: ISODate,
      updater: (prev: Record<ISODate, DayRecord>) => Record<ISODate, DayRecord>,
    ) => {
      setDays(prev => {
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
      setDaysAndMirror(date, prev => {
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
      setDaysAndMirror(date, prev => ({ ...prev, [date]: next }));
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
