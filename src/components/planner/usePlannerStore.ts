"use client";

import * as React from "react";
import {
  ensureDay,
  useDays,
  useFocus,
  type DayRecord,
  type ISODate,
  type Project,
  type DayTask,
} from "./plannerStore";
import { makeCrud } from "./plannerCrud";
import { parseJSON } from "@/lib/local-bootstrap";

export type { ISODate, DayRecord, Project, DayTask } from "./plannerStore";

let legacyMigrated = false;
function migrateLegacy(
  days: Record<ISODate, DayRecord>,
  iso: ISODate,
): Record<ISODate, DayRecord> {
  if (legacyMigrated || typeof window === "undefined") return days;
  const rawProjects = window.localStorage.getItem("planner:projects");
  const rawTasks = window.localStorage.getItem("planner:tasks");
  if (!rawProjects && !rawTasks) {
    legacyMigrated = true;
    return days;
  }
  const projects = parseJSON<Project[]>(rawProjects);
  const tasks = parseJSON<DayTask[]>(rawTasks);
  const next = { ...days } as Record<ISODate, DayRecord>;
  const cur = ensureDay(next, iso);
  if (projects) cur.projects = projects;
  if (tasks) {
    cur.tasks = tasks;
    const map: Record<string, string[]> = {};
    for (const t of tasks) {
      if (t.projectId) (map[t.projectId] ??= []).push(t.id);
    }
    cur.tasksByProject = map;
  }
  next[iso] = cur;
  try {
    window.localStorage.removeItem("planner:projects");
    window.localStorage.removeItem("planner:tasks");
  } catch {
    /* ignore */
  }
  legacyMigrated = true;
  return next;
}

/**
 * Provides persistent planner state and CRUD helpers for the focused day.
 * @returns Planner state object with CRUD operations.
 */
export function usePlannerStore() {
  const { days, setDays } = useDays();
  const { focus, setFocus } = useFocus();

  const applyDaysUpdate = React.useCallback(
    (
      updater: (prev: Record<ISODate, DayRecord>) => Record<ISODate, DayRecord>,
    ) => {
      setDays(updater);
    },
    [setDays],
  );

  React.useEffect(() => {
    if (!legacyMigrated) {
      if (typeof window === "undefined") return;

      const rawProjects = window.localStorage.getItem("planner:projects");
      const rawTasks = window.localStorage.getItem("planner:tasks");

      if (!rawProjects && !rawTasks) {
        legacyMigrated = true;
        return;
      }

      applyDaysUpdate((prev) => migrateLegacy(prev, focus));
      legacyMigrated = true;
    }
  }, [applyDaysUpdate, focus]);

  const upsertDay = React.useCallback(
    (date: ISODate, fn: (d: DayRecord) => DayRecord) => {
      applyDaysUpdate((prev) => {
        const base = ensureDay(prev, date);
        const next = fn(base);
        return { ...prev, [date]: next };
      });
    },
    [applyDaysUpdate],
  );

  const getDay = React.useCallback(
    (date: ISODate): DayRecord => ensureDay(days, date),
    [days],
  );

  const setDay = React.useCallback(
    (date: ISODate, next: DayRecord) => {
      applyDaysUpdate((prev) => ({ ...prev, [date]: next }));
    },
    [applyDaysUpdate],
  );

  const crud = React.useMemo(
    () => makeCrud(focus, upsertDay),
    [focus, upsertDay],
  );

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
