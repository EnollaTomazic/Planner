import * as React from "react";
import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import PlannerPage from "@/components/planner/PlannerPage";
import { createStorageKey } from "@/lib/db";
import { resetLocalStorage } from "../setup";

const { createElement } = React;

beforeAll(() => {
  (globalThis as typeof globalThis & { React?: typeof React }).React = React;
});

describe("PlannerPage view modes", () => {
  beforeEach(() => {
    resetLocalStorage();
    window.scrollTo = vi.fn();
  });

  it("switches view modes without remounting planner data", async () => {
    const user = userEvent.setup();
    render(createElement(PlannerPage));

    const weekList = await screen.findByRole("list", {
      name: /week days/i,
    });
    expect(weekList).toBeInTheDocument();

    const agendaTab = screen.getByRole("tab", { name: /agenda/i });
    await user.click(agendaTab);

    expect(
      await screen.findByRole("list", { name: /agenda \(next 14 days\)/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: /week days/i })).toBeNull();

    const dayTab = screen.getByRole("tab", { name: /day/i });
    await user.click(dayTab);

    expect(
      await screen.findByRole("list", { name: /selected day/i }),
    ).toBeInTheDocument();
  });

  it("restores the persisted view mode preference", async () => {
    const key = createStorageKey("planner:view-mode");
    window.localStorage.setItem(key, JSON.stringify("agenda"));

    render(createElement(PlannerPage));

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /agenda/i })).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });

    expect(
      await screen.findByRole("list", { name: /agenda \(next 14 days\)/i }),
    ).toBeInTheDocument();
  });
});

