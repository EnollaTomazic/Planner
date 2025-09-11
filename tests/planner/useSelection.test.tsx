import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("@/lib/db", async () => {
  const actual = await vi.importActual<typeof import("@/lib/db")>("@/lib/db");
  return {
    ...actual,
    usePersistentState: <T,>(key: string, initial: T) => React.useState(initial),
  };
});

import {
  PlannerProvider,
  usePlannerStore,
  useSelectedProject,
  useSelectedTask,
} from "@/components/planner";

describe("useSelection hooks", () => {
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
});
