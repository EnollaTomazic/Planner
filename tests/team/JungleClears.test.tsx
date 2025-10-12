import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

import { JungleClears } from "@/components/team/JungleClears";
import {
  createStorageKey,
  flushWriteLocal,
  setWriteLocalDelay,
  writeLocalDelay,
} from "@/lib/db";

const STORAGE_KEY = createStorageKey("team:jungle.clears.v1");
const ORIGINAL_DELAY = writeLocalDelay;

describe("JungleClears persistence", () => {
  beforeEach(() => {
    setWriteLocalDelay(0);
    window.localStorage.clear();
  });

  afterEach(() => {
    flushWriteLocal();
    setWriteLocalDelay(ORIGINAL_DELAY);
    window.localStorage.clear();
  });

  it("assigns missing ids and persists normalized rows", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          champ: "Missing Id Champ",
          speed: "Fast",
          type: ["Assassin"],
          notes: "Invade level one",
        },
      ]),
    );

    render(<JungleClears editing={false} query="" />);

    await screen.findAllByText("Missing Id Champ");

    await waitFor(() => {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed).toHaveLength(1);
      expect(typeof parsed[0].id).toBe("string");
      expect(parsed[0].id.length).toBeGreaterThan(0);
    });
  });

  it("supports add, edit, and delete flows while editing", async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    const user = userEvent.setup();

    render(<JungleClears editing query="" />);

    const addButtons = await screen.findAllByLabelText("Add row");
    await user.click(addButtons[0]);

    const championInput = await screen.findByLabelText("Champion");
    await user.type(championInput, "Test Champ 123");

    const typeInput = screen.getByLabelText("Type");
    await user.type(typeInput, "Diver");

    const notesInput = screen.getByLabelText("Notes");
    await user.type(notesInput, "Control river vision");

    await user.click(screen.getByLabelText("Save"));

    const [createdCell] = await screen.findAllByText("Test Champ 123", {
      selector: "td",
    });
    const createdRow = createdCell.closest("tr");
    expect(createdRow).not.toBeNull();

    const editButton = within(createdRow!).getByLabelText("Edit");
    await user.click(editButton);

    const editChampionInput = await screen.findByLabelText("Champion");
    await user.clear(editChampionInput);
    await user.type(editChampionInput, "Edited Champ");

    await user.click(screen.getByLabelText("Save"));

    const [updatedCell] = await screen.findAllByText("Edited Champ", {
      selector: "td",
    });
    const updatedRow = updatedCell.closest("tr");
    expect(updatedRow).not.toBeNull();

    const deleteButton = within(updatedRow!).getByLabelText("Delete");
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryAllByText("Edited Champ", { selector: "td" })).toHaveLength(0);
    });
  });
});
