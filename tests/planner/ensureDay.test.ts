import { describe, it, expect } from "vitest";

import {
  ensureDay,
  type DayRecord,
  type DayTask,
  type ISODate,
  type Project,
} from "@/components/planner/plannerStore";

describe("ensureDay", () => {
  it("initializes a missing day with empty defaults", () => {
    const iso: ISODate = "2024-01-01";
    const days: Record<ISODate, DayRecord> = {};

    const result = ensureDay(days, iso);

    expect(result).toEqual({
      projects: [],
      tasks: [],
      tasksById: {},
      tasksByProject: {},
      doneCount: 0,
      totalCount: 0,
    });
  });

  it("adds default image arrays to legacy tasks", () => {
    const iso: ISODate = "2024-01-02";
    const baseTask: DayTask = {
      id: "t-1",
      title: "Legacy task",
      done: false,
      createdAt: 1,
      images: [],
    };
    const legacyTask = {
      id: baseTask.id,
      title: baseTask.title,
      done: baseTask.done,
      createdAt: baseTask.createdAt,
    } as unknown as DayTask;
    const legacyRecord: DayRecord = {
      projects: [],
      tasks: [legacyTask],
      tasksById: {},
      tasksByProject: {},
      doneCount: 0,
      totalCount: 1,
    };
    const days: Record<ISODate, DayRecord> = { [iso]: legacyRecord };

    const result = ensureDay(days, iso);

    expect(result).not.toBe(legacyRecord);
    expect(result.tasks).not.toBe(legacyRecord.tasks);
    expect(result.tasks[0].images).toEqual([]);
    expect(Array.isArray(result.tasks[0].images)).toBe(true);
    expect(result.tasksById[baseTask.id]).toBe(result.tasks[0]);
  });

  it("recomputes lookups when stored maps are missing", () => {
    const iso: ISODate = "2024-01-03";
    const project: Project = {
      id: "p-1",
      name: "Project",
      done: false,
      createdAt: 1,
    };
    const task: DayTask = {
      id: "t-2",
      title: "Linked task",
      done: false,
      projectId: project.id,
      createdAt: 2,
      images: [],
    };
    const legacyRecord = {
      projects: [project],
      tasks: [task],
    } as unknown as DayRecord;
    const days: Record<ISODate, DayRecord> = { [iso]: legacyRecord };

    const result = ensureDay(days, iso);

    expect(result).not.toBe(legacyRecord);
    expect(result.tasks).toBe(legacyRecord.tasks);
    expect(result.tasksById).toEqual({ [task.id]: task });
    expect(result.tasksByProject).toEqual({ [project.id]: [task.id] });
    expect(result.doneCount).toBe(0);
    expect(result.totalCount).toBe(2);
  });
});
