import type { DayRecord } from "./usePlanner";

export function addProject(day: DayRecord, id: string, name: string) {
  const title = name.trim();
  if (!title) return day;
  const createdAt = Date.now();
  const projects = [
    ...day.projects,
    { id, name: title, done: false, createdAt },
  ];
  return { ...day, projects };
}

export function renameProject(day: DayRecord, id: string, name: string) {
  return {
    ...day,
    projects: day.projects.map((p) => (p.id === id ? { ...p, name } : p)),
  };
}

export function toggleProject(day: DayRecord, id: string) {
  const wasDone = day.projects.find((p) => p.id === id)?.done ?? false;
  const projects = day.projects.map((p) =>
    p.id === id ? { ...p, done: !wasDone } : p,
  );
  const tasks = day.tasks.map((t) =>
    t.projectId === id ? { ...t, done: !wasDone } : t,
  );
  return { ...day, projects, tasks };
}

export function removeProject(day: DayRecord, id: string) {
  return {
    ...day,
    projects: day.projects.filter((p) => p.id !== id),
    tasks: day.tasks.filter((t) => t.projectId !== id),
  };
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
    { id, title: name, done: false, projectId, createdAt },
  ];
  return { ...day, tasks };
}

export function renameTask(day: DayRecord, id: string, next: string) {
  const title = next.trim();
  if (!title) return day;
  return {
    ...day,
    tasks: day.tasks.map((t) => (t.id === id ? { ...t, title } : t)),
  };
}

export function toggleTask(day: DayRecord, id: string) {
  return {
    ...day,
    tasks: day.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
  };
}

export function removeTask(day: DayRecord, id: string) {
  return {
    ...day,
    tasks: day.tasks.filter((t) => t.id !== id),
  };
}
