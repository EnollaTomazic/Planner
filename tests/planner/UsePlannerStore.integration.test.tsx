import * as React from "react";
import {
  beforeAll,
  beforeEach,
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

type PlannerModule = typeof import("@/components/planner");
type DbModule = typeof import("@/lib/db");

describe("UsePlannerStore", () => {
  let PlannerProvider: PlannerModule["PlannerProvider"];
  let usePlannerStore: PlannerModule["usePlannerStore"];
  let todayISO: PlannerModule["todayISO"];

  let flushWriteLocal: DbModule["flushWriteLocal"];
  let setWriteLocalDelay: DbModule["setWriteLocalDelay"];
  let originalWriteDelay: number;

  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeAll(async () => {
    vi.resetModules();

    const plannerModule = await import("@/components/planner");
    PlannerProvider = plannerModule.PlannerProvider;
    usePlannerStore = plannerModule.usePlannerStore;
    todayISO = plannerModule.todayISO;

    const dbModule = await import("@/lib/db");
    flushWriteLocal = dbModule.flushWriteLocal;
    setWriteLocalDelay = dbModule.setWriteLocalDelay;
    originalWriteDelay = dbModule.writeLocalDelay;

    wrapper = ({ children }) => <PlannerProvider>{children}</PlannerProvider>;
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
      JSON.stringify([{ id: "p1", name: "Legacy", done: false, createdAt: 1 }]),
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
      expect(result.current.day.tasksByProject).toEqual({ p1: ["t1"] });
      expect(result.current.day.tasksById["t1"]?.title).toBe("Old Task");
    });

    flushWriteLocal();

    expect(window.localStorage.getItem("planner:projects")).toBeNull();
    expect(window.localStorage.getItem("planner:tasks")).toBeNull();

    const storedDaysRaw = window.localStorage.getItem(
      "noxis-planner:v1:planner:days",
    );
    expect(storedDaysRaw).not.toBeNull();

    const storedDays = JSON.parse(storedDaysRaw ?? "{}") as Record<
      string,
      {
        projects?: { name?: string }[];
        tasks?: { title?: string }[];
        tasksByProject?: Record<string, string[]>;
        tasksById?: Record<string, { title?: string }>;
      }
    >;

    const focus = result.current.focus;
    expect(storedDays[focus]?.projects?.[0]?.name).toBe("Legacy");
    expect(storedDays[focus]?.tasks?.[0]?.title).toBe("Old Task");
    expect(storedDays[focus]?.tasksByProject).toEqual({ p1: ["t1"] });
    expect(storedDays[focus]?.tasksById?.["t1"]?.title).toBe("Old Task");
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
      "noxis-planner:v1:planner:days",
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
      expect(second.result.current.day.projects[0]?.name).toBe("Persist me");
    });
  });

  it("falls back to today when persisted focus is malformed", async () => {
    const invalidFocus = "2024-13-40";
    window.localStorage.setItem(
      "noxis-planner:v1:planner:focus",
      JSON.stringify(invalidFocus),
    );
    window.localStorage.setItem(
      "noxis-planner:v1:planner:days",
      JSON.stringify({
        [invalidFocus]: {
          tasks: [
            {
              id: "bad-task",
              title: "Should not show",
              done: false,
              createdAt: 1,
              images: [],
            },
          ],
        },
      }),
    );

    const { result } = renderHook(() => usePlannerStore(), { wrapper });

    await waitFor(() => {
      expect(result.current.focus).toBe(todayISO());
    });

    expect(result.current.focus).not.toBe(invalidFocus);
    expect(result.current.day.tasks).toHaveLength(0);
  });

  it("normalizes non-array task images when hydrating", async () => {
    const iso = "2024-05-11";
    window.localStorage.setItem(
      "noxis-planner:v1:planner:days",
      JSON.stringify({
        [iso]: {
          tasks: [
            {
              id: "t1",
              title: "Needs repair",
              done: false,
              createdAt: 1,
              images: "oops",
            },
          ],
        },
      }),
    );

    const { result } = renderHook(() => usePlannerStore(), { wrapper });

    await waitFor(() => {
      expect(result.current.days[iso]?.tasks).toHaveLength(1);
    });

    const task = result.current.days[iso]?.tasks[0];
    expect(task?.images).toEqual([]);
    expect(result.current.days[iso]?.tasksById["t1"]).toBe(task);
  });

  it("repairs corrupted planner storage blobs", async () => {
    const iso = "2024-05-10";
    window.localStorage.setItem(
      "noxis-planner:v1:planner:days",
      JSON.stringify({
        [iso]: {
          projects: [
            { id: "p1", name: "Valid", done: true, createdAt: 1 },
            { id: 2, name: "Bad", done: false, createdAt: 2 },
          ],
          tasks: [
            {
              id: "t1",
              title: "Keep",
              done: false,
              createdAt: 3,
              projectId: "p1",
              images: ["ok", 123, "again"],
            },
            {
              id: "t2",
              title: 42,
              done: true,
              createdAt: 4,
              projectId: "p1",
              images: "bad",
            },
          ],
          tasksByProject: { p1: ["t1", "t2"] },
          tasksById: {
            t1: { id: "t1", title: "Stale" },
          },
          doneCount: 10,
          totalCount: 20,
          focus: "t1",
          notes: 99,
        },
        invalid: {
          projects: [{ id: null }],
        },
      }),
    );

    const { result } = renderHook(() => usePlannerStore(), { wrapper });

    await waitFor(() => {
      expect(result.current.days[iso]?.projects).toHaveLength(1);
    });

    const day = result.current.days[iso]!;
    expect(day.projects).toEqual([
      { id: "p1", name: "Valid", done: true, createdAt: 1 },
    ]);
    expect(day.tasks).toHaveLength(1);
    expect(day.tasks[0]).toEqual({
      id: "t1",
      title: "Keep",
      done: false,
      createdAt: 3,
      projectId: "p1",
      images: ["ok", "again"],
    });
    expect(day.tasksByProject).toEqual({ p1: ["t1"] });
    expect(day.tasksById["t1"]).toBe(day.tasks[0]);
    expect(day.doneCount).toBe(1);
    expect(day.totalCount).toBe(2);
    expect(day.focus).toBe("t1");
    expect(day.notes).toBeUndefined();

    expect(result.current.days.invalid).toBeUndefined();
  });
});
