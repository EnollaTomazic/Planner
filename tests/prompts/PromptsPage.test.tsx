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
import { createStorageKey, flushWriteLocal } from "@/lib/db";
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

  it("persists prompts saved before hydration completes", async () => {
    const useEffectCleanupMap = new Map<
      ReturnType<typeof setTimeout>,
      (() => void) | void
    >();
    const originalUseEffect = React.useEffect;
    const useEffectSpy = vi
      .spyOn(React, "useEffect")
      .mockImplementation((effect, deps) => {
        originalUseEffect(() => {
          const timer = setTimeout(() => {
            const cleanup = effect();
            if (typeof cleanup === "function") {
              useEffectCleanupMap.set(timer, cleanup);
            }
          }, 0);
          return () => {
            clearTimeout(timer);
            const cleanup = useEffectCleanupMap.get(timer);
            if (typeof cleanup === "function") {
              cleanup();
            }
            useEffectCleanupMap.delete(timer);
          };
        }, deps);
      });

    vi.useFakeTimers();

    const storageKey = createStorageKey("prompts.chat.v1");

    try {
      render(
        <ThemeProvider>
          <PromptsPage />
        </ThemeProvider>,
      );

      const titleInput = screen.getByLabelText("Title");
      const textArea = screen.getByLabelText("Prompt");
      const saveButton = screen.getByRole("button", { name: "Save" });

      fireEvent.change(titleInput, { target: { value: "Hydration guard" } });
      fireEvent.change(textArea, { target: { value: "Saved early" } });
      fireEvent.click(saveButton);

      await act(async () => {
        vi.runAllTimers();
      });

      expect(screen.getByText("Hydration guard")).toBeInTheDocument();
      expect(screen.getByText("1 saved")).toBeInTheDocument();

      act(() => {
        flushWriteLocal();
      });

      const storedRaw = window.localStorage.getItem(storageKey);
      expect(storedRaw).not.toBeNull();
      const stored = storedRaw ? JSON.parse(storedRaw) : [];
      expect(Array.isArray(stored)).toBe(true);
      expect(stored[0]?.title).toBe("Hydration guard");
    } finally {
      useEffectSpy.mockRestore();
      vi.useRealTimers();
    }
  });
});
