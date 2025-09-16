import {
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import {
  applyTheme,
  BG_CLASSES,
  THEME_STORAGE_KEY,
  themeBootstrapScript,
} from "@/lib/theme";
import { createStorageKey } from "@/lib/storage-key";
import type { Background } from "@/lib/theme";
import { resetLocalStorage } from "../setup";

beforeEach(() => {
  document.documentElement.className = "";
  resetLocalStorage();
});

describe("applyTheme", () => {
  it.each([-1, BG_CLASSES.length])(
    "ignores invalid background index %s",
    (invalidIndex) => {
      applyTheme({
        variant: "lg",
        bg: invalidIndex as unknown as Background,
      });

      expect(Array.from(document.documentElement.classList)).toEqual([
        "theme-lg",
        "dark",
      ]);
      expect(
        document.documentElement.classList.contains("undefined"),
      ).toBe(false);
    },
  );
});

describe("themeBootstrapScript", () => {
  it("ignores invalid background index from stored theme", () => {
    const key = createStorageKey(THEME_STORAGE_KEY);
    window.localStorage.setItem(
      key,
      JSON.stringify({ variant: "lg", bg: BG_CLASSES.length }),
    );

    const script = themeBootstrapScript();
    expect(() => {
      // eslint-disable-next-line no-eval
      eval(script);
    }).not.toThrow();

    const { classList } = document.documentElement;
    expect(Array.from(classList)).toContain("theme-lg");
    expect(Array.from(classList)).toContain("dark");
    for (const bgClass of BG_CLASSES) {
      if (!bgClass) continue;
      expect(classList.contains(bgClass)).toBe(false);
    }
    expect(classList.contains("undefined")).toBe(false);
  });
});
