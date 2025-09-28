import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
  act,
} from "@testing-library/react";
import { describe, it, beforeEach, expect, afterEach, vi } from "vitest";
import { PromptsPage } from "@/components/prompts";
import { ThemeProvider } from "@/lib/theme-context";
import { flushWriteLocal, createStorageKey } from "@/lib/db";
import { CHAT_PROMPTS_STORAGE_KEY } from "@/components/prompts/useChatPrompts";
import { resetLocalStorage } from "../setup";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("PromptsPage", () => {
  beforeEach(() => {
    resetLocalStorage();
  });

  it("saves prompts and filters results", async () => {
    render(
      <ThemeProvider>
        <PromptsPage />
      </ThemeProvider>,
    );

    const titleInput = screen.getByLabelText("Title");
    const textArea = screen.getByLabelText("Prompt");
    const saveButton = screen.getByRole("button", { name: "Save" });

    fireEvent.change(titleInput, { target: { value: "First" } });
    fireEvent.change(textArea, { target: { value: "one" } });
    fireEvent.click(saveButton);
    await screen.findByText("First");
    expect(screen.getByText("1 saved")).toBeInTheDocument();

    fireEvent.change(titleInput, { target: { value: "" } });
    fireEvent.change(textArea, { target: { value: "Second line\nmore" } });
    fireEvent.click(saveButton);
    await screen.findByText("Second line");
    expect(screen.getByText("2 saved")).toBeInTheDocument();

    const search = screen.getByPlaceholderText("Search prompts…");
    vi.useFakeTimers();
    fireEvent.change(search, { target: { value: "second" } });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByText("Second line")).toBeInTheDocument();
    expect(screen.queryByText("First")).not.toBeInTheDocument();

    fireEvent.change(search, { target: { value: "zzz" } });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByText("No prompts match")).toBeInTheDocument();
    expect(screen.getByText("zzz")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("ignores empty saves", async () => {
    render(
      <ThemeProvider>
        <PromptsPage />
      </ThemeProvider>,
    );
    const saveButton = screen.getByRole("button", { name: "Save" });
    expect(saveButton).toBeDisabled();
    fireEvent.click(saveButton);
    await waitFor(() =>
      expect(screen.getByText("0 saved")).toBeInTheDocument(),
    );
    expect(screen.getByText("No prompts saved yet")).toBeInTheDocument();
  });

  it("keeps prompts saved before hydration completes", async () => {
    const storageKey = createStorageKey(CHAT_PROMPTS_STORAGE_KEY);
    const title = "Hydration survivor";
    const prompt = "Persist me even before storage loads.";

    const hydrationEffects: Array<() => void> = [];
    const originalUseEffect = React.useEffect;
    const effectSpy = vi
      .spyOn(React, "useEffect")
      .mockImplementation((effect, deps) => {
        if (deps?.length === 3) {
          return originalUseEffect(() => {
            hydrationEffects.push(effect);
          }, deps);
        }
        return originalUseEffect(effect, deps);
      });

    try {
      render(
        <ThemeProvider>
          <PromptsPage />
        </ThemeProvider>,
      );

      const titleInput = screen.getByLabelText("Title");
      const promptInput = screen.getByLabelText("Prompt");
      const saveButton = screen.getByRole("button", { name: "Save" });

      fireEvent.change(titleInput, {
        target: { value: title },
      });
      fireEvent.change(promptInput, {
        target: { value: prompt },
      });
      fireEvent.click(saveButton);

      await act(async () => {
        for (const run of hydrationEffects.splice(0)) {
          run();
        }
      });
    } finally {
      effectSpy.mockRestore();
    }

    flushWriteLocal();

    await screen.findByText(title);
    expect(screen.getByText("1 saved")).toBeInTheDocument();

    const stored = window.localStorage.getItem(storageKey);
    expect(stored).toBeTruthy();
    const decoded = JSON.parse(stored as string);
    expect(Array.isArray(decoded)).toBe(true);
    expect(decoded[0]?.text).toBe(prompt);

    cleanup();

    render(
      <ThemeProvider>
        <PromptsPage />
      </ThemeProvider>,
    );

    await screen.findByText(title);
    expect(screen.getByText("1 saved")).toBeInTheDocument();
  });
});
