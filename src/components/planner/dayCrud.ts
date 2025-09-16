import type { DayRecord } from "./plannerStore";
import { computeDayCounts } from "./plannerStore";

type DayUpdates = Partial<
  Pick<DayRecord, "projects" | "tasks" | "tasksByProject" | "focus" | "notes">
>;

function finalizeDay(day: DayRecord, updates: DayUpdates = {}) {
  const projects = updates.projects ?? day.projects;
  const tasks = updates.tasks ?? day.tasks;
  const tasksByProject = updates.tasksByProject ?? day.tasksByProject;
  const { doneCount, totalCount } = computeDayCounts(projects, tasks);
  return {
    ...day,
    ...updates,
    projects,
    tasks,
    tasksByProject,
    doneCount,
    totalCount,
  };
}

export function addProject(day: DayRecord, id: string, name: string) {
  const title = name.trim();
  if (!title) return day;
  const createdAt = Date.now();
  const projects = [
    ...day.projects,
    { id, name: title, done: false, createdAt },
  ];
  return finalizeDay(day, { projects });
}

export function renameProject(day: DayRecord, id: string, name: string) {
  return finalizeDay(day, {
    projects: day.projects.map((p) => (p.id === id ? { ...p, name } : p)),
  });
}

export function toggleProject(day: DayRecord, id: string) {
  const wasDone = day.projects.find((p) => p.id === id)?.done ?? false;
  const projects = day.projects.map((p) =>
    p.id === id ? { ...p, done: !wasDone } : p,
  );
  const tasks = day.tasks.map((t) =>
    t.projectId === id ? { ...t, done: !wasDone } : t,
  );
  return finalizeDay(day, { projects, tasks });
}

export function removeProject(day: DayRecord, id: string) {
  return finalizeDay(day, {
    projects: day.projects.filter((p) => p.id !== id),
    tasks: day.tasks.filter((t) => t.projectId !== id),
  });
}

export function addTask(
  day: DayRecord,
  id: string,
  title: string,
  projectId?: string,
) {
  const name = title.trim();
  if (!name) return day;
  const createdAt = Date.now();
  const tasks = [
    ...day.tasks,
    { id, title: name, done: false, projectId, createdAt, images: [] },
  ];
  return finalizeDay(day, { tasks });
}

export function renameTask(day: DayRecord, id: string, next: string) {
  const title = next.trim();
  if (!title) return day;
  return finalizeDay(day, {
    tasks: day.tasks.map((t) => (t.id === id ? { ...t, title } : t)),
  });
}

export function toggleTask(day: DayRecord, id: string) {
  return finalizeDay(day, {
    tasks: day.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
  });
}

export function removeTask(day: DayRecord, id: string) {
  return finalizeDay(day, {
    tasks: day.tasks.filter((t) => t.id !== id),
  });
}

export function addTaskImage(day: DayRecord, id: string, url: string) {
  const u = url.trim();
  if (!u) return day;
  return finalizeDay(day, {
    tasks: day.tasks.map((t) =>
      t.id === id ? { ...t, images: [...t.images, u] } : t,
    ),
  });
}

export function removeTaskImage(day: DayRecord, id: string, url: string) {
  return finalizeDay(day, {
    tasks: day.tasks.map((t) =>
      t.id === id
        ? { ...t, images: t.images.filter((img) => img !== url) }
        : t,
    ),
  });
}
