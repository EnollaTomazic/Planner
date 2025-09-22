"use client";

import * as React from "react";
import { ensureDay, computeDayCounts, buildTaskLookups } from "./plannerSerialization";
import { useDays, useFocus } from "./plannerContext";
import type {
  DayRecord,
  DayTask,
  ISODate,
  Project,
} from "./plannerTypes";
import { makeCrud } from "./plannerCrud";
import { readLocal, removeLocal } from "@/lib/db";

export type { ISODate, DayRecord, Project, DayTask } from "./plannerTypes";

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
      changed?: ISODate | Iterable<ISODate>,
    ) => {
      if (changed === undefined) {
        setDays(updater);
        return;
      }

      const list =
        typeof changed === "string"
          ? [changed]
          : Array.from(changed);

      setDays((prev) => {
        const next = updater(prev);
        return [next, list] as const;
      });
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

      applyDaysUpdate(
        (prev) => migrateLegacy(prev, focus, { projects, tasks }),
        focus,
      );
    }
  }, [applyDaysUpdate, focus]);

  const upsertDay = React.useCallback(
    (date: ISODate, fn: (d: DayRecord) => DayRecord) => {
      applyDaysUpdate(
        (prev) => {
          const base = ensureDay(prev, date);
          const next = fn(base);
          return { ...prev, [date]: next };
        },
        date,
      );
    },
    [applyDaysUpdate],
  );

  const getDay = React.useCallback(
    (date: ISODate): DayRecord => ensureDay(days, date),
    [days],
  );

  const setDay = React.useCallback(
    (date: ISODate, next: DayRecord) => {
      applyDaysUpdate((prev) => ({ ...prev, [date]: next }), date);
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

type ProjectSelector = (projectId: string) => void;
type TaskSelector = (taskId: string) => void;

type CreateProjectArgs = {
  iso: ISODate;
  name: string;
  select?: ProjectSelector;
};

type CreateTaskArgs = {
  iso: ISODate;
  projectId?: string;
  title: string;
  select?: TaskSelector;
};

/**
 * Shared helpers that wrap planner CRUD to standardise creation flows.
 */
export function usePlannerActions() {
  const { upsertDay } = usePlannerStore();

  const createProject = React.useCallback(
    ({ iso, name, select }: CreateProjectArgs) => {
      if (!iso) return;
      const trimmed = name.trim();
      if (!trimmed) return;
      const id = makeCrud(iso, upsertDay).addProject(trimmed);
      select?.(id);
      return id;
    },
    [upsertDay],
  );

  const createTask = React.useCallback(
    ({ iso, projectId, title, select }: CreateTaskArgs) => {
      if (!iso || !projectId) return;
      const trimmed = title.trim();
      if (!trimmed) return;
      const id = makeCrud(iso, upsertDay).addTask(trimmed, projectId);
      select?.(id);
      return id;
    },
    [upsertDay],
  );

  return React.useMemo(
    () => ({
      createProject,
      createTask,
    }),
    [createProject, createTask],
  );
}
