import { describe, expect, it } from "vitest";

import { decodeGoals } from "@/components/goals";

describe("decodeGoals", () => {
  it("returns null for non-array inputs", () => {
    expect(decodeGoals(null)).toBeNull();
    expect(decodeGoals(undefined)).toBeNull();
    expect(decodeGoals({})).toBeNull();
  });

  it("filters invalid goal entries while preserving valid fields", () => {
    const decoded = decodeGoals([
      {
        id: "g1",
        title: "Keep",
        pillar: "Wave",
        metric: "CS",
        notes: "Track progress",
        done: false,
        createdAt: 1,
      },
      {
        id: 2,
        title: "Skip",
        done: false,
        createdAt: 2,
      },
      null,
      {
        id: "g2",
        title: "Second",
        pillar: "NotAPillar",
        metric: 42,
        notes: { text: "bad" },
        done: true,
        createdAt: 3,
      },
    ]);

    expect(decoded).toEqual([
      {
        id: "g1",
        title: "Keep",
        pillar: "Wave",
        metric: "CS",
        notes: "Track progress",
        done: false,
        createdAt: 1,
      },
      {
        id: "g2",
        title: "Second",
        done: true,
        createdAt: 3,
      },
    ]);
  });
});
