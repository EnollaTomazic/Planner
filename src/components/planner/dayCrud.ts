import type { DayRecord, DayTask } from "./plannerStore";

function indexTasks(tasks: DayTask[]): {
  tasksById: Record<string, DayTask>;
  tasksByProject: Record<string, string[]>;
} {
  const tasksById: Record<string, DayTask> = {};
  const tasksByProject: Record<string, string[]> = {};
  for (const task of tasks) {
    tasksById[task.id] = task;
    if (task.projectId) {
      (tasksByProject[task.projectId] ??= []).push(task.id);
    }
  }
  return { tasksById, tasksByProject };
}

function withTasks(
  day: DayRecord,
  tasks: DayTask[],
  overrides: Partial<
    Omit<DayRecord, "tasks" | "tasksById" | "tasksByProject">
  > = {},
): DayRecord {
  const { tasksById, tasksByProject } = indexTasks(tasks);
  return {
    ...day,
    ...overrides,
    tasks,
    tasksById,
    tasksByProject,
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
  return withTasks(day, tasks, { projects });
}

export function removeProject(day: DayRecord, id: string) {
  const projects = day.projects.filter((p) => p.id !== id);
  const tasks = day.tasks.filter((t) => t.projectId !== id);
  return withTasks(day, tasks, { projects });
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
  return withTasks(day, tasks);
}

export function renameTask(day: DayRecord, id: string, next: string) {
  const title = next.trim();
  if (!title) return day;
  const tasks = day.tasks.map((t) => (t.id === id ? { ...t, title } : t));
  return withTasks(day, tasks);
}

export function toggleTask(day: DayRecord, id: string) {
  const tasks = day.tasks.map((t) =>
    t.id === id ? { ...t, done: !t.done } : t,
  );
  return withTasks(day, tasks);
}

export function removeTask(day: DayRecord, id: string) {
  const tasks = day.tasks.filter((t) => t.id !== id);
  return withTasks(day, tasks);
}

export function addTaskImage(day: DayRecord, id: string, url: string) {
  const u = url.trim();
  if (!u) return day;
  const tasks = day.tasks.map((t) =>
    t.id === id ? { ...t, images: [...t.images, u] } : t,
  );
  return withTasks(day, tasks);
}

export function removeTaskImage(day: DayRecord, id: string, url: string) {
  const tasks = day.tasks.map((t) =>
    t.id === id
      ? { ...t, images: t.images.filter((img) => img !== url) }
      : t,
  );
  return withTasks(day, tasks);
}
