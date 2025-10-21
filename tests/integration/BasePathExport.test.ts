import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH;

function restoreBasePathEnv() {
  if (ORIGINAL_BASE_PATH === undefined) {
    delete process.env.NEXT_PUBLIC_BASE_PATH;
  } else {
    process.env.NEXT_PUBLIC_BASE_PATH = ORIGINAL_BASE_PATH;
  }
}

afterEach(() => {
  restoreBasePathEnv();
  vi.resetModules();
});

describe("GitHub Pages base path exports", () => {
  it("only includes the base path prefix once in exported markup", async () => {
    process.env.NEXT_PUBLIC_BASE_PATH = "/Planner";
    vi.resetModules();

    const { withBasePath } = await import("@/lib/utils");
    const normalizedRoute = withBasePath("/planner", { skipForNextLink: true });
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const exportedMarkup = `<a href="${basePath}${normalizedRoute}">Planner</a>`;

    expect(exportedMarkup).toContain("href=\"/Planner/planner/");
    const matches = exportedMarkup.match(/\/Planner\//g) ?? [];
    expect(matches).toHaveLength(1);
  });
});
