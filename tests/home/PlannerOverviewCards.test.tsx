import * as React from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import PlannerOverviewSummaryCard from "@/components/home/home-landing/PlannerOverviewSummaryCard";
import PlannerOverviewFocusCard from "@/components/home/home-landing/PlannerOverviewFocusCard";
import PlannerOverviewCalendarCard from "@/components/home/home-landing/PlannerOverviewCalendarCard";

afterEach(cleanup);

const spacingPrefixes = [
  "p",
  "px",
  "py",
  "pt",
  "pb",
  "pl",
  "pr",
  "gap",
  "space-x",
  "space-y",
  "rounded",
];

function expectNoRawUtilities(element: Element | null) {
  expect(element).not.toBeNull();
  if (!element) {
    throw new Error("Expected element to be present for token audit");
  }

  const className = element.getAttribute("class") ?? "";
  for (const prefix of spacingPrefixes) {
    const pattern = new RegExp(`(?:^|[\\s:])${prefix}-(?!\\[)`);
    expect(pattern.test(className)).toBe(false);
  }
}

describe("Planner overview glitch cards", () => {
  it("summary card sticks to tokenised spacing and disables transitions for reduced motion", () => {
    const { getByRole } = render(
      <PlannerOverviewSummaryCard
        label="Summary"
        title="Planner overview"
        items={[
          {
            key: "focus",
            label: "Next focus",
            value: "Monday",
            href: "/planner",
            cta: "Open planner",
          },
        ]}
      />,
    );

    const summaryLink = getByRole("link", { name: /Open planner/ });
    expect(summaryLink.className).toContain("px-[var(--space-3)]");
    expect(summaryLink.className).toContain("motion-reduce:transition-none");
    expectNoRawUtilities(summaryLink);

    const cta = summaryLink.lastElementChild;
    expect(cta?.className ?? "").toContain("motion-reduce:transition-none");
    expectNoRawUtilities(cta);
  });

  it("focus card toggle relies on tokens and opts out of transitions when motion is reduced", () => {
    const { getByRole } = render(
      <PlannerOverviewFocusCard
        label="Focus"
        title="Today"
        doneCount={1}
        totalCount={3}
        tasks={[
          {
            id: "task-1",
            title: "Draft review",
            projectName: "Alpha",
            done: false,
            toggleLabel: "Toggle Draft review",
          },
        ]}
        remainingTasks={0}
        onToggleTask={() => {}}
      />,
    );

    const toggleButton = getByRole("button", { name: "Toggle Draft review" });
    expect(toggleButton.className).toContain("px-[var(--space-1)]");
    expect(toggleButton.className).toContain("motion-reduce:transition-none");
    expectNoRawUtilities(toggleButton);
  });

  it("calendar day button surfaces tokens and honours reduced motion", () => {
    const { getByRole } = render(
      <PlannerOverviewCalendarCard
        label="Week"
        title="Week of Jan 8"
        summary="Planner week"
        doneCount={2}
        totalCount={5}
        hasPlannedTasks
        days={[
          {
            iso: "2024-01-08",
            weekday: "Mon",
            dayNumber: "08",
            done: 1,
            total: 3,
            disabled: false,
            loading: false,
            selected: true,
            today: true,
          },
        ]}
        onSelectDay={() => {}}
      />,
    );

    const dayButton = getByRole("button", { name: /Mon/ });
    expect(dayButton.className).toContain("px-[var(--space-3)]");
    expect(dayButton.className).toContain("motion-reduce:transition-none");
    expectNoRawUtilities(dayButton);
  });
});

