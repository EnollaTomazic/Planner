import * as React from "react";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", async () => {
  const actual = await vi.importActual<typeof import("@/lib/db")>("@/lib/db");
  return {
    ...actual,
    usePersistentState: <T,>(_key: string, initial: T) => React.useState(initial),
  };
});

import {
  PlannerProvider,
  computeDayCounts,
  type DayRecord,
  type DayTask,
  type Project,
  useDay,
  useFocusDate,
  usePlannerStore,
} from "@/components/planner";
import { useHomePlannerOverview } from "@/components/home";
import type { Goal } from "@/lib/types";

const goalsMockState = { goals: [] as Goal[] };
const reviewsMockState = { totalCount: 0, flaggedReviewCount: 0 };
const promptsMockState = {
  prompts: [] as Array<{ id: string; title: string; text: string; createdAt: number }>,
};

vi.mock("@/components/goals", async () => {
  const actual = await vi.importActual<typeof import("@/components/goals")>(
    "@/components/goals",
  );
  return {
    ...actual,
    useGoals: () => goalsMockState,
  };
});

vi.mock("@/components/reviews", async () => {
  const actual = await vi.importActual<typeof import("@/components/reviews")>(
    "@/components/reviews",
  );
  return {
    ...actual,
    useReviews: () => reviewsMockState,
  };
});

vi.mock("@/components/prompts", async () => {
  const actual = await vi.importActual<typeof import("@/components/prompts")>(
    "@/components/prompts",
  );
  return {
    ...actual,
    useChatPrompts: () => promptsMockState,
  };
});

function buildDayRecord(projects: Project[], tasks: DayTask[]): DayRecord {
  const tasksById: Record<string, DayTask> = {};
  const tasksByProject: Record<string, string[]> = {};
  for (const task of tasks) {
    tasksById[task.id] = task;
    if (!task.projectId) continue;
    (tasksByProject[task.projectId] ??= []).push(task.id);
  }
  const { doneCount, totalCount } = computeDayCounts(projects, tasks);
  return {
    projects,
    tasks,
    tasksById,
    tasksByProject,
    doneCount,
    totalCount,
  } satisfies DayRecord;
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PlannerProvider>{children}</PlannerProvider>
);

type OverviewHarness = ReturnType<typeof renderOverviewHarness>["result"]["current"];

function renderOverviewHarness() {
  return renderHook(
    () => {
      const overview = useHomePlannerOverview();
      const focus = useFocusDate();
      const store = usePlannerStore();
      const day = useDay(focus.iso);
      return { overview, focus, store, day } as const;
    },
    { wrapper },
  );
}

function getSummaryValue(items: OverviewHarness["overview"]["summary"]["items"], key: string) {
  const entry = items.find((item) => item.key === key);
  return entry?.value;
}

beforeEach(() => {
  goalsMockState.goals = [];
  reviewsMockState.totalCount = 0;
  reviewsMockState.flaggedReviewCount = 0;
  promptsMockState.prompts = [];
});

