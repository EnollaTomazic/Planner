"use client";

import * as React from "react";
import {
  ensureDay,
  computeDayCounts,
  buildTaskLookups,
  useDays,
  useFocus,
  type DayRecord,
  type ISODate,
  type Project,
  type DayTask,
} from "./plannerStore";
import { makeCrud } from "./plannerCrud";
import { readLocal, removeLocal } from "@/lib/db";

export type { ISODate, DayRecord, Project, DayTask } from "./plannerStore";

type LegacySnapshot = {
  projects: Project[] | null;
  tasks: DayTask[] | null;
};

const LEGACY_PROJECTS_KEY = "planner:projects";
const LEGACY_TASKS_KEY = "planner:tasks";

let legacyMigrated = false;
function migrateLegacy(
  days: Record<ISODate, DayRecord>,
  iso: ISODate,
  legacy?: LegacySnapshot,
): Record<ISODate, DayRecord> {
  if (legacyMigrated || typeof window === "undefined") return days;
  const projects =
    legacy?.projects ?? readLocal<Project[]>(LEGACY_PROJECTS_KEY);
  const tasks = legacy?.tasks ?? readLocal<DayTask[]>(LEGACY_TASKS_KEY);
  if (!projects && !tasks) {
    legacyMigrated = true;
    return days;
  }
  const next = { ...days } as Record<ISODate, DayRecord>;
  const ensured = ensureDay(next, iso);
  let updated = ensured;
  if (projects) {
    updated = { ...updated, projects };
  }
  if (tasks) {
    updated = { ...updated, tasks, ...buildTaskLookups(tasks) };
  }
  const { doneCount, totalCount } = computeDayCounts(
    updated.projects,
    updated.tasks,
  );
  next[iso] = { ...updated, doneCount, totalCount };
  removeLocal(LEGACY_PROJECTS_KEY);
  removeLocal(LEGACY_TASKS_KEY);
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
      if (!focus) return;
      const projects = readLocal<Project[]>(LEGACY_PROJECTS_KEY);
      const tasks = readLocal<DayTask[]>(LEGACY_TASKS_KEY);

      if (!projects && !tasks) {
        legacyMigrated = true;
        return;
      }

      applyDaysUpdate((prev) =>
        migrateLegacy(prev, focus, { projects, tasks }),
      );
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
  const { setFocus: setDayFocus, ...restCrud } = crud;

  return {
    days,
    focus,
    setFocus,
    day: getDay(focus),
    getDay,
    setDay,
    upsertDay,
    setDayFocus,
    ...restCrud,
  } as const;
}
