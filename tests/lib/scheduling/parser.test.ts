import { describe, it, expect } from "vitest";
import {
  buildRecurringOccurrences,
  parsePlannerPhrase,
  summariseParse,
} from "@/lib/scheduling";

const BASE_DATE = new Date("2024-05-13T09:00:00.000Z");

describe("parsePlannerPhrase", () => {
  it("parses time, recurrence, and cleans the title", () => {
    const result = parsePlannerPhrase("Daily standup every weekday at 9am", {
      now: BASE_DATE,
    });
    expect(result.event.title).toBe("standup");
    expect(result.event.time).toBe("09:00");
    expect(result.recurrence).toEqual({
      frequency: "weekly",
      interval: 1,
      weekdays: [1, 2, 3, 4, 5],
    });
    expect(result.confidence).toBe("high");
  });

  it("detects project intent from prefixes", () => {
    const result = parsePlannerPhrase("Project: Launch Plan", { now: BASE_DATE });
    expect(result.intent).toBe("project");
    expect(result.event.title).toBe("Launch Plan");
  });

  it("resolves explicit weekdays and converts to ISO dates", () => {
    const result = parsePlannerPhrase("Sync next tuesday at 4pm", { now: BASE_DATE });
    expect(result.event.startDate).toBe("2024-05-14");
    expect(result.event.time).toBe("16:00");
  });

  it("handles explicit calendar dates", () => {
    const result = parsePlannerPhrase("Invoice run on June 2", { now: BASE_DATE });
    expect(result.event.startDate).toBe("2024-06-02");
    expect(result.recurrence).toBeNull();
  });
});

describe("buildRecurringOccurrences", () => {
  it("builds the next occurrences for weekly rules", () => {
    const occurrences = buildRecurringOccurrences(
      { frequency: "weekly", interval: 1, weekdays: [1, 3] },
      { startDate: "2024-05-13", count: 4 },
    );
    expect(occurrences).toEqual([
      "2024-05-13",
      "2024-05-15",
      "2024-05-20",
      "2024-05-22",
    ]);
  });

  it("supports monthly intervals", () => {
    const occurrences = buildRecurringOccurrences(
      { frequency: "monthly", interval: 2 },
      { startDate: "2024-01-10", count: 3 },
    );
    expect(occurrences).toEqual(["2024-01-10", "2024-03-10", "2024-05-10"]);
  });
});

describe("summariseParse", () => {
  it("summarises parsed values for UI display", () => {
    const parsed = parsePlannerPhrase("Project: roadmap review on 5/30 at 2pm", {
      now: BASE_DATE,
    });
    const summary = summariseParse(parsed);
    expect(summary).toContain("Project");
    expect(summary).toContain("2024-05-30");
    expect(summary).toContain("14:00");
  });
});
