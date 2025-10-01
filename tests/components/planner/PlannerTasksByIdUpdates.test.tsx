import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("@/lib/db", async () => {
  const actual = await vi.importActual<typeof import("@/lib/db")>("@/lib/db");
  return {
    ...actual,
    usePersistentState: <T,>(_key: string, initial: T, _options?: unknown) =>
      React.useState(initial),
  };
});

import {
  PlannerProvider,
  useDays,
  type ISODate,
  type DayTask,
  type DayRecord,
  toggleTask as toggleTaskRecord,
} from "@/components/planner";

function makeTask(id: string, overrides: Partial<DayTask> = {}): DayTask {
  return {
    id,
    title: overrides.title ?? id,
    done: overrides.done ?? false,
    projectId: overrides.projectId,
    createdAt: overrides.createdAt ?? 0,
    images: overrides.images ?? [],
    ...overrides,
  } satisfies DayTask;
}

function dayFromTasks(tasks: DayTask[]): DayRecord {
  const tasksById = tasks.reduce<Record<string, DayTask>>((map, task) => {
    map[task.id] = task;
    return map;
  }, {});
  return {
    projects: [],
    tasks,
    tasksById,
    tasksByProject: {},
    doneCount: tasks.filter((task) => task.done).length,
    totalCount: tasks.length,
  } satisfies DayRecord;
}

describe("Planner tasksById updates", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <PlannerProvider>{children}</PlannerProvider>
  );

  it("only updates the toggled day's lookup when flipping a task", () => {
    const { result } = renderHook(() => useDays(), { wrapper });

    const isoOne = "2099-03-01" as ISODate;
    const isoTwo = "2099-03-02" as ISODate;
    const isoOneTask = makeTask("task-toggle");
    const isoTwoTask = makeTask("task-other");

    act(() => {
      result.current.setDays({
        [isoOne]: dayFromTasks([isoOneTask]),
        [isoTwo]: dayFromTasks([isoTwoTask]),
      });
    });

    const beforeMap = result.current.tasksById;
    const beforeIsoOne = beforeMap[isoOne];
    const beforeIsoTwo = beforeMap[isoTwo];
    expect(beforeIsoOne).toBeDefined();
    expect(beforeIsoTwo).toBeDefined();

    act(() => {
      result.current.setDays((prev) => {
        const next: Record<ISODate, DayRecord> = {
          ...prev,
          [isoOne]: toggleTaskRecord(prev[isoOne]!, isoOneTask.id),
        };
        return [next, [isoOne]] as const;
      });
    });

    const afterMap = result.current.tasksById;
    expect(afterMap[isoOne]).not.toBe(beforeIsoOne);
    expect(afterMap[isoOne][isoOneTask.id]?.done).toBe(true);
    expect(afterMap[isoTwo]).toBe(beforeIsoTwo);
  });

  it("registers lookup maps for newly created days without disturbing existing ones", () => {
    const { result } = renderHook(() => useDays(), { wrapper });

    const existingIso = "2099-04-01" as ISODate;
    const newIso = "2099-04-02" as ISODate;

    act(() => {
      result.current.setDays({
        [existingIso]: dayFromTasks([makeTask("existing-task")]),
      });
    });

    const beforeMap = result.current.tasksById;
    const beforeExisting = beforeMap[existingIso];
    expect(beforeExisting).toBeDefined();

    act(() => {
      result.current.setDays((prev) => {
        const next: Record<ISODate, DayRecord> = {
          ...prev,
          [newIso]: dayFromTasks([makeTask("new-task")]),
        };
        return [next, [newIso]] as const;
      });
    });

    const afterMap = result.current.tasksById;
    expect(afterMap[newIso]).toBeDefined();
    expect(afterMap[newIso]?.["new-task"].title).toBe("new-task");
    expect(afterMap[existingIso]).toBe(beforeExisting);
  });

  it("drops lookup maps for pruned days while preserving active ones", () => {
    const { result } = renderHook(() => useDays(), { wrapper });

    const activeIso = "2099-05-01" as ISODate;
    const staleIso = "2024-01-01" as ISODate;

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-10T00:00:00Z"));

    act(() => {
      result.current.setDays({
        [activeIso]: dayFromTasks([makeTask("keep-task")]),
        [staleIso]: dayFromTasks([makeTask("stale-task")]),
      });
    });

    const beforeMap = result.current.tasksById;
    const beforeActive = beforeMap[activeIso];
    expect(beforeMap[staleIso]).toBeDefined();

    vi.setSystemTime(new Date("2025-03-01T00:00:00Z"));

    act(() => {
      result.current.setDays((prev) => ({ ...prev }));
    });

    const afterMap = result.current.tasksById;
    expect(afterMap[staleIso]).toBeUndefined();
    expect(afterMap[activeIso]).toBe(beforeActive);

    vi.useRealTimers();
  });
});
