import * as React from "react";
import { act, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "@/lib/theme-context";
import { createStorageKey } from "@/lib/storage-key";
import * as themeModule from "@/lib/theme";
import { resetLocalStorage } from "../setup";

function Consumer() {
  const [theme, setTheme] = useTheme();
  React.useEffect(() => {
    Consumer.lastTheme = theme;
    Consumer.setTheme = setTheme;
  }, [theme, setTheme]);
  return null;
}

Consumer.lastTheme = undefined as themeModule.ThemeState | undefined;
Consumer.setTheme = undefined as
  | React.Dispatch<React.SetStateAction<themeModule.ThemeState>>
  | undefined;

describe("ThemeProvider", () => {
  const applyThemeSpy = vi.spyOn(themeModule, "applyTheme");

  beforeEach(() => {
    applyThemeSpy.mockClear();
    resetLocalStorage();
    document.documentElement.className = "";
    document.documentElement.removeAttribute("data-theme-pref");
    document.documentElement.style.removeProperty("color-scheme");
    Consumer.lastTheme = undefined;
    Consumer.setTheme = undefined;
  });

  it("defers applying the default theme until persisted state hydrates", async () => {
    const key = createStorageKey(themeModule.THEME_STORAGE_KEY);
    window.localStorage.setItem(
      key,
      JSON.stringify({ variant: "noir", bg: 2 satisfies themeModule.ThemeState["bg"] }),
    );
    document.documentElement.className = "theme-noir bg-alt2";
    document.documentElement.dataset.themePref = "persisted";

    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(applyThemeSpy).toHaveBeenCalledTimes(1);
      const [themeState] = applyThemeSpy.mock.calls[0] ?? [];
      expect(themeState?.variant).toBe("noir");
      expect(themeState?.bg).toBe(2);
    });

    await waitFor(() => {
      expect(Consumer.lastTheme?.variant).toBe("noir");
      expect(Consumer.lastTheme?.bg).toBe(2);
    });

    expect(document.documentElement.classList.contains("theme-lg")).toBe(false);
    expect(document.documentElement.classList.contains("theme-noir")).toBe(true);
  });

  it("marks manual selections as persisted and applies the chosen theme", async () => {
    document.documentElement.className = "theme-lg";
    document.documentElement.dataset.themePref = "system";

    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(Consumer.setTheme).toBeTypeOf("function");
    });

    expect(document.documentElement.dataset.themePref).toBe("system");

    act(() => {
      Consumer.setTheme?.((prev) => ({ ...prev, variant: "aurora", bg: 4 }));
    });

    await waitFor(() => {
      expect(document.documentElement.dataset.themePref).toBe("persisted");
      expect(document.documentElement.classList.contains("theme-aurora")).toBe(true);
      const bgClass = themeModule.BG_CLASSES[4];
      if (bgClass) {
        expect(document.documentElement.classList.contains(bgClass)).toBe(true);
      }
    });
  });
});

