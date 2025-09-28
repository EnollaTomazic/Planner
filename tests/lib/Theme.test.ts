import { beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { runInThisContext } from "node:vm";
import { applyTheme, BG_CLASSES, THEME_BOOTSTRAP_SCRIPT_PATH, THEME_STORAGE_KEY } from "@/lib/theme";
import { createStorageKey } from "@/lib/storage-key";
import type { Background } from "@/lib/theme";
import { resetLocalStorage } from "../setup";

beforeEach(() => {
  document.documentElement.className = "";
  document.documentElement.removeAttribute("data-theme-pref");
  resetLocalStorage();
});


describe("Theme", () => {
  describe("applyTheme", () => {
    it("is a no-op when the DOM is unavailable", () => {
      vi.stubGlobal("document", undefined);

      try {
        expect(() =>
          applyTheme({
            variant: "lg",
            bg: 0,
          }),
        ).not.toThrow();
      } finally {
        vi.unstubAllGlobals();
      }
    });

    it.each([-1, BG_CLASSES.length])(
      "ignores invalid background index %s",
      (invalidIndex) => {
        applyTheme({
          variant: "lg",
          bg: invalidIndex as unknown as Background,
        });

        const { classList } = document.documentElement;
        expect(classList.contains("theme-lg")).toBe(true);
        expect(classList.contains("dark")).toBe(true);
        expect(classList.contains("color-scheme-dark")).toBe(true);
        expect(
          document.documentElement.classList.contains("undefined"),
        ).toBe(false);
        expect(classList.contains("color-scheme-light")).toBe(false);
      },
    );

    it("respects system preference when requested", () => {
      document.documentElement.dataset.themePref = "system";
      const mql = {
        matches: false,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as const;
      window.matchMedia = vi.fn().mockReturnValue(mql) as unknown as typeof window.matchMedia;

      applyTheme({
        variant: "lg",
        bg: 0,
      });

      const { classList } = document.documentElement;
      expect(classList.contains("dark")).toBe(false);
      expect(classList.contains("color-scheme-light")).toBe(true);
      expect(classList.contains("color-scheme-dark")).toBe(false);
    });
  });

  describe("themeBootstrapScript", () => {
    it("uses system preference when no stored theme exists", () => {
      const scriptPath = path.join(
        process.cwd(),
        "public",
        THEME_BOOTSTRAP_SCRIPT_PATH.replace(/^\//, ""),
      );
      const script = fs.readFileSync(scriptPath, "utf8");
      expect(() => {
        runInThisContext(script);
      }).not.toThrow();

      const { classList } = document.documentElement;
      expect(document.documentElement.dataset.themePref).toBe("system");
      expect(classList.contains("dark")).toBe(false);
      expect(classList.contains("color-scheme-light")).toBe(true);
      expect(classList.contains("color-scheme-dark")).toBe(false);
    });

    it("ignores invalid background index from stored theme", () => {
      const key = createStorageKey(THEME_STORAGE_KEY);
      window.localStorage.setItem(
        key,
        JSON.stringify({ variant: "lg", bg: BG_CLASSES.length }),
      );

      const scriptPath = path.join(
        process.cwd(),
        "public",
        THEME_BOOTSTRAP_SCRIPT_PATH.replace(/^\//, ""),
      );
      const script = fs.readFileSync(scriptPath, "utf8");
      expect(() => {
        runInThisContext(script);
      }).not.toThrow();

      const { classList } = document.documentElement;
      expect(Array.from(classList)).toContain("theme-lg");
      expect(Array.from(classList)).toContain("dark");
      for (const bgClass of BG_CLASSES) {
        if (!bgClass) continue;
        expect(classList.contains(bgClass)).toBe(false);
      }
      expect(classList.contains("undefined")).toBe(false);
      expect(document.documentElement.dataset.themePref).toBe("persisted");
      expect(classList.contains("color-scheme-dark")).toBe(true);
      expect(classList.contains("color-scheme-light")).toBe(false);
    });
  });
});
