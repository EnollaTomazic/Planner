import * as React from "react";
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, cleanup, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  PlannerProvider,
  usePlannerActions,
  usePlannerStore,
  type ISODate,
} from "@/components/planner";
import { PlannerFab } from "@/components/planner/PlannerFab";
import { addDays, toISODate, fromISODate } from "@/lib/date";
import type {
  PlannerAssistantActionInput,
  PlannerAssistantActionResult,
} from "@/lib/assistant/plannerAssistantAction";
import type { PlannerAssistantPlan } from "@/lib/assistant/plannerAgent";

const defaultAssistantActionResult: PlannerAssistantActionResult = {
  ok: true,
  plan: {
    sanitizedPrompt: "",
    prompt: "",
    summary: null,
    suggestions: [],
    safety: { safeMode: false, temperature: 0, toolChoice: { mode: "none" } },
    tokenBudget: { totalTokens: 0, availableTokens: 0, removedCount: 0 },
  },
  safeMode: { server: false, client: false, active: false },
};

const planWithAssistantAction = vi.hoisted(() =>
  vi.fn<
    (
      input: PlannerAssistantActionInput,
    ) => Promise<PlannerAssistantActionResult>
  >(() => Promise.resolve(defaultAssistantActionResult)),
);

vi.mock("@/lib/assistant/plannerAssistantAction", () => ({
  planWithAssistantAction,
}));

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
  beforeEach(() => {
    planWithAssistantAction.mockReset();
    planWithAssistantAction.mockResolvedValue({
      ok: true,
      plan: createAssistantPlan(),
      safeMode: createSafeModeState(),
    });
  });

  afterEach(() => {
    cleanup();
    harnessState.store = null;
    harnessState.actions = null;
    planWithAssistantAction.mockReset();
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

  it("selects a cloned project when reopening the sheet", async () => {
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
      "Plan tomorrow",
    );
    await userEvent.click(screen.getByRole("button", { name: /save to planner/i }));

    const focusDate = fromISODate(focusIso) ?? new Date();
    const targetIso = toISODate(addDays(focusDate, 1)) as ISODate;
    await waitFor(() => {
      const projects = getStore().getDay(targetIso).projects;
      expect(projects.length).toBeGreaterThan(0);
    });

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: /plan something new/i }),
      ).not.toBeInTheDocument(),
    );

    await userEvent.click(
      screen.getByRole("button", { name: /open planner creation sheet/i }),
    );
    await screen.findByLabelText(/what are you planning/i);

    await waitFor(() => {
      expect(
        screen.getByText(`Select a project for ${targetIso}`),
      ).toBeInTheDocument();
    });

    const projectSelect = screen.getByRole("button", { name: /select option/i });
    await waitFor(() => {
      expect(projectSelect).toHaveTextContent("Alpha");
    });
  });

  it("asks the planner assistant via the server action", async () => {
    const { getStore } = renderPlanner(<PlannerFab />);
    const focusIso = getStore().focus;

    planWithAssistantAction.mockResolvedValue({
      ok: true,
      plan: createAssistantPlan({ summary: "Sprint summary" }),
      safeMode: createSafeModeState(),
    });

    await userEvent.click(
      screen.getByRole("button", { name: /open planner creation sheet/i }),
    );
    await userEvent.type(
      screen.getByLabelText(/what are you planning/i),
      "Plan the sprint",
    );

    await userEvent.click(
      screen.getByRole("button", { name: /ask planner assistant/i }),
    );

    await waitFor(() =>
      expect(planWithAssistantAction).toHaveBeenCalledTimes(1),
    );

    const call = planWithAssistantAction.mock.calls.at(0);
    expect(call?.[0]).toEqual({ prompt: "Plan the sprint", focusDate: focusIso });

    await screen.findByText("Sprint summary");
    expect(screen.getByText("Review backlog")).toBeInTheDocument();
  });

  it("shows safe mode notices when the assistant is restricted", async () => {
    renderPlanner(<PlannerFab />);

    planWithAssistantAction.mockResolvedValue({
      ok: true,
      plan: createAssistantPlan({
        safety: { safeMode: true, temperature: 0.5, toolChoice: { mode: "none" } },
      }),
      safeMode: createSafeModeState({ server: true, client: true, active: true }),
    });

    await userEvent.click(
      screen.getByRole("button", { name: /open planner creation sheet/i }),
    );
    await userEvent.type(
      screen.getByLabelText(/what are you planning/i),
      "Plan the sprint",
    );
    await userEvent.click(
      screen.getByRole("button", { name: /ask planner assistant/i }),
    );

    const safeModeSuggestions = await screen.findAllByText(/review backlog/i);
    expect(safeModeSuggestions.length).toBeGreaterThan(0);
    expect(
      screen.getByText(
        /safe mode is active\. suggestions are limited for additional safety\./i,
      ),
    ).toBeInTheDocument();
  });

  it("renders friendly planner assistant errors", async () => {
    renderPlanner(<PlannerFab />);

    planWithAssistantAction.mockResolvedValue({
      ok: false,
      error: "invalid_request",
      message: "Planner assistant request was invalid.",
      safeMode: createSafeModeState(),
      issues: [{ path: ["prompt"], message: "Required" }],
    });

    await userEvent.click(
      screen.getByRole("button", { name: /open planner creation sheet/i }),
    );
    await userEvent.type(
      screen.getByLabelText(/what are you planning/i),
      "Plan the sprint",
    );
    await userEvent.click(
      screen.getByRole("button", { name: /ask planner assistant/i }),
    );

    await screen.findByText(/planner assistant request was invalid\./i);
    expect(screen.queryByText(/review backlog/i)).not.toBeInTheDocument();
  });
});

function createSafeModeState(
  overrides: Partial<{
    server: boolean;
    client: boolean;
    active: boolean;
  }> = {},
) {
  return {
    server: false,
    client: false,
    active: false,
    ...overrides,
  };
}

function createAssistantPlan(
  overrides: Partial<PlannerAssistantPlan> = {},
): PlannerAssistantPlan {
  const base: PlannerAssistantPlan = {
    sanitizedPrompt: "Plan the sprint",
    prompt: "Plan the sprint",
    summary: "Review backlog",
    suggestions: [
      {
        id: "suggestion-1",
        title: "Review backlog",
        intent: "task",
        confidence: "medium",
        summary: "Refine backlog items",
        schedule: { date: "2024-03-01", time: "09:00" },
      },
    ],
    safety: {
      safeMode: false,
      temperature: 0.3,
      toolChoice: { mode: "none" },
    },
    tokenBudget: {
      totalTokens: 1000,
      availableTokens: 900,
      removedCount: 100,
    },
  };

  return {
    ...base,
    ...overrides,
    suggestions: overrides.suggestions ?? base.suggestions,
    safety: {
      ...base.safety,
      ...overrides.safety,
    },
    tokenBudget: {
      ...base.tokenBudget,
      ...overrides.tokenBudget,
    },
  } satisfies PlannerAssistantPlan;
}

