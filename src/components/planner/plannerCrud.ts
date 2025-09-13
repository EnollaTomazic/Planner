import { uid } from "@/lib/db";
import {
  addProject as dayAddProject,
  renameProject as dayRenameProject,
  toggleProject as dayToggleProject,
  removeProject as dayRemoveProject,
  addTask as dayAddTask,
  renameTask as dayRenameTask,
  toggleTask as dayToggleTask,
  removeTask as dayRemoveTask,
  addTaskImage as dayAddTaskImage,
  removeTaskImage as dayRemoveTaskImage,
} from "./dayCrud";
import type { ISODate, DayRecord } from "./plannerStore";

export type UpsertDay = (iso: ISODate, fn: (d: DayRecord) => DayRecord) => void;

export function makeCrud(iso: ISODate, upsertDay: UpsertDay) {
  const addProject = (name: string) => {
    const id = uid("proj");
    upsertDay(iso, (d) => dayAddProject(d, id, name));
    return id;
  };

  const renameProject = (id: string, name: string) =>
    upsertDay(iso, (d) => dayRenameProject(d, id, name));

  const toggleProject = (id: string) =>
    upsertDay(iso, (d) => dayToggleProject(d, id));

  const removeProject = (id: string) =>
    upsertDay(iso, (d) => {
      const next = dayRemoveProject(d, id);
      const { [id]: _removed, ...rest } = next.tasksByProject;
      void _removed;
      return { ...next, tasksByProject: rest };
    });

  const addTask = (title: string, projectId?: string) => {
    const id = uid("task");
    upsertDay(iso, (d) => {
      const next = dayAddTask(d, id, title, projectId);
      if (projectId) {
        const ids = next.tasksByProject[projectId] ?? [];
        return {
          ...next,
          tasksByProject: {
            ...next.tasksByProject,
            [projectId]: [...ids, id],
          },
        };
      }
      return next;
    });
    return id;
  };

  const renameTask = (id: string, next: string) =>
    upsertDay(iso, (d) => dayRenameTask(d, id, next));

  const toggleTask = (id: string) =>
    upsertDay(iso, (d) => dayToggleTask(d, id));

  const removeTask = (id: string) =>
    upsertDay(iso, (d) => {
      const projectId = d.tasks.find((t) => t.id === id)?.projectId;
      const next = dayRemoveTask(d, id);
      if (projectId) {
        const ids = (next.tasksByProject[projectId] ?? []).filter(
          (tid) => tid !== id,
        );
        return {
          ...next,
          tasksByProject: { ...next.tasksByProject, [projectId]: ids },
        };
      }
      return next;
    });

  const addTaskImage = (id: string, url: string) =>
    upsertDay(iso, (d) => dayAddTaskImage(d, id, url));

  const removeTaskImage = (id: string, url: string) =>
    upsertDay(iso, (d) => dayRemoveTaskImage(d, id, url));

  const setNotes = (notes: string) => upsertDay(iso, (d) => ({ ...d, notes }));

  return {
    addProject,
    renameProject,
    toggleProject,
    removeProject,
    addTask,
    renameTask,
    toggleTask,
    removeTask,
    addTaskImage,
    removeTaskImage,
    setNotes,
  } as const;
}