describe("useHomePlannerOverview", () => {
  it("summarises focus tasks, flagged reviews, and weekly calendar state", () => {
    vi.useFakeTimers();
    const now = new Date(2024, 0, 8, 9, 30, 0);
    vi.setSystemTime(now);

    goalsMockState.goals = [
      { id: "goal-1", title: "Win lane", done: false, metric: "CS +10", createdAt: 1 },
      { id: "goal-2", title: "Roam timer", done: false, notes: "Check 8", createdAt: 2 },
      { id: "goal-3", title: "Ward river", done: true, createdAt: 3 },
    ];
    reviewsMockState.totalCount = 5;
    reviewsMockState.flaggedReviewCount = 2;
    promptsMockState.prompts = Array.from({ length: 3 }, (_, index) => ({
      id: `prompt-${index + 1}`,
      title: `Prompt ${index + 1}`,
      text: `Prompt body ${index + 1}`,
      createdAt: index + 1,
    }));

    const { result, unmount } = renderOverviewHarness();

    try {
      const focusIso = "2024-01-09";
      const projects: Project[] = [
        { id: "project-alpha", name: "Alpha", done: false, createdAt: 1 },
        { id: "project-beta", name: "Beta", done: true, createdAt: 2 },
      ];
      const tasks: DayTask[] = [
        {
          id: "task-1",
          title: "Draft review",
          done: false,
          projectId: "project-alpha",
          createdAt: 1,
          images: [],
        },
        {
          id: "task-2",
          title: "Sync deck",
          done: true,
          projectId: "project-alpha",
          createdAt: 2,
          images: [],
        },
        {
          id: "task-3",
          title: "Plan week",
          done: false,
          createdAt: 3,
          images: [],
        },
        {
          id: "task-4",
          title: "Prep scrims",
          done: false,
          projectId: "project-beta",
          createdAt: 4,
          images: [],
        },
        {
          id: "task-5",
          title: "Stretch goal",
          done: false,
          projectId: "project-beta",
          createdAt: 5,
          images: [],
        },
      ];

      act(() => {
        result.current.store.setDay(focusIso, buildDayRecord(projects, tasks));
        result.current.store.setFocus(focusIso);
      });

      expect(result.current.focus.iso).toBe(focusIso);

      const focusCard = result.current.overview.focus;
      expect(focusCard.tasks.map((task) => task.id)).toEqual([
        "task-1",
        "task-2",
        "task-3",
        "task-4",
      ]);
      expect(focusCard.remainingTasks).toBe(1);
      expect(focusCard.tasks[0].projectName).toBe("Alpha");
      expect(focusCard.tasks[2].projectName).toBeNull();
      expect(focusCard.tasks[0].toggleLabel).toBe("Mark Draft review as done");
      expect(focusCard.tasks[1].toggleLabel).toBe("Mark Sync deck as not done");

      expect(result.current.day.tasks.find((task) => task.id === "task-1")?.done).toBe(false);

      act(() => {
        focusCard.onToggleTask("task-1");
      });

      expect(result.current.day.tasks.find((task) => task.id === "task-1")?.done).toBe(true);
      expect(result.current.day.doneCount).toBe(3);

      expect(result.current.overview.goals.completed).toBe(1);
      expect(result.current.overview.goals.total).toBe(3);
      expect(result.current.overview.goals.active.map((goal) => goal.id)).toEqual([
        "goal-1",
        "goal-2",
      ]);

      const summaryItems = result.current.overview.summary.items;
      expect(getSummaryValue(summaryItems, "reviews")).toBe("2 reviews");
      expect(getSummaryValue(summaryItems, "prompts")).toBe("3 saved");

      const calendar = result.current.overview.calendar;
      expect(calendar.days).toHaveLength(7);
      const todayIso = result.current.focus.today;
      const todayEntry = calendar.days.find((day) => day.iso === todayIso);
      expect(todayEntry?.today).toBe(true);
      const selectedEntry = calendar.days.find((day) => day.iso === focusIso);
      expect(selectedEntry?.selected).toBe(true);

      const activity = result.current.overview.activity;
      expect(activity.loading).toBe(false);
      expect(activity.hasData).toBe(true);
      expect(activity.points).toHaveLength(7);
      const totals = calendar.days.reduce(
        (acc, day) => {
          acc.completed += day.done;
          acc.scheduled += day.total;
          return acc;
        },
        { completed: 0, scheduled: 0 },
      );
      expect(activity.totalCompleted).toBe(totals.completed);
      expect(activity.totalScheduled).toBe(totals.scheduled);
      const focusPoint = activity.points.find((point) => point.iso === focusIso);
      expect(focusPoint).toBeDefined();
      expect(focusPoint?.completed).toBe(selectedEntry?.done ?? 0);
      expect(focusPoint?.total).toBe(selectedEntry?.total ?? 0);

      act(() => {
        calendar.onSelectDay("2024-01-10");
      });
      expect(result.current.focus.iso).toBe("2024-01-10");
    } finally {
      unmount();
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });

  it("reflects caught-up reviews, empty prompts, and completed goals", () => {
    goalsMockState.goals = [
      { id: "goal-a", title: "Review VODs", done: true, createdAt: 1 },
      { id: "goal-b", title: "Draft playbook", done: true, createdAt: 2 },
    ];
    reviewsMockState.totalCount = 3;
    reviewsMockState.flaggedReviewCount = 0;
    promptsMockState.prompts = [];

    const { result, unmount } = renderOverviewHarness();

    try {
      const summaryItems = result.current.overview.summary.items;
      expect(getSummaryValue(summaryItems, "reviews")).toBe("All caught up");
      expect(getSummaryValue(summaryItems, "prompts")).toBe("Start a prompt");

      const goalsCard = result.current.overview.goals;
      expect(goalsCard.completed).toBe(2);
      expect(goalsCard.total).toBe(2);
      expect(goalsCard.active).toHaveLength(0);

      expect(result.current.overview.focus.remainingTasks).toBe(0);
      expect(result.current.overview.activity.hasData).toBe(false);
      expect(result.current.overview.activity.totalScheduled).toBe(0);
    } finally {
      unmount();
    }
  });

  it("falls back to the empty week summary when no goals or tasks exist", () => {
    goalsMockState.goals = [];
    reviewsMockState.totalCount = 0;
    reviewsMockState.flaggedReviewCount = 0;
    promptsMockState.prompts = [];

    const { result, unmount } = renderOverviewHarness();

    try {
      act(() => {
        result.current.store.setFocus("2024-03-04");
      });

      expect(result.current.overview.goals.total).toBe(0);
      expect(result.current.overview.goals.completed).toBe(0);
      expect(result.current.overview.goals.percentage).toBe(0);
      expect(result.current.overview.calendar.summary).toBe("No tasks scheduled this week");
      expect(result.current.overview.calendar.hasPlannedTasks).toBe(false);

      const summaryItems = result.current.overview.summary.items;
      expect(getSummaryValue(summaryItems, "reviews")).toBe("Start a review");
      expect(getSummaryValue(summaryItems, "prompts")).toBe("Start a prompt");

      const activity = result.current.overview.activity;
      expect(activity.loading).toBe(false);
      expect(activity.hasData).toBe(false);
      expect(activity.totalScheduled).toBe(0);
      expect(activity.points).toHaveLength(7);
    } finally {
      unmount();
    }
  });
});
