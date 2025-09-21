import { describe, it, expect } from "vitest";

import { decodePlannerDays } from "@/components/planner";

describe("DecodePlannerDays", () => {
  it("returns an empty object for invalid input", () => {
    expect(decodePlannerDays(null)).toEqual({});
    expect(decodePlannerDays(undefined)).toEqual({});
    expect(decodePlannerDays([])).toEqual({});
  });

  it("repairs planner day records and filters invalid entries", () => {
    const decoded = decodePlannerDays({
      "2024-05-10": {
        projects: [
          { id: "p1", name: "Alpha", done: true, createdAt: 1 },
          { id: 2, name: "Bad", done: false, createdAt: 3 },
        ],
        tasks: [
          {
            id: "t1",
            title: "Task",
            done: true,
            createdAt: 5,
            projectId: "p1",
            images: ["one", 2, "two"],
          },
          {
            id: "bad",
            title: 12,
            done: false,
            createdAt: "oops",
            projectId: "p1",
            images: "nope",
          },
        ],
        tasksById: { stale: { id: "stale" } },
        tasksByProject: { p1: ["stale"] },
        doneCount: 99,
        totalCount: 5,
        focus: "t1",
        notes: "Keep me",
      },
      "2024-05-11": {
        projects: "invalid",
        tasks: [
          {
            id: "t2",
            title: "Loose",
            done: false,
            createdAt: 2,
            projectId: 7,
            images: null,
          },
        ],
        focus: 42,
        notes: ["no"],
      },
      "2024-05-12": "nope",
    });

    expect(Object.keys(decoded)).toEqual(["2024-05-10", "2024-05-11"]);

    const first = decoded["2024-05-10"];
    expect(first.projects).toHaveLength(1);
    expect(first.projects[0]).toEqual({
      id: "p1",
      name: "Alpha",
      done: true,
      createdAt: 1,
    });
    expect(first.tasks).toHaveLength(1);
    expect(first.tasks[0]).toEqual({
      id: "t1",
      title: "Task",
      done: true,
      createdAt: 5,
      projectId: "p1",
      images: ["one", "two"],
    });
    expect(first.tasksById["t1"]).toBe(first.tasks[0]);
    expect(first.tasksByProject).toEqual({ p1: ["t1"] });
    expect(first.doneCount).toBe(2);
    expect(first.totalCount).toBe(2);
    expect(first.focus).toBe("t1");
    expect(first.notes).toBe("Keep me");

    const second = decoded["2024-05-11"];
    expect(second.projects).toEqual([]);
    expect(second.tasks).toHaveLength(1);
    expect(second.tasks[0]).toEqual({
      id: "t2",
      title: "Loose",
      done: false,
      createdAt: 2,
      images: [],
    });
    expect(second.tasks[0].projectId).toBeUndefined();
    expect(second.tasksById["t2"]).toBe(second.tasks[0]);
    expect(second.tasksByProject).toEqual({});
    expect(second.doneCount).toBe(0);
    expect(second.totalCount).toBe(1);
    expect(second.focus).toBeUndefined();
    expect(second.notes).toBeUndefined();
  });
});
