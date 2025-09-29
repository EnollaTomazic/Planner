import { describe, it, expect } from "vitest";
import {
  buildRecurringTemplates,
  parsePlannerPhrase,
  type PlannerRecurringRule,
} from "@/lib/scheduling";

const reference = new Date(2024, 0, 1, 9, 0, 0);

describe("parsePlannerPhrase", () => {
  it("returns fallback when no temporal hints", () => {
    const result = parsePlannerPhrase("Plan sprint", { referenceDate: reference, fallbackISO: "2024-01-01" });
    expect(result).not.toBeNull();
    expect(result?.title).toBe("Plan sprint");
    expect(result?.startDate).toBe("2024-01-01");
    expect(result?.occurrences).toEqual(["2024-01-01"]);
    expect(result?.recurrence).toBeUndefined();
  });

  it("extracts relative dates and times", () => {
    const result = parsePlannerPhrase("Standup tomorrow at 9am", {
      referenceDate: reference,
      fallbackISO: "2024-01-01",
    });
    expect(result).not.toBeNull();
    expect(result?.startDate).toBe("2024-01-02");
    expect(result?.time).toBe("09:00");
    expect(result?.title).toBe("Standup");
  });

  it("detects weekly recurrences", () => {
    const result = parsePlannerPhrase("Standup every monday and wednesday at 9am", {
      referenceDate: reference,
      fallbackISO: "2024-01-01",
    });
    expect(result).not.toBeNull();
    const recurrence = result?.recurrence as PlannerRecurringRule;
    expect(recurrence.frequency).toBe("weekly");
    expect(recurrence.daysOfWeek).toEqual([1, 3]);
    expect(result?.occurrences.slice(0, 3)).toEqual([
      "2024-01-01",
      "2024-01-03",
      "2024-01-08",
    ]);
  });

  it("creates weekday suggestions", () => {
    const result = parsePlannerPhrase("Journal every weekday at 7am", {
      referenceDate: reference,
      fallbackISO: "2024-01-01",
    });
    expect(result).not.toBeNull();
    const templates = buildRecurringTemplates(result!);
    expect(templates).toHaveLength(3);
    expect(templates[0]?.occurrences).toHaveLength(1);
    expect(templates[2]?.occurrences).toHaveLength(3);
    expect(result?.title).toBe("Journal");
  });
});
