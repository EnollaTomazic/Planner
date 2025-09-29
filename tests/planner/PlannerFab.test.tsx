import * as React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  PlannerProvider,
  usePlannerActions,
  usePlannerStore,
  type ISODate,
} from "@/components/planner";
import PlannerFab from "@/components/planner/PlannerFab";
import { addDays, toISODate, fromISODate } from "@/lib/date";

type HarnessState = {
  store: ReturnType<typeof usePlannerStore> | null;
  actions: ReturnType<typeof usePlannerActions> | null;
};

const harnessState: HarnessState = { store: null, actions: null };

function Harness() {
  harnessState.store = usePlannerStore();
  harnessState.actions = usePlannerActions();
  return null;
}

function renderPlanner(ui: React.ReactElement) {
  const view = render(
    <PlannerProvider>
      <Harness />
      {ui}
    </PlannerProvider>,
  );
  if (!harnessState.store || !harnessState.actions) {
    throw new Error("Planner harness failed to initialise");
  }
  return {
    ...view,
    getStore: () => harnessState.store as ReturnType<typeof usePlannerStore>,
    getActions: () => harnessState.actions as ReturnType<typeof usePlannerActions>,
  };
}

describe("PlannerFab", () => {
  afterEach(() => {
    cleanup();
    harnessState.store = null;
    harnessState.actions = null;
  });

  it("renders the floating action button", () => {
    renderPlanner(<PlannerFab />);
    expect(
      screen.getByRole("button", { name: /open planner creation sheet/i }),
    ).toBeInTheDocument();
  });

  it("opens the creation sheet and focuses the textarea", async () => {
    renderPlanner(<PlannerFab />);
    await userEvent.click(
      screen.getByRole("button", { name: /open planner creation sheet/i }),
    );
    const dialog = await screen.findByRole("dialog", { name: /plan something new/i });
    expect(dialog).toBeInTheDocument();
    const input = screen.getByLabelText(/what are you planning/i);
    await waitFor(() => expect(input).toHaveFocus());
  });

  it("creates a project when switching to project mode", async () => {
    const { getStore } = renderPlanner(<PlannerFab />);
    await userEvent.click(
      screen.getByRole("button", { name: /open planner creation sheet/i }),
    );
    const projectToggle = screen.getByRole("tab", { name: /project/i });
    await userEvent.click(projectToggle);
    await userEvent.type(
      screen.getByLabelText(/what are you planning/i),
      "Launch Sequencer",
    );
    await userEvent.click(screen.getByRole("button", { name: /save to planner/i }));

    const focusIso = getStore().focus;
    await waitFor(() => {
      const projects = getStore().getDay(focusIso).projects;
      expect(projects.some((project) => project.name === "Launch Sequencer")).toBe(true);
    });
  });

  it("creates a task with parsed reminder details", async () => {
    const { getStore, getActions } = renderPlanner(<PlannerFab />);
    const focusIso = getStore().focus;
    await act(async () => {
      getActions().createProject({ iso: focusIso, name: "Alpha" });
    });

    await userEvent.click(
      screen.getByRole("button", { name: /open planner creation sheet/i }),
    );
    await userEvent.type(
      screen.getByLabelText(/what are you planning/i),
      "Sync with design tomorrow at 9am",
    );
    await userEvent.click(screen.getByRole("button", { name: /save to planner/i }));

    const focusDate = fromISODate(focusIso) ?? new Date();
    const targetIso = toISODate(addDays(focusDate, 1));
    await waitFor(() => {
      const tasks = getStore().getDay(targetIso as ISODate).tasks;
      expect(tasks.find((task) => task.title === "Sync with design")).toBeDefined();
    });
    const tasks = getStore().getDay(targetIso as ISODate).tasks;
    const created = tasks.find((task) => task.title === "Sync with design");
    expect(created?.reminder?.time).toBe("09:00");
    const targetProjects = getStore().getDay(targetIso as ISODate).projects;
    expect(targetProjects.length).toBeGreaterThan(0);
    expect(created?.projectId).toBe(targetProjects[0]?.id);
  });

  it("shows recurring suggestions when a repeating rule is parsed", async () => {
    const { getStore, getActions } = renderPlanner(<PlannerFab />);
    const focusIso = getStore().focus;
    await act(async () => {
      getActions().createProject({ iso: focusIso, name: "Alpha" });
    });

    await userEvent.click(
      screen.getByRole("button", { name: /open planner creation sheet/i }),
    );
    await userEvent.type(
      screen.getByLabelText(/what are you planning/i),
      "Daily standup every weekday at 9am",
    );

    await screen.findByText(/upcoming occurrences/i);
    const suggestionButtons = screen.getAllByRole("button", {
      name: /\d{4}-\d{2}-\d{2}/,
    });
    expect(suggestionButtons.length).toBeGreaterThan(0);
  });
});
