import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GITHUB_PAGES_REDIRECT_STORAGE_KEY } from "@/lib/github-pages";

function loadBootstrapSource(basePath: string): string {
  const scriptPath = path.join(
    process.cwd(),
    "public",
    "scripts",
    "github-pages-bootstrap.js",
  );
  const originalSource = fs.readFileSync(scriptPath, "utf8");
  return originalSource
    .replace(
      /"__GITHUB_PAGES_REDIRECT_STORAGE_KEY__"/gu,
      `"${GITHUB_PAGES_REDIRECT_STORAGE_KEY}"`,
    )
    .replace(/"__BASE_PATH__"/gu, `"${basePath}"`);
}

describe("github pages bootstrap alias handling", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("normalizes deploy aliases to the base path root", () => {
    const source = loadBootstrapSource("/planner");
    const historyReplaceState = vi.fn();
    const locationReplace = vi.fn();
    const getItem = vi.fn(() => "current");
    const removeItem = vi.fn();

    const history = {
      replaceState: (...args: unknown[]) => {
        historyReplaceState(...args);
      },
    };

    const location = {
      pathname: "/index.html",
      search: "",
      hash: "",
      replace: (...args: unknown[]) => {
        locationReplace(...args);
      },
    };

    const windowObject = {
      location,
      history,
      sessionStorage: {
        getItem,
        removeItem,
      },
    };

    (windowObject as typeof windowObject & { window?: unknown }).window =
      windowObject;

    const execute = new Function("window", source);
    execute(windowObject);

    expect(getItem).toHaveBeenCalledWith(GITHUB_PAGES_REDIRECT_STORAGE_KEY);
    expect(removeItem).toHaveBeenCalledWith(GITHUB_PAGES_REDIRECT_STORAGE_KEY);
    const historyCall = historyReplaceState.mock.calls[0]?.[2];
    const locationCall = locationReplace.mock.calls[0]?.[0];

    expect(historyCall ?? locationCall).toBe("/");
  });
});
