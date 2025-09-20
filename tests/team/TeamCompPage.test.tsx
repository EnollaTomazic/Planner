import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import TeamCompPage from "@/components/team/TeamCompPage";
import * as BuilderModule from "@/components/team/Builder";
import type { TeamState } from "@/components/team/Builder";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runAllTimers();
  vi.useRealTimers();
});

describe("TeamCompPage builder tab", () => {
  it("shows builder hero with spacing", () => {
    render(<TeamCompPage />);
    const builderTab = screen.getAllByRole("tab", { name: "Builder" })[0];
    fireEvent.click(builderTab);
    const heroHeading = screen.getByRole("heading", { name: "Builder" });
    expect(heroHeading).toBeInTheDocument();
    const cardParent = screen.getByText("Allies").closest("section")?.parentElement;
    expect(cardParent).toHaveClass("mt-[var(--space-6)]");
  });

  it("handles missing lane entries gracefully", () => {
    const partialState = {
      allies: { top: "Garen" },
      enemies: {},
    } as unknown as TeamState;
    const initSpy = vi
      .spyOn(BuilderModule, "createInitialTeamState")
      .mockReturnValue(partialState);
    try {
      render(<TeamCompPage />);
      const builderTab = screen.getAllByRole("tab", { name: "Builder" })[0];
      fireEvent.click(builderTab);
      expect(screen.getAllByText("Lane coverage").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Mid: Open / Open").length).toBeGreaterThan(0);
    } finally {
      initSpy.mockRestore();
    }
  });
});

describe("TeamCompPage jungle clears tab", () => {
  it("shows clears hero with search and count", () => {
    render(<TeamCompPage />);
    const clearsTab = screen.getAllByRole("tab", { name: "Jungle Clears" })[0];
    fireEvent.click(clearsTab);
    expect(
      screen.getByRole("heading", { name: "Clear Speed Buckets" })
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        "Filter by champion, type, or note..."
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/\d+ shown/i)).toBeInTheDocument();
  });
});
