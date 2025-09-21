import { describe, expect, it } from "vitest";

import { decodeReviews } from "@/components/reviews/useReviews";

describe("decodeReviews", () => {
  it("returns null for non-array inputs", () => {
    expect(decodeReviews(null)).toBeNull();
    expect(decodeReviews(undefined)).toBeNull();
    expect(decodeReviews({})).toBeNull();
  });

  it("repairs review entries and drops corrupted data", () => {
    const decoded = decodeReviews([
      {
        id: "r1",
        title: "Primary",
        opponent: "Zed",
        lane: "Mid",
        side: "Blue",
        patch: "14.1",
        duration: "35:00",
        matchup: "Zed vs Talon",
        tags: ["solo", 1, "review"],
        pillars: ["Wave", "Tempo", "Fake"],
        notes: "Focus on wave control",
        result: "Win",
        score: 8,
        role: "MID",
        focusOn: true,
        focus: 7,
        markers: [
          {
            id: "m1",
            time: "00:30",
            seconds: 30,
            note: "Trading mistake",
            noteOnly: true,
          },
          {
            id: "m2",
            time: 42,
            seconds: "oops",
            note: null,
          },
        ],
        status: "new",
        createdAt: 10,
      },
      {
        id: "r2",
        title: "Secondary",
        tags: "nope",
        pillars: ["Comms", "Nope"],
        side: "Green",
        result: "Draw",
        score: "9",
        role: "COACH",
        focusOn: "yes",
        focus: "ten",
        markers: "none",
        notes: 123,
        createdAt: 20,
      },
      {
        id: "bad",
        title: "skip",
        createdAt: "bad",
        tags: [],
        pillars: [],
      },
    ]);

    expect(decoded).toEqual([
      {
        id: "r1",
        title: "Primary",
        opponent: "Zed",
        lane: "Mid",
        side: "Blue",
        patch: "14.1",
        duration: "35:00",
        matchup: "Zed vs Talon",
        tags: ["solo", "review"],
        pillars: ["Wave", "Tempo"],
        notes: "Focus on wave control",
        result: "Win",
        score: 8,
        role: "MID",
        focusOn: true,
        focus: 7,
        markers: [
          {
            id: "m1",
            time: "00:30",
            seconds: 30,
            note: "Trading mistake",
            noteOnly: true,
          },
        ],
        status: "new",
        createdAt: 10,
      },
      {
        id: "r2",
        title: "Secondary",
        tags: [],
        pillars: ["Comms"],
        createdAt: 20,
      },
    ]);
  });
});
