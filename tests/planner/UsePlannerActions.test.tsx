import { describe, it, expect, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import * as React from "react";
import type { ReactNode } from "react";

import {
  PlannerProvider,
  usePlannerActions,
  usePlannerStore,
} from "@/components/planner";

const wrapper = ({ children }: { children: ReactNode }) => (
  <PlannerProvider>{children}</PlannerProvider>
);

describe("usePlannerActions", () => {
  it("creates trimmed projects and ignores blank input", () => {
    const selectProject = vi.fn<(id: string) => void>();

    const { result } = renderHook(
      () => ({ planner: usePlannerStore(), actions: usePlannerActions() }),
      { wrapper },
    );

    const iso = result.current.planner.focus;
    let created: string | undefined;

    act(() => {
      created = result.current.actions.createProject({
        iso,
        name: "   ",
        select: selectProject,
      });
    });

    expect(created).toBeUndefined();
    expect(selectProject).not.toHaveBeenCalled();
    expect(result.current.planner.day.projects).toHaveLength(0);

    act(() => {
      created = result.current.actions.createProject({
        iso,
        name: "  Launch Plan  ",
        select: selectProject,
      });
    });

    expect(created).toBeDefined();
    expect(selectProject).toHaveBeenCalledWith(created as string);
    expect(result.current.planner.day.projects).toHaveLength(1);
    expect(result.current.planner.day.projects[0].name).toBe("Launch Plan");
  });

  it("creates tasks for a project while guarding blanks and missing project ids", () => {
    const selectTask = vi.fn<(id: string) => void>();

    const { result } = renderHook(
      () => ({ planner: usePlannerStore(), actions: usePlannerActions() }),
      { wrapper },
    );

    const iso = result.current.planner.focus;
    let projectId = "";

    act(() => {
      projectId =
        result.current.actions.createProject({
          iso,
          name: "Project Alpha",
        }) ?? "";
    });

    expect(projectId).not.toBe("");

    let createdTask: string | undefined;

    act(() => {
      createdTask = result.current.actions.createTask({
        iso,
        projectId,
        title: "   ",
        select: selectTask,
      });
    });

    expect(createdTask).toBeUndefined();
    expect(selectTask).not.toHaveBeenCalled();
    expect(result.current.planner.day.tasks).toHaveLength(0);

    selectTask.mockClear();

    act(() => {
      createdTask = result.current.actions.createTask({
        iso,
        projectId,
        title: "  First task  ",
        select: selectTask,
      });
    });

    expect(createdTask).toBeDefined();
    expect(selectTask).toHaveBeenCalledWith(createdTask as string);
    expect(result.current.planner.day.tasks).toHaveLength(1);
    const storedTask = result.current.planner.day.tasksById[createdTask as string];
    expect(storedTask.title).toBe("First task");
    expect(storedTask.projectId).toBe(projectId);
    expect(result.current.planner.day.tasksByProject[projectId]).toEqual([
      createdTask,
    ]);

    selectTask.mockClear();

    act(() => {
      createdTask = result.current.actions.createTask({
        iso,
        projectId: "",
        title: "Another",
        select: selectTask,
      });
    });

    expect(createdTask).toBeUndefined();
    expect(selectTask).not.toHaveBeenCalled();
    expect(result.current.planner.day.tasks).toHaveLength(1);
  });
});
