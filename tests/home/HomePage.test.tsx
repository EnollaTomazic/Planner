import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Page from "@/app/page";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

describe("Home page", () => {
  it("renders navigation links", () => {
    render(<Page />);
    const goals = screen.getByRole("link", { name: "Goals" });
    const reviews = screen.getByRole("link", { name: "Reviews" });
    const team = screen.getByRole("link", { name: "Team" });
    const prompts = screen.getByRole("link", { name: "Prompts" });
    const planner = screen
      .getAllByRole("link", { name: "Planner" })
      .find(l => l.getAttribute("href") === "/planner");
    expect(goals).toHaveAttribute("href", "/goals");
    expect(planner).toHaveAttribute("href", "/planner");
    expect(reviews).toHaveAttribute("href", "/reviews");
    expect(team).toHaveAttribute("href", "/team");
    expect(prompts).toHaveAttribute("href", "/prompts");
  });
});
