import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PlannerProvider, WeekNotes } from "@/components/planner";

const ISO = "2024-01-03";

describe("WeekNotes", () => {
  it("associates the textarea with the header text", () => {
    render(
      <PlannerProvider>
        <WeekNotes iso={ISO} />
      </PlannerProvider>,
    );

    const textarea = screen.getByRole("textbox", { name: "Day notes" });

    expect(textarea).toHaveAttribute("aria-labelledby", `notes-${ISO}-header`);
    expect(textarea).toHaveAttribute("aria-label", "Day notes");
  });
});
