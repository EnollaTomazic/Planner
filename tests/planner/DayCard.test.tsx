import * as React from "react";
import { render, act, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  DayCard,
  PlannerProvider,
  useDay,
  useSelectedProject,
  todayISO,
} from "@/components/planner";

const iso = todayISO();

interface TestHandle {
  day: ReturnType<typeof useDay>;
  selectedProjectId: string;
  setSelectedProjectId: ReturnType<typeof useSelectedProject>[1];
}

const TestHarness = React.forwardRef((_, ref: React.Ref<TestHandle>) => {
  const day = useDay(iso);
  const [selectedProjectId, setSelectedProjectId] = useSelectedProject(iso);
  React.useImperativeHandle(ref, () => ({
    day,
    selectedProjectId,
    setSelectedProjectId,
  }));
  return <DayCard iso={iso} />;
});

TestHarness.displayName = "TestHarness";

describe("DayCard", () => {
  it("clears selection when selected project is deleted", async () => {
    const harnessRef = React.createRef<TestHandle>();
    render(
      <PlannerProvider>
        <TestHarness ref={harnessRef} />
      </PlannerProvider>,
    );

    let pid = "";
    act(() => {
      pid = harnessRef.current!.day.addProject("Proj")!;
    });

    await waitFor(() => {
      expect(
        harnessRef.current!.day.projects.some((project) => project.id === pid),
      ).toBe(true);
    });

    act(() => {
      harnessRef.current!.setSelectedProjectId(pid);
    });
    expect(harnessRef.current!.selectedProjectId).toBe(pid);

    act(() => {
      harnessRef.current!.day.deleteProject(pid);
    });

    await waitFor(() => {
      expect(harnessRef.current!.selectedProjectId).toBe("");
    });
  });
});
