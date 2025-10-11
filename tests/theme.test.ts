import { describe, expect, it, beforeEach, afterEach, vi, beforeAll } from "vitest";

import { applyTheme, defaultTheme } from "../src/lib/theme";

declare global {
  interface Window {
    matchMedia?: (query: string) => MediaQueryList;
  }
}

describe("applyTheme", () => {
  let originalMatchMedia: typeof window.matchMedia | undefined;

  beforeAll(() => {
    originalMatchMedia = window.matchMedia;
  });

  beforeEach(() => {
    document.documentElement.className = "";
    document.documentElement.dataset.themePref = "system";
  });

  afterEach(() => {
    if (originalMatchMedia) {
      window.matchMedia = originalMatchMedia;
    } else {
      delete (window as typeof window & { matchMedia?: typeof window.matchMedia }).matchMedia;
    }
  });

  it("respects a light system preference", () => {
    const mediaQueryList = { matches: false } as MediaQueryList;
    window.matchMedia = vi.fn(() => mediaQueryList);

    applyTheme(defaultTheme());

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(window.matchMedia).toHaveBeenCalledWith("(prefers-color-scheme: dark)");
  });

  it("falls back to light mode when matchMedia is unavailable", () => {
    delete (window as typeof window & { matchMedia?: typeof window.matchMedia }).matchMedia;

    applyTheme(defaultTheme());

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("falls back to light mode when matchMedia throws", () => {
    window.matchMedia = vi.fn(() => {
      throw new Error("unavailable");
    });

    applyTheme(defaultTheme());

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
