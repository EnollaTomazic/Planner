import * as React from "react";
import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import {
  render,
  screen,
  waitFor,
  renderHook,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PlannerPage } from "@/components/planner/PlannerPage";
import { PlannerProvider, usePlanner } from "@/components/planner";
import { flushWriteLocal } from "@/lib/db";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PlannerProvider>{children}</PlannerProvider>
);

describe("Planner view modes", () => {
  beforeAll(() => {
    (globalThis as typeof globalThis & { React?: typeof React }).React = React;
  });

  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("switches view modes via segmented control", async () => {
    const user = userEvent.setup();
    render(<PlannerPage />);

    expect(await screen.findByLabelText("Planner day view")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /week/i }));
    expect(
      await screen.findByRole("heading", { name: /week overview/i }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Planner day view")).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /agenda/i }));
    expect(
      await screen.findByRole("heading", { name: /agenda view/i }),
    ).toBeInTheDocument();
  });

  it("restores the persisted view preference", async () => {
    const first = renderHook(() => usePlanner(), { wrapper });

    act(() => {
      first.result.current.setViewMode("week");
    });

    act(() => {
      flushWriteLocal();
    });

    first.unmount();

    const second = renderHook(() => usePlanner(), { wrapper });

    await waitFor(() => {
      expect(second.result.current.viewMode).toBe("week");
    });

    second.unmount();
  });
});
