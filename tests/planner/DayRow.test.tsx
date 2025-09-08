import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DayRow, PlannerProvider } from "@/components/planner";

describe("DayRow", () => {
  it("renders day section with aria label", () => {
    render(
      <PlannerProvider>
        <DayRow iso="2024-01-01" isToday={false} />
      </PlannerProvider>,
    );
    expect(
      screen.getByRole("listitem", { name: "Day 2024-01-01" }),
    ).toBeInTheDocument();
  });
});
