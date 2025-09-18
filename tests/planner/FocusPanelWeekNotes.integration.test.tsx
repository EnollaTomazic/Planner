import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, afterEach, describe, expect, it } from "vitest";
import {
  FocusPanel,
  PlannerProvider,
  WeekNotes,
} from "@/components/planner";
import {
  createStorageKey,
  flushWriteLocal,
  setWriteLocalDelay,
  writeLocalDelay,
} from "@/lib/db";

const ISO = new Date().toISOString().slice(0, 10);
const INITIAL_FOCUS = "Deep work sprint";
const INITIAL_NOTES = "Prep deck, sync with design.";

describe("FocusPanel and WeekNotes integration", () => {
  let storageKey: string;
  let originalWriteDelay: number;

  beforeAll(() => {
    storageKey = createStorageKey("planner:days");
    originalWriteDelay = writeLocalDelay;
  });

  beforeEach(() => {
    window.localStorage.clear();
    setWriteLocalDelay(0);
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        [ISO]: {
          focus: INITIAL_FOCUS,
          notes: INITIAL_NOTES,
          projects: [],
          tasks: [],
        },
      }),
    );
  });

  afterEach(() => {
    flushWriteLocal();
    window.localStorage.clear();
    setWriteLocalDelay(originalWriteDelay);
  });

  it("displays and persists focus separately from notes", async () => {
    render(
      <PlannerProvider>
        <FocusPanel iso={ISO} />
        <WeekNotes iso={ISO} />
      </PlannerProvider>,
    );

    const focusInput = screen.getByPlaceholderText(
      "What’s the one thing today?",
    ) as HTMLInputElement;
    const notesTextarea = screen.getByRole("textbox", {
      name: "Notes",
    }) as HTMLTextAreaElement;

    await waitFor(() => {
      expect(focusInput).toHaveValue(INITIAL_FOCUS);
    });
    await waitFor(() => {
      expect(notesTextarea).toHaveValue(INITIAL_NOTES);
    });

    const user = userEvent.setup();

    await user.clear(focusInput);
    const UPDATED_FOCUS = "Team OKR planning";
    await user.type(focusInput, UPDATED_FOCUS);
    await waitFor(() => {
      expect(focusInput).toHaveValue(UPDATED_FOCUS);
    });
    focusInput.blur();

    await waitFor(() => {
      flushWriteLocal();
      const stored = JSON.parse(
        window.localStorage.getItem(storageKey) ?? "{}",
      ) as Record<string, { focus?: string; notes?: string }>;
      expect(stored[ISO]?.focus).toBe(UPDATED_FOCUS);
      expect(stored[ISO]?.notes).toBe(INITIAL_NOTES);
    });

    await user.clear(notesTextarea);
    const UPDATED_NOTES = "Draft agenda and share links.";
    await user.type(notesTextarea, UPDATED_NOTES);
    await waitFor(() => {
      expect(notesTextarea).toHaveValue(UPDATED_NOTES);
    });
    notesTextarea.blur();

    await waitFor(() => {
      flushWriteLocal();
      const stored = JSON.parse(
        window.localStorage.getItem(storageKey) ?? "{}",
      ) as Record<string, { focus?: string; notes?: string }>;
      expect(stored[ISO]?.focus).toBe(UPDATED_FOCUS);
      expect(stored[ISO]?.notes).toBe(UPDATED_NOTES);
    });
  });
});
