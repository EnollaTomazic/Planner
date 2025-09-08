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
} from "./dayCrud";
import type { ISODate, DayRecord } from "./plannerStore";

export type UpsertDay = (
  iso: ISODate,
  fn: (d: DayRecord) => DayRecord,
) => void;

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
    upsertDay(iso, (d) => dayRemoveProject(d, id));

  const addTask = (title: string, projectId?: string) => {
    const id = uid("task");
    upsertDay(iso, (d) => dayAddTask(d, id, title, projectId));
    return id;
  };

  const renameTask = (id: string, next: string) =>
    upsertDay(iso, (d) => dayRenameTask(d, id, next));

  const toggleTask = (id: string) =>
    upsertDay(iso, (d) => dayToggleTask(d, id));

  const removeTask = (id: string) =>
    upsertDay(iso, (d) => dayRemoveTask(d, id));

  const setNotes = (notes: string) =>
    upsertDay(iso, (d) => ({ ...d, notes }));

  return {
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
