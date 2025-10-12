import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = {
  GITHUB_REPOSITORY: process.env.GITHUB_REPOSITORY,
  NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH,
  BASE_PATH: process.env.BASE_PATH,
  GITHUB_PAGES: process.env.GITHUB_PAGES,
};

function restoreEnv() {
  for (const [key, value] of Object.entries(ORIGINAL_ENV)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

afterEach(() => {
  restoreEnv();
  vi.resetModules();
});

describe("next.config.mjs", () => {
  it("falls back to the repository slug when base path env vars are unset", async () => {
    delete process.env.NEXT_PUBLIC_BASE_PATH;
    delete process.env.BASE_PATH;
    delete process.env.GITHUB_PAGES;
    process.env.GITHUB_REPOSITORY = "owner/Planner";

    vi.resetModules();
    const config = (await import("../../next.config.mjs")).default;

    expect(config.basePath).toBe("/Planner");
    expect(config.assetPrefix).toBe("/Planner");
    expect(config.env?.NEXT_PUBLIC_BASE_PATH).toBe("/Planner");
  });
});
