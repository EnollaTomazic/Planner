import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import HomePage from "@/components/home/HomePage";

describe("HomePage", () => {
  it("renders navigation links", () => {
    render(<HomePage />);
    const planner = screen.getByRole("link", { name: "Planner" });
    const reviews = screen.getByRole("link", { name: "Reviews" });
    const prompts = screen.getByRole("link", { name: "Prompts" });
    expect(planner).toHaveAttribute("href", "/planner");
    expect(reviews).toHaveAttribute("href", "/reviews");
    expect(prompts).toHaveAttribute("href", "/prompts");
  });
});
