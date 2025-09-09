import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("@/lib/db", async () => {
  const actual: any = await vi.importActual("@/lib/db");
  return {
    ...actual,
    usePersistentState: <T,>(key: string, initial: T) => React.useState(initial),
  };
});

import { PlannerProvider, usePlannerStore, useDay } from "@/components/planner";

describe("usePlannerStore", () => {
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

    act(() => result.current.planner.renameProject(projectId, "Proj B"));
    expect(result.current.day.projects[0].name).toBe("Proj B");

    let taskId = "";
    act(() => {
      taskId = result.current.planner.addTask("Task 1", projectId);
    });
    expect(result.current.day.tasks).toHaveLength(1);

    act(() => result.current.planner.renameTask(taskId, "Task renamed"));
    expect(result.current.day.tasks[0].title).toBe("Task renamed");

    act(() => result.current.planner.toggleTask(taskId));
    expect(result.current.day.tasks[0].done).toBe(true);

    act(() => result.current.planner.toggleProject(projectId));
    expect(result.current.day.projects[0].done).toBe(true);
    expect(result.current.day.tasks[0].done).toBe(true);

    act(() => result.current.planner.removeTask(taskId));
    expect(result.current.day.tasks).toHaveLength(0);

    act(() => result.current.planner.removeProject(projectId));
    expect(result.current.day.projects).toHaveLength(0);
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
    let t2 = "";
    act(() => {
      t1 = result.current.addTask("First");
      t2 = result.current.addTask("Second");
    });
    expect(result.current.totalTasks).toBe(2);
    expect(result.current.doneTasks).toBe(0);

    act(() => result.current.toggleTask(t1));
    expect(result.current.doneTasks).toBe(1);

    act(() => result.current.deleteTask(t1));
    expect(result.current.totalTasks).toBe(1);
  });
});
