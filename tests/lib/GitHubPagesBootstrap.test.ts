import { describe, expect, it } from "vitest";

import {
  GITHUB_PAGES_REDIRECT_STORAGE_KEY,
  normalizePlaceholder,
  normalizeGitHubPagesBasePath,
  isGitHubPagesIndexPath,
  sanitizeStoredLocation,
  planGitHubPagesRestoration,
} from "@/lib/github-pages";

describe("github-pages bootstrap helpers", () => {
  it("normalizes placeholder values", () => {
    expect(
      normalizePlaceholder(
        "__GITHUB_PAGES_REDIRECT_STORAGE_KEY__",
        "__GITHUB_PAGES_REDIRECT_STORAGE_KEY__",
        "fallback",
      ),
    ).toBe("fallback");
    expect(normalizePlaceholder("   /planner  ", "__BASE_PATH__", "")).toBe("/planner");
    expect(normalizePlaceholder("", "__BASE_PATH__", "/base")).toBe("/base");
  });

  it("normalizes base paths", () => {
    expect(normalizeGitHubPagesBasePath("")).toBe("");
    expect(normalizeGitHubPagesBasePath("/")).toBe("");
    expect(normalizeGitHubPagesBasePath(" planner / app ")).toBe("/planner/app");
  });

  it("detects index routes", () => {
    expect(isGitHubPagesIndexPath("/", "")).toBe(true);
    expect(isGitHubPagesIndexPath("/index.html", "")).toBe(true);
    expect(isGitHubPagesIndexPath("/planner", "/planner")).toBe(true);
    expect(isGitHubPagesIndexPath("/planner/", "/planner")).toBe(true);
    expect(isGitHubPagesIndexPath("/planner/index.html", "/planner")).toBe(true);
    expect(isGitHubPagesIndexPath("/planner/index.html?filter=done", "/planner")).toBe(true);
    expect(isGitHubPagesIndexPath("/planner/index.html#section", "/planner")).toBe(true);
    expect(isGitHubPagesIndexPath("/planner?filter=done", "/planner")).toBe(true);
    expect(isGitHubPagesIndexPath("/planner/tasks", "/planner")).toBe(false);
  });

  it("sanitizes stored locations", () => {
    expect(sanitizeStoredLocation(null)).toBeNull();
    expect(sanitizeStoredLocation("   ")).toBeNull();
    expect(sanitizeStoredLocation("https://example.com")).toBeNull();
    expect(sanitizeStoredLocation("//malicious")).toBeNull();
    expect(sanitizeStoredLocation("/planner/tasks")).toBe("/planner/tasks");
  });

  it("plans restoration targets", () => {
    expect(
      planGitHubPagesRestoration({
        basePath: "",
        currentPath: "/index.html",
        storedLocation: "",
      }),
    ).toBeNull();

    expect(
      planGitHubPagesRestoration({
        basePath: "",
        currentPath: "/index.html",
        storedLocation: "/tasks",
      }),
    ).toBe("/tasks");

    expect(
      planGitHubPagesRestoration({
        basePath: "/planner",
        currentPath: "/index.html",
        storedLocation: "tasks",
      }),
    ).toBe("/planner/tasks");

    expect(
      planGitHubPagesRestoration({
        basePath: "/planner",
        currentPath: "/planner/tasks",
        storedLocation: "/planner/tasks",
      }),
    ).toBeNull();

    expect(
      planGitHubPagesRestoration({
        basePath: "/planner",
        currentPath: "/planner/index.html",
        storedLocation: "/planner/current",
      }),
    ).toBe("/planner");

    expect(
      planGitHubPagesRestoration({
        basePath: "/planner",
        currentPath: "/planner/index.html",
        storedLocation:
          "/planner/0123456789abcdef0123456789abcdef01234567/index.html",
      }),
    ).toBe("/planner");

    expect(
      planGitHubPagesRestoration({
        basePath: "",
        currentPath: "/index.html",
        storedLocation: "/current",
      }),
    ).toBe("/");
  });

  it("exposes the storage key literal", () => {
    expect(GITHUB_PAGES_REDIRECT_STORAGE_KEY).toBe("noxis-planner:gh-pages:redirect");
  });
});
