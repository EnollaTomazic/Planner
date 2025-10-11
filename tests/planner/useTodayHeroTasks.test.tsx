import { describe, it, expect, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import * as React from "react";
import type { FormEvent, ReactNode } from "react";

import { useTodayHeroTasks, type DayTask } from "@/components/planner";

vi.mock("@/components/planner/usePlannerStore", async () => {
  const actual = await vi.importActual<
    typeof import("@/components/planner/usePlannerStore")
  >("@/components/planner/usePlannerStore");

  let projectCounter = 0;
  let taskCounter = 0;

  type PlannerActions = ReturnType<typeof actual.usePlannerActions>;

  const actions: PlannerActions = {
    createProject: ({ iso, name, select }) => {
      if (!iso) return undefined;
      const trimmed = name.trim();
      if (!trimmed) return undefined;
      const id = `proj-${(projectCounter += 1).toString().padStart(2, "0")}`;
      select?.(id);
      return id;
    },
    createTask: ({ iso, projectId, title, select }) => {
      if (!iso || !projectId) return undefined;
      const trimmed = title.trim();
      if (!trimmed) return undefined;
      const id = `task-${(taskCounter += 1).toString().padStart(2, "0")}`;
      select?.(id);
      return id;
    },
  } satisfies PlannerActions;

  return {
    ...actual,
    usePlannerActions: () => actions,
  };
});

const PREVIEW_LIMIT = 12;

type HookParams = Parameters<typeof useTodayHeroTasks>[0];

type Callbacks = {
  setSelectedTaskId: ReturnType<typeof vi.fn<(id: string) => void>>;
  renameTask: ReturnType<typeof vi.fn<(taskId: string, title: string) => void>>;
  deleteTask: ReturnType<typeof vi.fn<(taskId: string) => void>>;
  toggleTask: ReturnType<typeof vi.fn<(taskId: string) => void>>;
};

function createCallbacks(): Callbacks {
  return {
    setSelectedTaskId: vi.fn<(id: string) => void>(),
    renameTask: vi.fn<(taskId: string, title: string) => void>(),
    deleteTask: vi.fn<(taskId: string) => void>(),
    toggleTask: vi.fn<(taskId: string) => void>(),
  };
}

function createTask(index: number, overrides: Partial<DayTask> = {}): DayTask {
  return {
    id: `task-${index}`,
    title: `Task ${index}`,
    done: false,
    projectId: "project-1",
    createdAt: index,
    images: [],
    ...overrides,
  };
}

function createTasks(count: number, overrides: Partial<DayTask> = {}): DayTask[] {
  return Array.from({ length: count }, (_, index) => createTask(index + 1, overrides));
}

function createFormEvent(fieldName: string, value: string) {
  const preventDefault = vi.fn();
  const input = { value } as HTMLInputElement;
  const namedItem = vi.fn((name: string) => (name === fieldName ? input : null));
  const event = {
    preventDefault,
    currentTarget: {
      elements: {
        namedItem,
      },
    },
  } as unknown as FormEvent<HTMLFormElement>;

  return { event, preventDefault, input, namedItem };
}

const iso = "2024-05-02";

const wrapper = ({ children }: { children: ReactNode }) => <>{children}</>;

describe("useTodayHeroTasks", () => {
  it("collapses previews and expands when toggled", async () => {
    const tasks = createTasks(15, { projectId: "project-alpha" });
    const callbacks = createCallbacks();
    const baseProps = {
      iso,
      projectId: "project-alpha",
      projectName: "Alpha",
      renameTask: callbacks.renameTask,
      deleteTask: callbacks.deleteTask,
      toggleTask: callbacks.toggleTask,
      setSelectedTaskId: callbacks.setSelectedTaskId,
    } satisfies Omit<HookParams, "scopedTasks">;
    const initialProps: HookParams = {
      ...baseProps,
      scopedTasks: tasks,
    };

    const { result, rerender } = renderHook(
      (props: HookParams) => useTodayHeroTasks(props),
      { initialProps, wrapper },
    );

    expect(result.current.showAllTasks).toBe(false);
    expect(result.current.visibleTasks).toEqual(tasks.slice(0, PREVIEW_LIMIT));
    expect(result.current.totalTaskCount).toBe(tasks.length);
    expect(result.current.shouldShowTaskToggle).toBe(true);

    act(() => {
      result.current.toggleShowAllTasks();
    });

    expect(result.current.showAllTasks).toBe(true);
    expect(result.current.visibleTasks).toEqual(tasks);

    act(() => {
      result.current.toggleShowAllTasks();
    });

    expect(result.current.showAllTasks).toBe(false);

    act(() => {
      result.current.toggleShowAllTasks();
    });

    expect(result.current.showAllTasks).toBe(true);

    const shorter = tasks.slice(0, 5);
    act(() => {
      rerender({
        ...baseProps,
        scopedTasks: shorter,
      });
    });

    await waitFor(() => {
      expect(result.current.showAllTasks).toBe(false);
    });

    expect(result.current.visibleTasks).toEqual(shorter);
    expect(result.current.totalTaskCount).toBe(shorter.length);
    expect(result.current.shouldShowTaskToggle).toBe(false);
  });

  it("requires a project before submitting and selects new tasks", () => {
    const callbacks = createCallbacks();
    const initialProps: HookParams = {
      iso,
      scopedTasks: [],
      projectId: "",
      projectName: "",
      renameTask: callbacks.renameTask,
      deleteTask: callbacks.deleteTask,
      toggleTask: callbacks.toggleTask,
      setSelectedTaskId: callbacks.setSelectedTaskId,
    };

    const { result, rerender } = renderHook(
      (props: HookParams) => useTodayHeroTasks(props),
      { initialProps, wrapper },
    );

    const initialEvent = createFormEvent(result.current.taskInputName, "  Backlog Task  ");

    act(() => {
      result.current.handleTaskFormSubmit(initialEvent.event);
    });

    expect(initialEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(initialEvent.namedItem).not.toHaveBeenCalled();
    expect(callbacks.setSelectedTaskId).not.toHaveBeenCalled();

    act(() => {
      rerender({
        ...initialProps,
        projectId: "project-alpha",
        projectName: "Alpha",
      });
    });

    const projectEvent = createFormEvent(
      result.current.taskInputName,
      "  Backlog Task  ",
    );

    act(() => {
      result.current.handleTaskFormSubmit(projectEvent.event);
    });

    expect(projectEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(projectEvent.namedItem).toHaveBeenCalledWith(result.current.taskInputName);
    expect(callbacks.setSelectedTaskId).toHaveBeenCalledWith(
      expect.stringMatching(/^task/),
    );
    expect(projectEvent.input.value).toBe("");

    act(() => {
      result.current.handleTaskFormSubmit(projectEvent.event);
    });

    expect(callbacks.setSelectedTaskId).toHaveBeenCalledTimes(1);
  });

  it("hands off selection between toggles and editor interactions", () => {
    const tasks = createTasks(2, { projectId: "project-alpha" });
    const callbacks = createCallbacks();
    const props: HookParams = {
      iso,
      scopedTasks: tasks,
      projectId: "project-alpha",
      projectName: "Alpha",
      renameTask: callbacks.renameTask,
      deleteTask: callbacks.deleteTask,
      toggleTask: callbacks.toggleTask,
      setSelectedTaskId: callbacks.setSelectedTaskId,
    };

    const { result } = renderHook((hookProps: HookParams) => useTodayHeroTasks(hookProps), {
      initialProps: props,
      wrapper,
    });

    act(() => {
      result.current.handleTaskSelect(tasks[0].id);
    });

    expect(callbacks.setSelectedTaskId).toHaveBeenCalledWith(tasks[0].id);

    act(() => {
      result.current.handleTaskToggle(tasks[1].id);
    });

    expect(callbacks.toggleTask).toHaveBeenCalledWith(tasks[1].id);
    expect(callbacks.setSelectedTaskId).toHaveBeenLastCalledWith(tasks[1].id);

    act(() => {
      result.current.openTaskEditor(tasks[1].id, tasks[1].title, { select: true });
    });

    expect(result.current.editingTaskId).toBe(tasks[1].id);
    expect(result.current.editingTaskText).toBe(tasks[1].title);
    expect(callbacks.setSelectedTaskId).toHaveBeenLastCalledWith(tasks[1].id);

    act(() => {
      result.current.handleTaskRenameChange("  Revised Title  ");
    });

    act(() => {
      result.current.commitTaskRename(tasks[1].id, tasks[1].title);
    });

    expect(callbacks.renameTask).toHaveBeenCalledWith(tasks[1].id, "Revised Title");
    expect(result.current.editingTaskId).toBeNull();
  });

  it("resets the editor when tasks disappear", async () => {
    const tasks = createTasks(3, { projectId: "project-alpha" });
    const callbacks = createCallbacks();
    const baseProps = {
      iso,
      projectId: "project-alpha",
      projectName: "Alpha",
      renameTask: callbacks.renameTask,
      deleteTask: callbacks.deleteTask,
      toggleTask: callbacks.toggleTask,
      setSelectedTaskId: callbacks.setSelectedTaskId,
    } satisfies Omit<HookParams, "scopedTasks">;
    const initialProps: HookParams = {
      ...baseProps,
      scopedTasks: tasks,
    };

    const { result, rerender } = renderHook(
      (props: HookParams) => useTodayHeroTasks(props),
      { initialProps, wrapper },
    );

    act(() => {
      result.current.openTaskEditor(tasks[1].id, tasks[1].title);
    });

    expect(result.current.editingTaskId).toBe(tasks[1].id);
    expect(result.current.editingTaskText).toBe(tasks[1].title);

    act(() => {
      rerender({
        ...baseProps,
        scopedTasks: [tasks[0], tasks[2]],
      });
    });

    await waitFor(() => {
      expect(result.current.editingTaskId).toBeNull();
    });

    expect(result.current.editingTaskText).toBe("");
  });

  it("announces task changes with alternating zero-width markers", async () => {
    const projectId = "project-alpha";
    const callbacks = createCallbacks();
    const baseProps = {
      iso,
      projectId,
      projectName: "Alpha",
      renameTask: callbacks.renameTask,
      deleteTask: callbacks.deleteTask,
      toggleTask: callbacks.toggleTask,
      setSelectedTaskId: callbacks.setSelectedTaskId,
    } satisfies Omit<HookParams, "scopedTasks">;
    const initialTasks = [createTask(1, { projectId })];
    const initialProps: HookParams = {
      ...baseProps,
      scopedTasks: initialTasks,
    };

    const { result, rerender } = renderHook(
      (props: HookParams) => useTodayHeroTasks(props),
      { initialProps, wrapper },
    );

    expect(result.current.taskAnnouncementText).toBe("");

    const zeroWidthSpace = "\u200B";

    const withAddition = [...initialTasks, createTask(2, { projectId })];
    act(() => {
      rerender({
        ...baseProps,
        scopedTasks: withAddition,
      });
    });

    await waitFor(() => {
      expect(result.current.taskAnnouncementText).toBe(
        `Task "Task 2" added in project "Alpha".${zeroWidthSpace}`,
      );
    });

    const withoutFirst = [withAddition[1]];
    act(() => {
      rerender({
        ...baseProps,
        scopedTasks: withoutFirst,
      });
    });

    await waitFor(() => {
      expect(result.current.taskAnnouncementText).toBe(
        'Task "Task 1" removed in project "Alpha".',
      );
    });

    const renamed = [{ ...withoutFirst[0], title: "Renamed Task" }];
    act(() => {
      rerender({
        ...baseProps,
        scopedTasks: renamed,
      });
    });

    await waitFor(() => {
      expect(result.current.taskAnnouncementText).toBe(
        `Task "Task 2" renamed to "Renamed Task" in project "Alpha".${zeroWidthSpace}`,
      );
    });

    const completed = [{ ...renamed[0], done: true }];
    act(() => {
      rerender({
        ...baseProps,
        scopedTasks: completed,
      });
    });

    await waitFor(() => {
      expect(result.current.taskAnnouncementText).toBe(
        'Task "Renamed Task" marked complete in project "Alpha".',
      );
    });

    const incomplete = [{ ...completed[0], done: false }];
    act(() => {
      rerender({
        ...baseProps,
        scopedTasks: incomplete,
      });
    });

    await waitFor(() => {
      expect(result.current.taskAnnouncementText).toBe(
        `Task "Renamed Task" marked incomplete in project "Alpha".${zeroWidthSpace}`,
      );
    });
  });
});
