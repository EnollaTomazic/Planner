"use client";

import * as React from "react";
import {
  ensureDay,
  computeDayCounts,
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

function migrateLegacy(
  days: Record<ISODate, DayRecord>,
  iso: ISODate,
  migrationState: React.MutableRefObject<boolean>,
  legacy?: LegacySnapshot,
): Record<ISODate, DayRecord> {
  if (migrationState.current || typeof window === "undefined") return days;
  const projects =
    legacy?.projects ?? readLocal<Project[]>(LEGACY_PROJECTS_KEY);
  const tasks = legacy?.tasks ?? readLocal<DayTask[]>(LEGACY_TASKS_KEY);
  if (!projects && !tasks) {
    migrationState.current = true;
    return days;
  }
  const next = { ...days } as Record<ISODate, DayRecord>;
  const ensured = ensureDay(next, iso);
  let updated = ensured;
  if (projects) {
    updated = { ...updated, projects };
  }
  if (tasks) {
    const map: Record<string, string[]> = {};
    const byId: Record<string, DayTask> = {};
    for (const t of tasks) {
      byId[t.id] = t;
      if (t.projectId) (map[t.projectId] ??= []).push(t.id);
    }
    updated = { ...updated, tasks, tasksById: byId, tasksByProject: map };
  }
  const { doneCount, totalCount } = computeDayCounts(
    updated.projects,
    updated.tasks,
  );
  next[iso] = { ...updated, doneCount, totalCount };
  removeLocal(LEGACY_PROJECTS_KEY);
  removeLocal(LEGACY_TASKS_KEY);
  migrationState.current = true;
  return next;
}

/**
 * Provides persistent planner state and CRUD helpers for the focused day.
 * @returns Planner state object with CRUD operations.
 */
export function usePlannerStore() {
  const { days, setDays } = useDays();
  const { focus, setFocus } = useFocus();
  const legacyMigratedRef = React.useRef(false);

  const applyDaysUpdate = React.useCallback(
    (
      updater: (prev: Record<ISODate, DayRecord>) => Record<ISODate, DayRecord>,
    ) => {
      setDays(updater);
    },
    [setDays],
  );

  React.useEffect(() => {
    if (legacyMigratedRef.current) return;
    if (!focus) return;
    const projects = readLocal<Project[]>(LEGACY_PROJECTS_KEY);
    const tasks = readLocal<DayTask[]>(LEGACY_TASKS_KEY);

    if (!projects && !tasks) {
      legacyMigratedRef.current = true;
      return;
    }

    applyDaysUpdate((prev) =>
      migrateLegacy(prev, focus, legacyMigratedRef, { projects, tasks }),
    );
  }, [applyDaysUpdate, focus, legacyMigratedRef]);

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
