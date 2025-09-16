import * as React from "react";
import { beforeAll, beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

type PlannerModule = typeof import("@/components/planner");
type DbModule = typeof import("@/lib/db");

describe("usePlannerStore integration", () => {
  let PlannerProvider: PlannerModule["PlannerProvider"];
  let usePlannerStore: PlannerModule["usePlannerStore"];

  let flushWriteLocal: DbModule["flushWriteLocal"];
  let setWriteLocalDelay: DbModule["setWriteLocalDelay"];
  let originalWriteDelay: number;

  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeAll(async () => {
    vi.resetModules();

    const plannerModule = await import("@/components/planner");
    PlannerProvider = plannerModule.PlannerProvider;
    usePlannerStore = plannerModule.usePlannerStore;

    const dbModule = await import("@/lib/db");
    flushWriteLocal = dbModule.flushWriteLocal;
    setWriteLocalDelay = dbModule.setWriteLocalDelay;
    originalWriteDelay = dbModule.writeLocalDelay;

    wrapper = ({ children }) => (
      <PlannerProvider>{children}</PlannerProvider>
    );
  });

  beforeEach(() => {
    window.localStorage.clear();
    setWriteLocalDelay(0);
  });

  afterEach(() => {
    flushWriteLocal();
    window.localStorage.clear();
    setWriteLocalDelay(originalWriteDelay);
  });

  it("migrates legacy storage into planner days", async () => {
    window.localStorage.setItem(
      "planner:projects",
      JSON.stringify([
        { id: "p1", name: "Legacy", done: false, createdAt: 1 },
      ]),
    );
    window.localStorage.setItem(
      "planner:tasks",
      JSON.stringify([
        {
          id: "t1",
          title: "Old Task",
          done: false,
          createdAt: 1,
          projectId: "p1",
          images: [],
        },
      ]),
    );

    const { result } = renderHook(() => usePlannerStore(), { wrapper });

    await waitFor(() => {
      expect(result.current.day.projects[0]?.name).toBe("Legacy");
    });

    flushWriteLocal();

    expect(window.localStorage.getItem("planner:projects")).toBeNull();
    expect(window.localStorage.getItem("planner:tasks")).toBeNull();

    const storedDaysRaw = window.localStorage.getItem(
      "noxis-planner:planner:days",
    );
    expect(storedDaysRaw).not.toBeNull();

    const storedDays = JSON.parse(storedDaysRaw ?? "{}") as Record<
      string,
      {
        projects?: { name?: string }[];
        tasks?: { title?: string }[];
      }
    >;

    const focus = result.current.focus;
    expect(storedDays[focus]?.projects?.[0]?.name).toBe("Legacy");
    expect(storedDays[focus]?.tasks?.[0]?.title).toBe("Old Task");
  });

  it("persists planner updates across provider instances", async () => {
    const first = renderHook(() => usePlannerStore(), { wrapper });

    await waitFor(() => {
      expect(first.result.current.day.projects).toHaveLength(0);
    });

    act(() => {
      first.result.current.addProject("Persist me");
    });

    await waitFor(() => {
      expect(first.result.current.day.projects[0]?.name).toBe("Persist me");
    });

    flushWriteLocal();

    const storedDaysRaw = window.localStorage.getItem(
      "noxis-planner:planner:days",
    );
    expect(storedDaysRaw).not.toBeNull();

    const storedDays = JSON.parse(storedDaysRaw ?? "{}") as Record<
      string,
      { projects?: { name?: string }[] }
    >;
    const focus = first.result.current.focus;
    expect(storedDays[focus]?.projects?.[0]?.name).toBe("Persist me");

    first.unmount();

    const second = renderHook(() => usePlannerStore(), { wrapper });

    await waitFor(() => {
      expect(second.result.current.day.projects[0]?.name).toBe(
        "Persist me",
      );
    });
  });
});
