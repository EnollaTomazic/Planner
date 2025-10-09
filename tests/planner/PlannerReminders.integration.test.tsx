import * as React from "react";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

type PlannerModule = typeof import("@/components/planner");
type DbModule = typeof import("@/lib/db");

describe("Planner reminders integration", () => {
  let PlannerProvider: PlannerModule["PlannerProvider"];
  let usePlannerStore: PlannerModule["usePlannerStore"];
  let usePlannerReminders: PlannerModule["usePlannerReminders"];

  let flushWriteLocal: DbModule["flushWriteLocal"];
  let setWriteLocalDelay: DbModule["setWriteLocalDelay"];
  let originalWriteDelay: number;

  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeAll(async () => {
    const plannerModule = await import("@/components/planner");
    PlannerProvider = plannerModule.PlannerProvider;
    usePlannerStore = plannerModule.usePlannerStore;
    usePlannerReminders = plannerModule.usePlannerReminders;

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

  it("persists reminder attachments and rehydrates offline", async () => {
    const hook = renderHook(
      () => ({
        planner: usePlannerStore(),
        reminders: usePlannerReminders(),
      }),
      { wrapper },
    );

    await waitFor(() => {
      expect(hook.result.current.planner.day.projects).toBeDefined();
    });

    let projectId: string | undefined;
    act(() => {
      projectId = hook.result.current.planner.addProject("Reminder Ready");
    });
    expect(projectId).toBeTruthy();

    let taskId: string | undefined;
    act(() => {
      taskId = hook.result.current.planner.addTask(
        "Attach reminder",
        projectId,
      );
    });
    expect(taskId).toBeTruthy();

    const reminderId = hook.result.current.reminders.items[0]?.id;
    expect(reminderId).toBeTruthy();

    act(() => {
      hook.result.current.planner.updateTaskReminder(taskId!, {
        enabled: true,
        reminderId: reminderId!,
        time: "10:15",
        leadMinutes: 15,
      });
    });

    await waitFor(() => {
      expect(
        hook.result.current.planner.day.tasksById[taskId!]?.reminder,
      ).toMatchObject({
        enabled: true,
        reminderId,
        time: "10:15",
        leadMinutes: 15,
      });
    });

    flushWriteLocal();

    const storedDaysRaw = window.localStorage.getItem(
      "noxis-planner:v1:planner:days",
    );
    expect(storedDaysRaw).toBeTruthy();

    const storedDays = JSON.parse(storedDaysRaw ?? "{}") as Record<
      string,
      {
        tasks?: Array<{
          id?: string;
          reminder?: {
            enabled?: boolean;
            reminderId?: string;
            time?: string;
            leadMinutes?: number;
          };
        }>;
      }
    >;

    const focus = hook.result.current.planner.focus;
    const storedReminder = storedDays[focus]?.tasks?.find(
      (task) => task?.id === taskId,
    )?.reminder;

    expect(storedReminder).toMatchObject({
      enabled: true,
      reminderId,
      time: "10:15",
      leadMinutes: 15,
    });

    hook.unmount();

    const rerender = renderHook(() => usePlannerStore(), { wrapper });

    await waitFor(() => {
      expect(rerender.result.current.day.tasksById[taskId!]?.reminder).toMatchObject({
        enabled: true,
        reminderId,
        time: "10:15",
        leadMinutes: 15,
      });
    });

    rerender.unmount();
  });
});
