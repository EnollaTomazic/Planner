import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, beforeEach, afterEach } from "vitest";

import { CheatSheet } from "@/components/team/CheatSheet";
import { decodeCheatSheet, type Archetype } from "@/components/team/cheatSheet.model";
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

  it("preserves apostrophes and ampersands while editing", async () => {
    const user = userEvent.setup();

    render(<CheatSheet editing query="" />);

    const titleNode = await screen.findByText("Front to Back");
    const card = titleNode.closest("article");
    expect(card).not.toBeNull();

    const utils = within(card!);

    await user.click(utils.getByRole("button", { name: "Edit" }));

    const titleInput = utils.getByLabelText("Archetype title");
    await user.clear(titleInput);
    await user.type(titleInput, "Kai's & Kindred");

    const descriptionInput = utils.getByLabelText("Description");
    await user.clear(descriptionInput);
    await user.type(descriptionInput, "Don't ampersand & keep raw");

    await user.click(utils.getByRole("button", { name: "Save" }));

    expect(await utils.findByText("Kai's & Kindred")).toBeInTheDocument();
    expect(
      await utils.findByText("Don't ampersand & keep raw"),
    ).toBeInTheDocument();

    await waitFor(() => {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed[0]?.title).toBe("Kai's & Kindred");
      expect(parsed[0]?.description).toBe("Don't ampersand & keep raw");
    });
  });
});
