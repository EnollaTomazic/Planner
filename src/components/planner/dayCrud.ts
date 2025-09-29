import type { DayRecord, TaskReminder } from "./plannerTypes";
import {
  buildTaskLookups,
  computeDayCounts,
  sanitizeTaskReminder,
  taskRemindersEqual,
} from "./plannerSerialization";

type DayUpdates = Partial<
  Pick<
    DayRecord,
    "projects" | "tasks" | "tasksById" | "tasksByProject" | "focus" | "notes"
  >
>;

function finalizeDay(day: DayRecord, updates: DayUpdates = {}) {
  const projects = updates.projects ?? day.projects;
  const hasTaskUpdate = Object.prototype.hasOwnProperty.call(updates, "tasks");
  const tasks = hasTaskUpdate ? updates.tasks ?? day.tasks : day.tasks;
  let tasksById = day.tasksById ?? {};
  let tasksByProject = day.tasksByProject ?? {};

  if (hasTaskUpdate) {
    const lookups = buildTaskLookups(tasks);
    tasksById = lookups.tasksById;
    tasksByProject = lookups.tasksByProject;
  } else {
    if (Object.prototype.hasOwnProperty.call(updates, "tasksById")) {
      tasksById = updates.tasksById ?? {};
    }
    if (Object.prototype.hasOwnProperty.call(updates, "tasksByProject")) {
      tasksByProject = updates.tasksByProject ?? {};
    }
  }
  const { doneCount, totalCount } = computeDayCounts(projects, tasks);
  return {
    ...day,
    ...updates,
    projects,
    tasks,
    tasksById,
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
  const title = name.trim();
  if (!title) return day;
  const project = day.projects.find((p) => p.id === id);
  if (!project || project.name === title) return day;
  return finalizeDay(day, {
    projects: day.projects.map((p) =>
      p.id === id ? { ...p, name: title } : p,
    ),
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
  const task = day.tasks.find((t) => t.id === id);
  if (!task || task.title === title) return day;
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

export function reorderProjectTasks(
  day: DayRecord,
  projectId: string,
  orderedIds: string[],
) {
  const projectTasks = day.tasks.filter((task) => task.projectId === projectId);
  if (projectTasks.length <= 1) {
    return day;
  }

  const projectTaskIds = projectTasks.map((task) => task.id);
  const projectTaskIdSet = new Set(projectTaskIds);
  const seen = new Set<string>();
  const nextOrder: string[] = [];

  for (const id of orderedIds) {
    if (!projectTaskIdSet.has(id) || seen.has(id)) continue;
    seen.add(id);
    nextOrder.push(id);
  }

  for (const id of projectTaskIds) {
    if (!seen.has(id)) {
      nextOrder.push(id);
    }
  }

  let changed = false;
  for (let index = 0; index < projectTaskIds.length; index += 1) {
    if (projectTaskIds[index] !== nextOrder[index]) {
      changed = true;
      break;
    }
  }

  if (!changed) {
    return day;
  }

  const nextById = new Map(projectTasks.map((task) => [task.id, task] as const));
  let projectIndex = 0;

  const tasks = day.tasks.map((task) => {
    if (task.projectId !== projectId) return task;
    const nextId = nextOrder[projectIndex++];
    const nextTask = nextById.get(nextId);
    return nextTask ?? task;
  });

  return finalizeDay(day, { tasks });
}

export function updateTaskReminder(
  day: DayRecord,
  id: string,
  partial: Partial<TaskReminder> | null,
) {
  let changed = false;

  const tasks = day.tasks.map((t) => {
    if (t.id !== id) return t;

    if (partial === null) {
      if (!t.reminder) return t;
      changed = true;
      const rest = { ...t };
      delete rest.reminder;
      return rest;
    }

    const base = t.reminder ?? {};
    const nextReminder = sanitizeTaskReminder({ ...base, ...partial });

    if (taskRemindersEqual(t.reminder, nextReminder)) {
      return t;
    }

    changed = true;

    if (!nextReminder) {
      const rest = { ...t };
      delete rest.reminder;
      return rest;
    }

    return { ...t, reminder: nextReminder };
  });

  if (!changed) return day;

  return finalizeDay(day, { tasks });
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

export function removeTaskImage(
  day: DayRecord,
  id: string,
  url: string,
  imageIndex?: number,
) {
  return finalizeDay(day, {
    tasks: day.tasks.map((t) => {
      if (t.id !== id) return t;

      const indexToRemove =
        imageIndex !== undefined && t.images[imageIndex] === url
          ? imageIndex
          : t.images.indexOf(url);

      if (indexToRemove < 0) return t;

      const images = t.images.slice();
      images.splice(indexToRemove, 1);
      return { ...t, images };
    }),
  });
}
