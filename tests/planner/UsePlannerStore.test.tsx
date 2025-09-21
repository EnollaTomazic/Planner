import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

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
  usePlannerStore,
  useDay,
  type DayRecord,
} from "@/components/planner";

describe("UsePlannerStore", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <PlannerProvider>{children}</PlannerProvider>
  );

  it("supports project and task CRUD with toggles", () => {
    const { result } = renderHook(
      () => {
        const planner = usePlannerStore();
        const day = useDay(planner.focus);
        return { planner, day } as const;
      },
      { wrapper },
    );

    let projectId = "";
    act(() => {
      projectId = result.current.planner.addProject("Proj A");
    });
    expect(result.current.day.projects).toHaveLength(1);
    expect(result.current.day.projects[0].name).toBe("Proj A");
    expect(
      result.current.planner.day.tasksByProject[projectId],
    ).toBeUndefined();

    act(() => result.current.planner.renameProject(projectId, "Proj B"));
    expect(result.current.day.projects[0].name).toBe("Proj B");

    act(() => result.current.planner.renameProject(projectId, "   "));
    expect(result.current.day.projects[0].name).toBe("Proj B");

    let taskId = "";
    let secondTaskId = "";
    act(() => {
      taskId = result.current.planner.addTask("Task 1", projectId);
    });
    expect(result.current.day.tasks).toHaveLength(1);
    expect(result.current.planner.day.tasksByProject[projectId]).toEqual([
      taskId,
    ]);

    act(() => {
      secondTaskId = result.current.planner.addTask("Task 2", projectId);
    });
    expect(result.current.day.tasks).toHaveLength(2);
    expect(result.current.planner.day.tasksByProject[projectId]).toEqual([
      taskId,
      secondTaskId,
    ]);

    act(() => {
      result.current.planner.addTaskImage(
        taskId,
        "https://example.com/a.jpg",
      );
    });
    expect(result.current.day.tasks[0].images[0]).toBe(
      "https://example.com/a.jpg",
    );
    act(() => {
      result.current.planner.removeTaskImage(
        taskId,
        "https://example.com/a.jpg",
      );
    });
    expect(result.current.day.tasks[0].images).toHaveLength(0);

    act(() => result.current.planner.renameTask(taskId, "Task renamed"));
    expect(result.current.day.tasks[0].title).toBe("Task renamed");

    act(() => result.current.planner.toggleTask(taskId));
    expect(result.current.day.tasks[0].done).toBe(true);

    act(() => result.current.planner.toggleProject(projectId));
    expect(result.current.day.projects[0].done).toBe(true);
    expect(result.current.day.tasks[0].done).toBe(true);

    act(() => result.current.planner.removeTask(taskId));
    expect(result.current.day.tasks).toHaveLength(1);
    expect(result.current.planner.day.tasksByProject[projectId]).toEqual([
      secondTaskId,
    ]);
    expect(
      result.current.planner.day.tasksByProject[projectId],
    ).not.toContain(taskId);

    act(() => result.current.planner.removeProject(projectId));
    expect(result.current.day.projects).toHaveLength(0);
    expect(result.current.day.tasks).toHaveLength(0);
    expect(
      result.current.planner.day.tasksByProject[projectId],
    ).toBeUndefined();
  });

  it("preserves untouched days when using CRUD helpers", () => {
    const { result } = renderHook(() => usePlannerStore(), { wrapper });

    const otherIso = "2030-01-02";
    const otherDay: DayRecord = {
      projects: [
        { id: "p-other", name: "Elsewhere", done: false, createdAt: 1 },
      ],
      tasks: [],
      tasksById: {},
      tasksByProject: {},
      doneCount: 0,
      totalCount: 1,
    };

    act(() => {
      result.current.setDay(otherIso, otherDay);
    });

    const preserved = result.current.days[otherIso];
    expect(preserved).toBeDefined();

    const expectUntouched = () => {
      expect(result.current.days[otherIso]).toBe(preserved);
    };

    let projectId = "";
    act(() => {
      projectId = result.current.addProject("Focus Project");
    });
    expectUntouched();

    act(() => {
      result.current.renameProject(projectId, "Renamed Project");
    });
    expectUntouched();

    act(() => {
      result.current.toggleProject(projectId);
    });
    expectUntouched();

    let taskId = "";
    act(() => {
      taskId = result.current.addTask("Focus Task", projectId);
    });
    expectUntouched();

    act(() => {
      result.current.addTaskImage(taskId, "https://example.com/image.png");
    });
    expectUntouched();

    act(() => {
      result.current.removeTaskImage(taskId, "https://example.com/image.png");
    });
    expectUntouched();

    act(() => {
      result.current.renameTask(taskId, "Task renamed");
    });
    expectUntouched();

    act(() => {
      result.current.toggleTask(taskId);
    });
    expectUntouched();

    act(() => {
      result.current.setNotes("Focus notes");
    });
    expectUntouched();

    act(() => {
      result.current.removeTask(taskId);
    });
    expectUntouched();

    act(() => {
      result.current.removeProject(projectId);
    });
    expectUntouched();
  });

  it("provides day-scoped utilities via useDay", () => {
    const { result } = renderHook(
      () => {
        const planner = usePlannerStore();
        return useDay(planner.focus);
      },
      { wrapper },
    );

    let t1 = "";
    act(() => {
      t1 = result.current.addTask("First");
      result.current.addTask("Second");
    });
    expect(result.current.totalCount).toBe(2);
    expect(result.current.doneCount).toBe(0);

    act(() => result.current.toggleTask(t1));
    expect(result.current.doneCount).toBe(1);

    act(() => result.current.deleteTask(t1));
    expect(result.current.totalCount).toBe(1);
  });

  it("migrates legacy storage and stops syncing", async () => {
    vi.resetModules();
    const { PlannerProvider: PProvider, usePlannerStore: useStore } =
      await import("@/components/planner");
    const localWrapper = ({ children }: { children: React.ReactNode }) => (
      <PProvider>{children}</PProvider>
    );

    const original = window.localStorage;
    const store: Record<string, string> = {
      "planner:projects": JSON.stringify([
        { id: "p1", name: "Legacy", done: false, createdAt: 1 },
      ]),
      "planner:tasks": JSON.stringify([
        {
          id: "t1",
          title: "Old",
          done: false,
          createdAt: 1,
          projectId: "p1",
        },
      ]),
    };
    const mockStorage: Storage = {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
      clear: () => {
        for (const k of Object.keys(store)) delete store[k];
      },
      key: (i: number) => Object.keys(store)[i] ?? null,
      get length() {
        return Object.keys(store).length;
      },
    } as unknown as Storage;
    Object.defineProperty(window, "localStorage", {
      value: mockStorage,
      configurable: true,
    });

    const { result } = renderHook(() => useStore(), { wrapper: localWrapper });
    await waitFor(() => {
      expect(result.current.day.projects[0].name).toBe("Legacy");
      expect(result.current.day.tasksByProject).toEqual({ p1: ["t1"] });
    });
    expect(result.current.day.tasksById["t1"]?.title).toBe("Old");
    expect(result.current.day.tasks[0].title).toBe("Old");
    expect(store["planner:projects"]).toBeUndefined();
    expect(store["planner:tasks"]).toBeUndefined();

    act(() => result.current.addProject("New"));
    expect(store["planner:projects"]).toBeUndefined();
    expect(store["planner:tasks"]).toBeUndefined();

    Object.defineProperty(window, "localStorage", {
      value: original,
      configurable: true,
    });
  });
});
