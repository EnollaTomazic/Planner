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
  reorderProjectTasks as dayReorderProjectTasks,
  addTaskImage as dayAddTaskImage,
  removeTaskImage as dayRemoveTaskImage,
  updateTaskReminder as dayUpdateTaskReminder,
} from "./dayCrud";
import type { DayRecord, ISODate, TaskReminder } from "./plannerTypes";

export type UpsertDay = (iso: ISODate, fn: (d: DayRecord) => DayRecord) => void;

export function setNotes(day: DayRecord, notes: string): DayRecord {
  return { ...day, notes };
}

export function setFocus(day: DayRecord, focus: string): DayRecord {
  return { ...day, focus };
}

export function makeCrud(iso: ISODate, upsertDay: UpsertDay) {
  const addProject = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return undefined;
    const id = uid("proj");
    upsertDay(iso, (d) => dayAddProject(d, id, trimmed));
    return id;
  };

  const renameProject = (id: string, name: string) =>
    upsertDay(iso, (d) => dayRenameProject(d, id, name));

  const toggleProject = (id: string) =>
    upsertDay(iso, (d) => dayToggleProject(d, id));

  const removeProject = (id: string) =>
    upsertDay(iso, (d) => dayRemoveProject(d, id));

  const addTask = (title: string, projectId?: string) => {
    const trimmed = title.trim();
    if (!trimmed) return undefined;
    const id = uid("task");
    upsertDay(iso, (d) => dayAddTask(d, id, trimmed, projectId));
    return id;
  };

  const renameTask = (id: string, next: string) =>
    upsertDay(iso, (d) => dayRenameTask(d, id, next));

  const toggleTask = (id: string) =>
    upsertDay(iso, (d) => dayToggleTask(d, id));

  const removeTask = (id: string) =>
    upsertDay(iso, (d) => dayRemoveTask(d, id));

  const reorderTasks = (projectId: string, orderedIds: string[]) =>
    upsertDay(iso, (d) => dayReorderProjectTasks(d, projectId, orderedIds));

  const addTaskImage = (id: string, url: string) =>
    upsertDay(iso, (d) => dayAddTaskImage(d, id, url));

  const removeTaskImage = (id: string, url: string, index?: number) =>
    upsertDay(iso, (d) => dayRemoveTaskImage(d, id, url, index));

  const updateTaskReminder = (
    id: string,
    partial: Partial<TaskReminder> | null,
  ) => upsertDay(iso, (d) => dayUpdateTaskReminder(d, id, partial));

  const setNotesForDay = (notes: string) =>
    upsertDay(iso, (d) => setNotes(d, notes));

  const setFocusForDay = (focus: string) =>
    upsertDay(iso, (d) => setFocus(d, focus));

  return {
    addProject,
    renameProject,
    toggleProject,
    removeProject,
    addTask,
    renameTask,
    toggleTask,
    removeTask,
    reorderTasks,
    addTaskImage,
    removeTaskImage,
    updateTaskReminder,
    setNotes: setNotesForDay,
    setFocus: setFocusForDay,
  } as const;
}
