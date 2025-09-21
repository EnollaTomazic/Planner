import { describe, expect, it } from "vitest";

import { decodePrompts } from "@/components/prompts";

describe("decodePrompts", () => {
  it("returns null for non-array inputs", () => {
    expect(decodePrompts(null)).toBeNull();
    expect(decodePrompts(undefined)).toBeNull();
    expect(decodePrompts({})).toBeNull();
  });

  it("filters invalid prompt entries", () => {
    const decoded = decodePrompts([
      {
        id: "p1",
        title: "Keep",
        text: "Prompt one",
        createdAt: 1,
      },
      {
        id: "p2",
        text: "",
        createdAt: 2,
        title: 123,
      },
      {
        id: 3,
        text: "Bad",
        createdAt: 3,
      },
      {
        id: "p4",
        text: 4,
        createdAt: "bad",
      },
    ]);

    expect(decoded).toEqual([
      {
        id: "p1",
        title: "Keep",
        text: "Prompt one",
        createdAt: 1,
      },
      {
        id: "p2",
        text: "",
        createdAt: 2,
      },
    ]);
  });
});
