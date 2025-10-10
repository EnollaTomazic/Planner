import type { Review } from "@/lib/types";

export interface DemoProject {
  id: string;
  name: string;
  done: boolean;
  createdAt: number;
  disabled?: boolean;
  loading?: boolean;
}

export interface DemoTask {
  id: string;
  title: string;
  done: boolean;
  projectId?: string;
  createdAt: number;
  images: string[];
}

export const selectItems = [
  { value: "apple", label: "Apple" },
  { value: "orange", label: "Orange" },
  { value: "pear", label: "Pear" },
];

const DEMO_TIMESTAMP = Date.UTC(2024, 3, 12, 15, 0, 0);
const MINUTE_MS = 60_000;

export const demoReview: Review = {
  id: "demo",
  title: "Demo Review",
  notes: "Quick note",
  tags: [],
  pillars: [],
  createdAt: DEMO_TIMESTAMP,
  matchup: "Lux vs Ahri",
  role: "MID",
  score: 8,
  result: "Win",
};

export const demoProjects: DemoProject[] = [
  { id: "p1", name: "Alpha", done: false, createdAt: DEMO_TIMESTAMP - MINUTE_MS },
  { id: "p2", name: "Beta", done: true, createdAt: DEMO_TIMESTAMP - MINUTE_MS * 2 },
  {
    id: "p3",
    name: "Gamma (disabled)",
    done: false,
    createdAt: DEMO_TIMESTAMP - MINUTE_MS * 3,
    disabled: true,
  },
  {
    id: "p4",
    name: "Delta (syncing)",
    done: false,
    createdAt: DEMO_TIMESTAMP - MINUTE_MS * 4,
    loading: true,
  },
];

export const demoTasks: DemoTask[] = [
  {
    id: "t1",
    title: "Task A",
    done: false,
    projectId: "p1",
    createdAt: DEMO_TIMESTAMP - MINUTE_MS * 5,
    images: [],
  },
  {
    id: "t2",
    title: "Task B",
    done: true,
    projectId: "p1",
    createdAt: DEMO_TIMESTAMP - MINUTE_MS * 6,
    images: [],
  },
];

export const demoTasksById: Record<string, DemoTask> = Object.fromEntries(
  demoTasks.map((task) => [task.id, task]),
);

export const demoTasksByProject = demoTasks.reduce<Record<string, string[]>>(
  (acc, task) => {
    const projectId = task.projectId;
    if (projectId) {
      (acc[projectId] ??= []).push(task.id);
    }
    return acc;
  },
  {},
);
