import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

const selectionSetSpy = vi.fn<(value: unknown) => void>();

vi.mock("@/lib/db", async () => {
  const actual = await vi.importActual<typeof import("@/lib/db")>("@/lib/db");
  return {
    ...actual,
    usePersistentState: <T,>(key: string, initial: T, _options?: unknown) => {
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
  todayISO,
  type DayRecord,
} from "@/components/planner";

describe("UseSelection", () => {
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
      pid = result.current.planner.addProject("Proj")!;
    });
    let tid = "";
    act(() => {
      tid = result.current.planner.addTask("Task", pid)!;
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
    const iso = todayISO();

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
      projectId = result.current.planner.addProject("Project")!;
    });
    let taskId = "";
    act(() => {
      taskId = result.current.planner.addTask("Task", projectId)!;
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
      projectId = result.current.planner.addProject("Next Project")!;
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
      projectId = result.current.planner.addProject("Final Project")!;
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

  it("prunes aged days and clears related selections", async () => {
    vi.useFakeTimers();
    try {
      const initial = new Date("2023-01-01T12:00:00Z");
      vi.setSystemTime(initial);

      const { result } = renderHook(
        () => {
          const { days, setDays } = useDays();
          const { selected, setSelected } = useSelection();
          return { days, setDays, selected, setSelected } as const;
        },
        { wrapper },
      );

      const iso = "2023-01-01";
      const day: DayRecord = {
        projects: [
          { id: "p1", name: "Project", done: false, createdAt: 0 },
        ],
        tasks: [],
        tasksById: {},
        tasksByProject: {},
        doneCount: 0,
        totalCount: 1,
      };

      act(() => {
        result.current.setDays(() => ({
          [iso]: day,
        }));
      });
      expect(result.current.days[iso]).toBeDefined();

      act(() => {
        result.current.setSelected((prev) => ({
          ...prev,
          [iso]: { projectId: "p1" },
        }));
      });
      expect(result.current.selected[iso]?.projectId).toBe("p1");

      vi.setSystemTime(new Date("2024-02-01T12:00:00Z"));

      await act(async () => {
        result.current.setDays((prev) => ({ ...prev }));
        await Promise.resolve();
      });

      expect(result.current.days[iso]).toBeUndefined();
      expect(result.current.selected[iso]).toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });
});
