import { describe, expect, it } from "vitest";
import {
  decodePlannerDays,
  HYDRATION_TODAY,
  pruneOldDays,
  sanitizeTaskReminder,
  taskRemindersEqual,
} from "../plannerSerialization";
import type { DayTask, TaskReminder } from "../plannerTypes";

describe("sanitizeTaskReminder", () => {
  it("normalizes reminder fields and drops empty payloads", () => {
    expect(sanitizeTaskReminder(null)).toBeUndefined();
    expect(
      sanitizeTaskReminder({ reminderId: "   ", time: "not-time", leadMinutes: -5 }),
    ).toBeUndefined();

    const reminder = sanitizeTaskReminder({
      reminderId: "  foo ",
      time: "25:99",
      leadMinutes: 1500,
    });

    expect(reminder).toEqual({
      enabled: true,
      reminderId: "foo",
      leadMinutes: 24 * 60,
    });
  });

  it("respects explicit enabled flags but still trims inputs", () => {
    const reminder = sanitizeTaskReminder({
      enabled: false,
      reminderId: " primary ",
      time: "09:30",
    });

    expect(reminder).toEqual({ enabled: false, reminderId: "primary", time: "09:30" });
  });
});

describe("taskRemindersEqual", () => {
  it("compares normalized reminders", () => {
    const base: TaskReminder = { enabled: true, reminderId: "x", time: "08:00" };
    expect(taskRemindersEqual(base, { ...base })).toBe(true);
    expect(
      taskRemindersEqual(base, { enabled: true, reminderId: "x", time: "08:15" }),
    ).toBe(false);
  });
});

describe("decodePlannerDays", () => {
  it("sanitizes mixed task payloads and drops hydration placeholders", () => {
    const rawTasks: unknown[] = [
      {
        id: "t-1",
        title: "First",
        done: false,
        createdAt: 100,
        reminder: { reminderId: "abc", time: "07:00" },
      },
      {
        id: "t-2",
        title: "Second",
        done: true,
        createdAt: 200,
        reminder: { time: "invalid" },
      },
      { id: 3, createdAt: "bad" },
    ];

    const decoded = decodePlannerDays({
      "2024-05-01": {
        projects: [
          { id: "p-1", name: "Project", done: false, createdAt: 1 },
          { id: "p-2", name: "Old", done: true, createdAt: 2 },
        ],
        tasks: rawTasks,
        focus: "Stay focused",
      },
      [HYDRATION_TODAY]: {},
    });

    const day = decoded["2024-05-01"];
    expect(day.tasks).toHaveLength(2);
    expect(day.tasksById?.["t-1"]).toMatchObject({ id: "t-1", title: "First" });
    expect(day.tasksById?.["t-1"]?.reminder).toEqual({
      enabled: true,
      reminderId: "abc",
      time: "07:00",
    });
    expect(day.tasksById?.["t-2"]?.reminder).toBeUndefined();
    expect(day.tasksByProject?.["p-1"] ?? []).toEqual([]);
    expect(day.doneCount).toBe(2);
    expect(decoded).not.toHaveProperty(HYDRATION_TODAY);
  });
});

describe("pruneOldDays", () => {
  it("removes entries older than the max age when given a deterministic now", () => {
    const tasks: DayTask[] = [
      { id: "t", title: "Task", done: false, createdAt: 1 },
    ];
    const input = {
      "2024-01-01": { projects: [], tasks, tasksById: {}, tasksByProject: {}, doneCount: 0, totalCount: 1 },
      "2023-12-20": { projects: [], tasks, tasksById: {}, tasksByProject: {}, doneCount: 0, totalCount: 1 },
    };

    const result = pruneOldDays(input, { maxAgeDays: 10, now: "2024-01-10" });
    expect(result.pruned).toEqual(["2023-12-20"]);
    expect(result.days).toHaveProperty("2024-01-01");
    expect(result.days).not.toHaveProperty("2023-12-20");
  });

  it("returns the original map for invalid configuration", () => {
    const empty = pruneOldDays({}, { maxAgeDays: -1, now: "2024-01-10" });
    expect(empty.pruned).toBeUndefined();
    expect(empty.days).toEqual({});
  });
});
