import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import HomePage from "@/app/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("HomePage", () => {
  it("renders quick action buttons", () => {
    render(<HomePage />);
    expect(screen.getByRole("button", { name: "Planner Today" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New Goal" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New Review" })).toBeInTheDocument();
  });
});
