import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  deriveGoalProgress,
  parseFraction,
  parseOfFormat,
  parsePercentage, GoalsCard } from "@/components/home/GoalsCard";
import type { Goal } from "@/lib/types";

vi.mock("@/components/goals", () => ({
  useGoals: vi.fn(),
}));

import { useGoals } from "@/components/goals";

type GoalsHookValue = ReturnType<typeof useGoals>;

const noop = () => {};
const returnTrue = () => true;

function createGoalsState(goals: Goal[]): GoalsHookValue {
  return {
    goals,
    err: null,
    setErr: noop as GoalsHookValue["setErr"],
    lastDeleted: null,
    addGoal: returnTrue as GoalsHookValue["addGoal"],
    toggleDone: noop as GoalsHookValue["toggleDone"],
    removeGoal: noop as GoalsHookValue["removeGoal"],
    updateGoal: noop as GoalsHookValue["updateGoal"],
    undoRemove: noop,
    clearGoals: noop,
  };
}

function createGoal(overrides: Partial<Goal> & Pick<Goal, "id" | "title">): Goal {
  return {
    id: overrides.id,
    title: overrides.title,
    done: overrides.done ?? false,
    metric: overrides.metric,
    notes: overrides.notes,
    pillar: overrides.pillar,
    createdAt: overrides.createdAt ?? 1_700_000_000_000,
  };
}

function createCompletedGoal(): Goal {
  const goal = createGoal({
    id: "goal-complete",
    title: "Wrap onboarding",
    done: true,
    metric: "Shipped milestone",
  });
  let readCount = 0;
  Object.defineProperty(goal, "done", {
    configurable: true,
    get() {
      readCount += 1;
      return readCount > 1;
    },
  });
  return goal;
}

const mockUseGoals = vi.mocked(useGoals);

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe("GoalsCard", () => {
  beforeEach(() => {
    mockUseGoals.mockReset();
  });

  it("renders completed goals and parses fractional metrics", () => {
    const completedGoal = createCompletedGoal();
    const fractionGoal = createGoal({
      id: "goal-fraction",
      title: "Win scrims",
      metric: "3/5",
    });
    const ofGoal = createGoal({
      id: "goal-of",
      title: "Close deals",
      metric: "7 of 10",
    });

    mockUseGoals.mockReturnValue(
      createGoalsState([completedGoal, fractionGoal, ofGoal]),
    );

    render(<GoalsCard />);

    const manageGoalsLink = screen.getByRole("link", { name: "Manage Goals" });
    expect(manageGoalsLink).toHaveAttribute("href", "/goals");

    const completedProgress = screen.getByRole("progressbar", {
      name: "Wrap onboarding complete",
    });
    expect(completedProgress).toHaveAttribute("aria-valuenow", "100");
    expect(screen.getByText("Shipped milestone")).toHaveClass("tabular-nums");

    const fractionProgress = screen.getByRole("progressbar", {
      name: "Win scrims: 3/5",
    });
    expect(fractionProgress).toHaveAttribute("aria-valuenow", "60");
    expect(screen.getByText("3/5")).toHaveClass("tabular-nums");

    const ofProgress = screen.getByRole("progressbar", {
      name: "Close deals: 7 of 10",
    });
    expect(ofProgress).toHaveAttribute("aria-valuenow", "70");
    expect(screen.getByText("7 of 10")).toHaveClass("tabular-nums");
  });

  it("parses percent metrics and falls back when metric text is missing", () => {
    const percentGoal = createGoal({
      id: "goal-percent",
      title: "Improve NPS",
      metric: "40%",
    });
    const metriclessGoal = createGoal({
      id: "goal-metricless",
      title: "Refine baseline",
    });

    mockUseGoals.mockReturnValue(
      createGoalsState([percentGoal, metriclessGoal]),
    );

    render(<GoalsCard />);

    const percentProgress = screen.getByRole("progressbar", {
      name: "Improve NPS: 40%",
    });
    expect(percentProgress).toHaveAttribute("aria-valuenow", "40");
    const percentMetric = screen.getByText("40%", { selector: "p" });
    expect(percentMetric).toHaveClass("tabular-nums");

    const fallback = screen.getByText("No metric yet");
    expect(fallback.tagName).toBe("P");
  });

  it("shows the empty state when all goals are completed", () => {
    const completedGoal = createGoal({
      id: "done-goal",
      title: "Ship Q1 roadmap",
      done: true,
      metric: "100%",
    });

    mockUseGoals.mockReturnValue(createGoalsState([completedGoal]));

    render(<GoalsCard />);

    expect(screen.getByText("No active goals")).toBeInTheDocument();
    const manageGoalsLink = screen.getByRole("link", { name: "Manage Goals" });
    expect(manageGoalsLink).toHaveAttribute("href", "/goals");
  });
});

describe("metric parsers", () => {
  it("parses fractions", () => {
    expect(parseFraction("3/5")).toEqual({
      value: 60,
      labelSuffix: "3/5",
      display: "3/5",
    });
  });

  it("returns null for invalid fractions", () => {
    expect(parseFraction("3/0")).toBeNull();
    expect(parseFraction("three/five")).toBeNull();
  });

  it("parses of format", () => {
    expect(parseOfFormat("7 of 10")).toEqual({
      value: 70,
      labelSuffix: "7 of 10",
      display: "7 of 10",
    });
    expect(parseOfFormat("8 out of 16")).toEqual({
      value: 50,
      labelSuffix: "8 of 16",
      display: "8 out of 16",
    });
  });

  it("returns null for invalid of format", () => {
    expect(parseOfFormat("7 of 0")).toBeNull();
    expect(parseOfFormat("just words")).toBeNull();
  });

  it("parses percentages", () => {
    expect(parsePercentage("40%")).toEqual({
      value: 40,
      labelSuffix: "40%",
      display: "40%",
    });
    expect(parsePercentage("55 percent")).toEqual({
      value: 55,
      labelSuffix: "55%",
      display: "55 percent",
    });
  });

  it("returns null for invalid percentages", () => {
    expect(parsePercentage("percent")).toBeNull();
    expect(parsePercentage("--%")).toBeNull();
  });

  it("lets deriveGoalProgress fall back for malformed metrics", () => {
    const goal = createGoal({
      id: "bad-metric",
      title: "Stretch goal",
      metric: "nope",
    });

    expect(deriveGoalProgress(goal)).toBeNull();
  });
});
