import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { TeamCompPage } from "@/components/team/TeamCompPage";
import * as BuilderModule from "@/components/team/Builder";
import type { TeamState } from "@/components/team/Builder";
import { createStorageKey, flushWriteLocal, setWriteLocalDelay, writeLocalDelay } from "@/lib/db";
import { useQueryParam } from "@/lib/useQueryParam";

vi.mock("@/lib/useQueryParam", () => ({
  useQueryParam: vi.fn(() => ""),
}));
const mockedUseQueryParam = vi.mocked(useQueryParam);

const ORIGINAL_DELAY = writeLocalDelay;

beforeEach(() => {
  mockedUseQueryParam.mockReturnValue("");
  setWriteLocalDelay(0);
  window.localStorage.clear();
});

afterEach(() => {
  flushWriteLocal();
  setWriteLocalDelay(ORIGINAL_DELAY);
  window.localStorage.clear();
});

describe("TeamCompPage builder tab", () => {
  it("shows builder hero with spacing", () => {
    render(<TeamCompPage />);
    const builderTab = screen.getByRole("tab", { name: "Builder" });
    fireEvent.click(builderTab);
    expect(screen.getByText("Allies 0/5 locked")).toBeInTheDocument();
    expect(screen.getByText("Lane coverage")).toBeInTheDocument();
    expect(screen.getAllByText("Top: Open / Open").length).toBeGreaterThan(0);
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
      const builderTab = screen.getByRole("tab", { name: "Builder" });
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
    const clearsTab = screen.getByRole("tab", { name: "Jungle Clears" });
    fireEvent.click(clearsTab);
    const heading = screen.getByRole("heading", { name: "Clear Speed Buckets" });
    expect(heading).toBeInTheDocument();
    const toggleEdit = screen.getByRole("button", { name: "Edit" });
    fireEvent.click(toggleEdit);
    expect(heading).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(heading).toBeVisible();
    expect(
      screen.getByPlaceholderText(
        "Filter by champion, type, or note..."
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/\d+ shown/i)).toBeInTheDocument();
  });
});

describe("TeamCompPage cheat sheet sub-tab", () => {
  it("falls back to sheet when cached value is invalid", () => {
    const storageKey = createStorageKey("team:cheatsheet:activeSubTab.v1");
    window.localStorage.setItem(storageKey, JSON.stringify("invalid"));

    render(<TeamCompPage />);

    const sheetPanel = screen.getByRole("tabpanel", { name: "Cheat Sheet" });
    expect(sheetPanel).not.toHaveAttribute("hidden");
    window.localStorage.removeItem(storageKey);
  });
});
