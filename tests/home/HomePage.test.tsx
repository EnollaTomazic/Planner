import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import HomePage from "@/components/home/HomePage";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("HomePage", () => {
  it("renders navigation links", () => {
    render(<HomePage />);
    const goals = screen.getByRole("link", { name: "Goals" });
    const planner = screen.getByRole("link", { name: "Planner" });
    const reviews = screen.getByRole("link", { name: "Reviews" });
    const team = screen.getByRole("link", { name: "Team" });
    const prompts = screen.getByRole("link", { name: "Prompts" });
    expect(goals).toHaveAttribute("href", "/goals");
    expect(planner).toHaveAttribute("href", "/planner");
    expect(reviews).toHaveAttribute("href", "/reviews");
    expect(team).toHaveAttribute("href", "/team");
    expect(prompts).toHaveAttribute("href", "/prompts");
  });
});
