import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

const selectionSetSpy = vi.fn<(value: unknown) => void>();

vi.mock("@/lib/db", async () => {
  const actual = await vi.importActual<typeof import("@/lib/db")>("@/lib/db");
  return {
    ...actual,
    usePersistentState: <T,>(key: string, initial: T) => {
      const [state, setState] = React.useState(initial);
      const trackedSetState = React.useCallback<typeof setState>(
        (value) => {
          if (key === "planner:selected") {
            selectionSetSpy(value);
          }
          setState(value);
        },
        [key],
      );
      return [state, trackedSetState] as const;
    },
  };
});

import {
  PlannerProvider,
  usePlannerStore,
  useSelectedProject,
  useSelectedTask,
  useSelection,
  useDays,
} from "@/components/planner";

describe("useSelection hooks", () => {
  beforeEach(() => {
    selectionSetSpy.mockClear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <PlannerProvider>{children}</PlannerProvider>
  );

  it("tracks project and task selection", () => {
    const { result } = renderHook(
      () => {
        const planner = usePlannerStore();
        const [selectedProject, setSelectedProject] = useSelectedProject(
          planner.focus,
        );
        const [selectedTask, setSelectedTask] = useSelectedTask(planner.focus);
        return {
          planner,
          selectedProject,
          setSelectedProject,
          selectedTask,
          setSelectedTask,
        } as const;
      },
      { wrapper },
    );

    let pid = "";
    act(() => {
      pid = result.current.planner.addProject("Proj");
    });
    let tid = "";
    act(() => {
      tid = result.current.planner.addTask("Task", pid);
    });

    expect(result.current.selectedProject).toBe("");
    expect(result.current.selectedTask).toBe("");

    act(() => result.current.setSelectedProject(pid));
    expect(result.current.selectedProject).toBe(pid);
    expect(result.current.selectedTask).toBe("");

    act(() => result.current.setSelectedTask(tid));
    expect(result.current.selectedTask).toBe(tid);
    expect(result.current.selectedProject).toBe(pid);

    act(() => result.current.setSelectedTask(""));
    expect(result.current.selectedTask).toBe("");
    expect(result.current.selectedProject).toBe("");
  });

  it("clears stale selections once when data disappears", async () => {
    const iso = "2024-01-02";

    const { result } = renderHook(
      () => {
        const planner = usePlannerStore();
        const { selected } = useSelection();
        const { setDays } = useDays();
        const [, setSelectedProject] = useSelectedProject(planner.focus);
        const [, setSelectedTask] = useSelectedTask(planner.focus);

        return {
          planner,
          selected,
          setSelectedProject,
          setSelectedTask,
          setDays,
        } as const;
      },
      { wrapper },
    );

    act(() => {
      result.current.planner.setFocus(iso);
    });

    await waitFor(() => {
      expect(result.current.planner.focus).toBe(iso);
    });

    let projectId = "";
    act(() => {
      projectId = result.current.planner.addProject("Project");
    });
    let taskId = "";
    act(() => {
      taskId = result.current.planner.addTask("Task", projectId);
    });

    await waitFor(() => {
      expect(result.current.selected[iso]).toBeUndefined();
    });

    act(() => result.current.setSelectedProject(projectId));

    await waitFor(() => {
      expect(result.current.selected[iso]?.projectId).toBe(projectId);
    });

    act(() => result.current.setSelectedTask(taskId));

    await waitFor(() => {
      expect(result.current.selected[iso]).toEqual({ projectId, taskId });
    });

    const baseCalls = selectionSetSpy.mock.calls.length;

    act(() => {
      result.current.planner.removeTask(taskId);
    });

    await waitFor(() => {
      expect(result.current.selected[iso]).toBeUndefined();
    });

    expect(selectionSetSpy.mock.calls.length).toBe(baseCalls + 1);

    act(() => {
      projectId = result.current.planner.addProject("Next Project");
    });

    act(() => result.current.setSelectedProject(projectId));

    await waitFor(() => {
      expect(result.current.selected[iso]?.projectId).toBe(projectId);
    });

    const projectCleanupCalls = selectionSetSpy.mock.calls.length;

    act(() => {
      result.current.planner.removeProject(projectId);
    });

    await waitFor(() => {
      expect(result.current.selected[iso]).toBeUndefined();
    });

    expect(selectionSetSpy.mock.calls.length).toBe(projectCleanupCalls + 1);

    act(() => {
      projectId = result.current.planner.addProject("Final Project");
    });

    act(() => result.current.setSelectedProject(projectId));

    await waitFor(() => {
      expect(result.current.selected[iso]?.projectId).toBe(projectId);
    });

    const dayCleanupCalls = selectionSetSpy.mock.calls.length;

    act(() => {
      result.current.setDays((prev) => {
        const next = { ...prev };
        delete next[iso];
        return next;
      });
    });

    await waitFor(() => {
      expect(result.current.selected[iso]).toBeUndefined();
    });

    expect(selectionSetSpy.mock.calls.length).toBe(dayCleanupCalls + 1);
  });
});
