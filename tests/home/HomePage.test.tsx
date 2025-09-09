import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import HomePage from "@/app/page";

describe("HomePage", () => {
  it("renders quick action links", () => {
    render(<HomePage />);
    const planner = screen.getByRole("link", { name: "Planner Today" });
    const goal = screen.getByRole("link", { name: "New Goal" });
    const review = screen.getByRole("link", { name: "New Review" });
    expect(planner).toHaveAttribute("href", "/planner");
    expect(goal).toHaveAttribute("href", "/goals");
    expect(review).toHaveAttribute("href", "/reviews");
  });
});
