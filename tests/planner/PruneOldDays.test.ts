import { describe, it, expect } from "vitest";

import { pruneOldDays } from "@/components/planner/plannerSerialization";
import type { DayRecord } from "@/components/planner/plannerTypes";
import { fromISODate, toISODate } from "@/lib/date";

function createDay(): DayRecord {
  return {
    projects: [],
    tasks: [],
    tasksById: {},
    tasksByProject: {},
    doneCount: 0,
    totalCount: 0,
  };
}

function isoDaysAgo(reference: Date, days: number) {
  const date = new Date(reference.getTime());
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function withTimezone(tz: string, run: () => void) {
  const originalTZ = process.env.TZ;
  process.env.TZ = tz;
  try {
    run();
  } finally {
    if (originalTZ === undefined) {
      delete process.env.TZ;
    } else {
      process.env.TZ = originalTZ;
    }
  }
}

describe("PruneOldDays", () => {
  it("drops entries older than the default retention window", () => {
    const reference = new Date("2024-03-05T12:00:00Z");
    const withinIso = isoDaysAgo(reference, 200);
    const expiredIso = isoDaysAgo(reference, 400);

    const map: Record<string, DayRecord> = {
      [withinIso]: createDay(),
      [expiredIso]: createDay(),
    };

    const result = pruneOldDays(map, { now: reference });

    expect(result).not.toBe(map);
    expect(result[expiredIso]).toBeUndefined();
    expect(result[withinIso]).toBe(map[withinIso]);
    expect(map[expiredIso]).toBeDefined();
  });

  it("returns the original map when no pruning is needed", () => {
    const reference = new Date("2024-03-05T12:00:00Z");
    const iso = isoDaysAgo(reference, 10);

    const map: Record<string, DayRecord> = {
      [iso]: createDay(),
    };

    const result = pruneOldDays(map, { now: reference });

    expect(result).toBe(map);
  });

  it("removes entries once the cutoff advances past them", () => {
    const reference = new Date("2024-03-05T12:00:00Z");
    const maxAgeDays = 30;
    const thresholdIso = isoDaysAgo(reference, maxAgeDays);

    const map: Record<string, DayRecord> = {
      [thresholdIso]: createDay(),
    };

    const beforeCutoff = pruneOldDays(map, { now: reference, maxAgeDays });
    expect(beforeCutoff).toBe(map);

    const advanced = new Date(reference.getTime());
    advanced.setDate(advanced.getDate() + 1);

    const afterCutoff = pruneOldDays(map, { now: advanced, maxAgeDays });
    expect(afterCutoff).not.toBe(map);
    expect(afterCutoff[thresholdIso]).toBeUndefined();
    expect(map[thresholdIso]).toBeDefined();
  });

  it("honors a custom retention window", () => {
    const reference = new Date("2024-03-05T12:00:00Z");
    const withinIso = isoDaysAgo(reference, 20);
    const expiredIso = isoDaysAgo(reference, 40);

    const map: Record<string, DayRecord> = {
      [withinIso]: createDay(),
      [expiredIso]: createDay(),
    };

    const result = pruneOldDays(map, { now: reference, maxAgeDays: 30 });

    expect(result[withinIso]).toBe(map[withinIso]);
    expect(result[expiredIso]).toBeUndefined();
    expect(map[expiredIso]).toBeDefined();
  });

  it("retains same-day entries at zero retention in offset timezones", () => {
    withTimezone("America/Los_Angeles", () => {
      const todayIso = "2024-03-05";
      const map: Record<string, DayRecord> = {
        [todayIso]: createDay(),
      };

      const result = pruneOldDays(map, { now: todayIso, maxAgeDays: 0 });

      expect(result).toBe(map);
      expect(result[todayIso]).toBe(map[todayIso]);
    });
  });

  it("retains the retention boundary day for offset timezones", () => {
    withTimezone("America/Los_Angeles", () => {
      const maxAgeDays = 30;
      const referenceIso = "2024-03-05";
      const reference = fromISODate(referenceIso);
      if (!reference) throw new Error("referenceIso should parse");

      const threshold = new Date(reference.getTime());
      threshold.setDate(threshold.getDate() - maxAgeDays);
      threshold.setHours(0, 0, 0, 0);
      const thresholdIso = toISODate(threshold);

      const map: Record<string, DayRecord> = {
        [thresholdIso]: createDay(),
      };

      const result = pruneOldDays(map, {
        now: referenceIso,
        maxAgeDays,
      });

      expect(result).toBe(map);
      expect(result[thresholdIso]).toBe(map[thresholdIso]);
    });
  });
});

