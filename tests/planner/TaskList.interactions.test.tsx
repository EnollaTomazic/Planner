import * as React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  cleanup,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import TaskList from "@/components/planner/TaskList";
import type { DayTask, DayRecord } from "@/components/planner/plannerTypes";
import { reorderProjectTasks } from "@/components/planner/dayCrud";

const reorderController: {
  current?: (values: string[]) => void;
} = {};

vi.mock("framer-motion", async () => {
  const React = await import("react");
  const Group = React.forwardRef<HTMLUListElement, any>(function Group(
    { values, onReorder, children, ...props },
    ref,
  ) {
    reorderController.current = onReorder;
    return (
      <ul ref={ref} {...props}>
        {children}
      </ul>
    );
  });

  const Item = React.forwardRef<HTMLElement, any>(function Item(
    { as: Component = "li", children, ...props },
    ref,
  ) {
    const Comp = Component as React.ElementType;
    return <Comp ref={ref} {...props}>{children}</Comp>;
  });

  const useMotionValue = (initial: number) => {
    let value = initial;
    return {
      get: () => value,
      set: (next: number) => {
        value = next;
      },
    };
  };

  const useReducedMotion = () => false;

  const animate = (
    motionValue: { set: (value: number) => void },
    toValue: number,
  ) => {
    motionValue.set(toValue);
  };

  const motion = new Proxy(
    {},
    {
      get: (_target, key: string) => {
        if (key === "create") {
          return (Component: React.ElementType) =>
            React.forwardRef<any, any>((props, ref) =>
              React.createElement(Component, { ref, ...props }),
            );
        }

        return React.forwardRef<any, any>((props, ref) =>
          React.createElement(key, { ref, ...props }),
        );
      },
    },
  );

  return {
    Reorder: { Group, Item },
    useMotionValue,
    useReducedMotion,
    animate,
    motion,
  };
});

const baseTask = (id: string, title: string): DayTask => ({
  id,
  title,
  done: false,
  projectId: "p1",
  createdAt: 0,
  images: [],
});

describe("TaskList interactions", () => {
  beforeEach(() => {
    reorderController.current = undefined;
  });

  afterEach(() => {
    cleanup();
  });

  const renderTaskList = (overrides: Partial<React.ComponentProps<typeof TaskList>> = {}) => {
    const tasks: Record<string, DayTask> = {
      t1: baseTask("t1", "First"),
      t2: baseTask("t2", "Second"),
      t3: baseTask("t3", "Third"),
    };
    const defaultProps: React.ComponentProps<typeof TaskList> = {
      tasksById: tasks,
      tasksByProject: { p1: ["t1", "t2", "t3"] },
      selectedProjectId: "p1",
      createTask: () => undefined,
      renameTask: () => {},
      toggleTask: () => {},
      deleteTask: () => {},
      reorderTasks: () => {},
      addTaskImage: () => {},
      removeTaskImage: () => {},
      setSelectedTaskId: () => {},
    };
    return render(<TaskList {...defaultProps} {...overrides} />);
  };

  it("calls reorderTasks when drag-reordering items", () => {
    const reorderTasks = vi.fn();
    const { container } = renderTaskList({ reorderTasks });

    expect(reorderController.current).toBeDefined();

    act(() => {
      reorderController.current?.(["t2", "t1", "t3"]);
    });

    expect(reorderTasks).toHaveBeenCalledWith("p1", ["t2", "t1", "t3"]);
    const ids = Array.from(
      container.querySelectorAll("[data-task-id]"),
    ).map((node) => node.getAttribute("data-task-id"));
    expect(ids).toEqual(["t2", "t1", "t3"]);
  });

  it("supports keyboard reordering for accessibility", () => {
    const reorderTasks = vi.fn();
    renderTaskList({ reorderTasks });

    const selectButtons = screen.getAllByLabelText(/Select task/);
    fireEvent.keyDown(selectButtons[0], { key: "ArrowDown", altKey: true });

    expect(reorderTasks).toHaveBeenCalledWith("p1", ["t2", "t1", "t3"]);
  });

  it("triggers swipe handlers for toggle and delete", () => {
    const toggleTask = vi.fn();
    const deleteTask = vi.fn();
    const setSelectedTaskId = vi.fn();
    const { container } = renderTaskList({
      toggleTask,
      deleteTask,
      setSelectedTaskId,
    });

    const rows = Array.from(container.querySelectorAll<HTMLElement>("[data-task-id]"));
    const first = rows[0]!;
    fireEvent.pointerDown(first, { pointerId: 1, clientX: 10, clientY: 0, buttons: 1 });
    fireEvent.pointerMove(first, { pointerId: 1, clientX: 120, clientY: 4, buttons: 1 });
    fireEvent.pointerUp(first, { pointerId: 1, clientX: 120, clientY: 4 });

    expect(toggleTask).toHaveBeenCalledTimes(1);
    expect(toggleTask).toHaveBeenCalledWith("t1");
    expect(setSelectedTaskId).toHaveBeenNthCalledWith(1, "t1");

    const second = rows[1]!;
    fireEvent.pointerDown(second, { pointerId: 2, clientX: 120, clientY: 2, buttons: 1 });
    fireEvent.pointerMove(second, { pointerId: 2, clientX: 10, clientY: 2, buttons: 1 });
    fireEvent.pointerUp(second, { pointerId: 2, clientX: 10, clientY: 2 });

    expect(deleteTask).toHaveBeenCalledTimes(1);
    expect(deleteTask).toHaveBeenCalledWith("t2");
    expect(setSelectedTaskId).toHaveBeenNthCalledWith(2, "");
  });

  it("reorders project tasks in the store", () => {
    const tasks: DayTask[] = [
      { id: "a", title: "Alpha", done: false, projectId: "p1", createdAt: 0, images: [] },
      { id: "b", title: "Beta", done: false, projectId: "p1", createdAt: 1, images: [] },
      { id: "c", title: "Gamma", done: false, createdAt: 2, images: [] },
    ];
    const day: DayRecord = {
      projects: [
        { id: "p1", name: "Project", done: false, createdAt: 0 },
      ],
      tasks,
      tasksById: {
        a: tasks[0]!,
        b: tasks[1]!,
        c: tasks[2]!,
      },
      tasksByProject: { p1: ["a", "b"] },
      doneCount: 0,
      totalCount: 3,
      focus: "",
      notes: "",
    };

    const reordered = reorderProjectTasks(day, "p1", ["b", "a"]);
    expect(reordered).not.toBe(day);
    expect(reordered.tasks.map((task) => task.id)).toEqual(["b", "a", "c"]);
    expect(reordered.tasksByProject.p1).toEqual(["b", "a"]);
  });
});
