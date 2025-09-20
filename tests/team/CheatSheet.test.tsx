import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, afterEach } from "vitest";

import CheatSheet, { Archetype, decodeCheatSheet } from "@/components/team/CheatSheet";
import {
  createStorageKey,
  flushWriteLocal,
  setWriteLocalDelay,
  writeLocalDelay,
} from "@/lib/db";

const STORAGE_KEY = createStorageKey("team:cheatsheet.v2");
const ORIGINAL_DELAY = writeLocalDelay;

describe("decodeCheatSheet", () => {
  it("accepts valid archetype arrays", () => {
    const data: Archetype[] = [
      {
        id: "valid",
        title: "Valid Archetype",
        description: "Details",
        wins: ["Win condition"],
        struggles: ["Loses"],
        tips: ["Tip"],
        examples: {
          Top: ["Garen"],
          Jungle: ["Jarvan"],
        },
      },
    ];

    expect(decodeCheatSheet(data)).toEqual(data);
  });

  it("returns null when structure is invalid", () => {
    expect(decodeCheatSheet(null)).toBeNull();
    expect(decodeCheatSheet({})).toBeNull();
    expect(
      decodeCheatSheet([
        {
          id: "bad",
          title: "Missing fields",
          description: "",
          wins: "not an array",
          examples: {},
        },
      ]),
    ).toBeNull();

    expect(
      decodeCheatSheet([
        {
          id: "bad-examples",
          title: "Bad examples",
          description: "",
          wins: ["Ok"],
          examples: {
            Top: [123],
          },
        } as unknown as Archetype,
      ]),
    ).toBeNull();
  });
});

describe("CheatSheet persistence", () => {
  beforeEach(() => {
    setWriteLocalDelay(0);
    window.localStorage.clear();
  });

  afterEach(() => {
    flushWriteLocal();
    setWriteLocalDelay(ORIGINAL_DELAY);
    window.localStorage.clear();
  });

  it("falls back to defaults when stored value is corrupted", async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ unexpected: true }));

    expect(() => render(<CheatSheet editing={false} query="" />)).not.toThrow();

    expect(await screen.findByText("Front to Back")).toBeInTheDocument();

    await waitFor(() => {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(Array.isArray(parsed)).toBe(true);
    });
  });
});
