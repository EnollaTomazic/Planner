import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH;

async function importUtils() {
  const mod = await import("../../../src/lib/utils");
  return { withBasePath: mod.withBasePath };
}

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
  vi.unstubAllGlobals();
});

describe("readRuntimeBasePath", () => {
  it("caches the asset prefix exposed via __NEXT_DATA__", async () => {
    delete process.env.NEXT_PUBLIC_BASE_PATH;
    vi.resetModules();

    const stubbedWindow: Partial<Window> & {
      __NEXT_DATA__?: { assetPrefix?: string };
    } = {
      __NEXT_DATA__: {
        assetPrefix: "/Planner",
      },
      document: {
        documentElement: {
          getAttribute: vi.fn().mockReturnValue(null),
        },
      },
    };

    vi.stubGlobal("window", stubbedWindow as Window);

    const { withBasePath } = await importUtils();

    expect(withBasePath("/scripts/github-pages-bootstrap.js")).toBe(
      "/Planner/scripts/github-pages-bootstrap.js",
    );

    delete stubbedWindow.__NEXT_DATA__;

    expect(withBasePath("/glitch-gif.gif")).toBe(
      "/Planner/glitch-gif.gif",
    );
  });
});
