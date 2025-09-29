"use client";

import * as React from "react";
import { ensureDay } from "./plannerSerialization";
import type { ISODate } from "./plannerTypes";
import { makeCrud } from "./plannerCrud";
import { usePlannerStore } from "./usePlannerStore";

export function useDay(iso: ISODate) {
  const { days, upsertDay } = usePlannerStore();

  const rec = React.useMemo(() => ensureDay(days, iso), [days, iso]);

  const tasks = rec.tasks;
  const tasksById = rec.tasksById;
  const tasksByProject = rec.tasksByProject;

  const crud = React.useMemo(() => makeCrud(iso, upsertDay), [iso, upsertDay]);
  const doneCount = rec.doneCount;
  const totalCount = rec.totalCount;

  return {
    projects: rec.projects,
    tasks,
    tasksById,
    tasksByProject,
    addProject: crud.addProject,
    renameProject: crud.renameProject,
    deleteProject: crud.removeProject,
    toggleProject: crud.toggleProject,
    addTask: crud.addTask,
    renameTask: crud.renameTask,
    deleteTask: crud.removeTask,
    toggleTask: crud.toggleTask,
    addTaskImage: crud.addTaskImage,
    removeTaskImage: crud.removeTaskImage,
    updateTaskReminder: crud.updateTaskReminder,
    doneCount,
    totalCount,
  } as const;
}
