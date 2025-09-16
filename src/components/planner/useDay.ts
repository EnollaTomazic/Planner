"use client";

import * as React from "react";
import { ensureDay, type ISODate } from "./plannerStore";
import { makeCrud } from "./plannerCrud";
import { usePlannerStore } from "./usePlannerStore";

export function useDay(iso: ISODate) {
  const { days, upsertDay } = usePlannerStore();

  const rec = React.useMemo(() => ensureDay(days, iso), [days, iso]);

  const tasks = rec.tasks;
  const tasksById = rec.tasksById;
  const tasksByProject = rec.tasksByProject;

  const crud = React.useMemo(() => makeCrud(iso, upsertDay), [iso, upsertDay]);

  const doneTasks = React.useMemo(
    () => tasks.filter((t) => t.done).length,
    [tasks],
  );
  const totalTasks = tasks.length;

  return {
    projects: rec.projects,
    tasks,
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
    tasksById,
    tasksByProject,
    doneTasks,
    totalTasks,
  } as const;
}
