import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH;

async function importWithBasePath() {
  const mod = await import("../../src/lib/utils");
  return mod.withBasePath;
}

function restoreBasePathEnv() {
  if (ORIGINAL_BASE_PATH === undefined) {
    delete process.env.NEXT_PUBLIC_BASE_PATH;
  } else {
    process.env.NEXT_PUBLIC_BASE_PATH = ORIGINAL_BASE_PATH;
  }
}

describe("withBasePath", () => {
  afterEach(() => {
    restoreBasePathEnv();
    vi.resetModules();
  });

  it("normalizes input when NEXT_PUBLIC_BASE_PATH is unset", async () => {
    delete process.env.NEXT_PUBLIC_BASE_PATH;
    vi.resetModules();

    const withBasePath = await importWithBasePath();

    expect(withBasePath("/assets/icon.svg")).toBe("/assets/icon.svg");
    expect(withBasePath("assets/icon.svg")).toBe("/assets/icon.svg");
  });

  it("prefixes the configured base path when NEXT_PUBLIC_BASE_PATH is set", async () => {
    process.env.NEXT_PUBLIC_BASE_PATH = "/beta/";
    vi.resetModules();

    const withBasePath = await importWithBasePath();

    expect(withBasePath("/assets/icon.svg")).toBe("/beta/assets/icon.svg");
    expect(withBasePath("assets/icon.svg")).toBe("/beta/assets/icon.svg");
  });
});
