import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH;

async function importBasePathUtils() {
  const mod = await import("../../src/lib/utils");
  return { withBasePath: mod.withBasePath, withoutBasePath: mod.withoutBasePath };
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

describe("WithBasePath", () => {

  it("normalizes input when NEXT_PUBLIC_BASE_PATH is unset", async () => {
    delete process.env.NEXT_PUBLIC_BASE_PATH;
    vi.resetModules();

    const { withBasePath } = await importBasePathUtils();

    expect(withBasePath("/assets/icon.svg")).toBe("/assets/icon.svg");
    expect(withBasePath("assets/icon.svg")).toBe("/assets/icon.svg");
  });

  it("prefixes the configured base path when NEXT_PUBLIC_BASE_PATH is set", async () => {
    process.env.NEXT_PUBLIC_BASE_PATH = "/beta/";
    vi.resetModules();

    const { withBasePath } = await importBasePathUtils();

    expect(withBasePath("/assets/icon.svg")).toBe("/beta/assets/icon.svg");
    expect(withBasePath("assets/icon.svg")).toBe("/beta/assets/icon.svg");
  });

  it("prefixes the base path when route and slug share the same segment", async () => {
    process.env.NEXT_PUBLIC_BASE_PATH = "/planner";
    vi.resetModules();

    const { withBasePath } = await importBasePathUtils();

    expect(withBasePath("/planner")).toBe("/planner");
    expect(withBasePath("planner")).toBe("/planner");
  });

  it("uses the runtime router base path when available", async () => {
    delete process.env.NEXT_PUBLIC_BASE_PATH;
    vi.resetModules();

    vi.stubGlobal("window", {
      next: { router: { basePath: "/runtime" } },
      document: {
        documentElement: {
          getAttribute: vi.fn().mockReturnValue(null),
        },
      },
    } as unknown as Window);

    const { withBasePath } = await importBasePathUtils();

    expect(withBasePath("/assets/icon.svg")).toBe("/runtime/assets/icon.svg");
    expect(withBasePath("assets/icon.svg")).toBe("/runtime/assets/icon.svg");
  });

  it("keeps hash anchors untouched regardless of base path", async () => {
    delete process.env.NEXT_PUBLIC_BASE_PATH;
    vi.resetModules();

    {
      const { withBasePath } = await importBasePathUtils();
      expect(withBasePath("#main")).toBe("#main");
      expect(withBasePath("?modal=true")).toBe("?modal=true");
    }

    process.env.NEXT_PUBLIC_BASE_PATH = "/beta/";
    vi.resetModules();

    {
      const { withBasePath } = await importBasePathUtils();
      expect(withBasePath("#main")).toBe("#main");
      expect(withBasePath("?modal=true")).toBe("?modal=true");
    }
  });

  it("avoids double prefixing when path already includes the base path", async () => {
    process.env.NEXT_PUBLIC_BASE_PATH = "/beta/";
    vi.resetModules();

    const { withBasePath } = await importBasePathUtils();

    expect(withBasePath("/beta/assets/icon.svg")).toBe("/beta/assets/icon.svg");
    expect(withBasePath("beta/assets/icon.svg")).toBe("/beta/assets/icon.svg");
  });

  it("treats query and hash prefixed paths as already base-path-prefixed", async () => {
    process.env.NEXT_PUBLIC_BASE_PATH = "/planner";
    vi.resetModules();

    const { withBasePath } = await importBasePathUtils();

    expect(withBasePath("/planner?modal=true")).toBe("/planner?modal=true");
    expect(withBasePath("/planner#section")).toBe("/planner#section");
  });

  it("returns absolute URLs unchanged regardless of base path", async () => {
    const urls = [
      "https://cdn.example.com/assets/icon.svg",
      "http://cdn.example.com/assets/icon.svg",
      "//cdn.example.com/assets/icon.svg",
      "mailto:test@example.com",
    ];

    delete process.env.NEXT_PUBLIC_BASE_PATH;
    vi.resetModules();
    {
      const { withBasePath } = await importBasePathUtils();
      for (const url of urls) {
        expect(withBasePath(url)).toBe(url);
      }
    }

    process.env.NEXT_PUBLIC_BASE_PATH = "/beta/";
    vi.resetModules();
    {
      const { withBasePath } = await importBasePathUtils();
      for (const url of urls) {
        expect(withBasePath(url)).toBe(url);
      }
    }
  });

  it("normalizes duplicate slashes and whitespace in the base path", async () => {
    process.env.NEXT_PUBLIC_BASE_PATH = " //beta//v1// ";
    vi.resetModules();

    const { withBasePath, withoutBasePath } = await importBasePathUtils();

    expect(withBasePath("/assets/icon.svg")).toBe(
      "/beta/v1/assets/icon.svg",
    );
    expect(withoutBasePath("/beta/v1/assets/icon.svg")).toBe("/assets/icon.svg");
  });
});

describe("WithoutBasePath", () => {
  it("returns normalized paths when NEXT_PUBLIC_BASE_PATH is unset", async () => {
    delete process.env.NEXT_PUBLIC_BASE_PATH;
    vi.resetModules();

    const { withoutBasePath } = await importBasePathUtils();

    expect(withoutBasePath("/planner")).toBe("/planner");
    expect(withoutBasePath("planner")).toBe("/planner");
  });

  it("strips the configured base path prefix", async () => {
    process.env.NEXT_PUBLIC_BASE_PATH = "/beta/";
    vi.resetModules();

    const { withoutBasePath } = await importBasePathUtils();

    expect(withoutBasePath("/beta/planner")).toBe("/planner");
    expect(withoutBasePath("/beta/planner/today")).toBe("/planner/today");
    expect(withoutBasePath("/beta")).toBe("/");
    expect(withoutBasePath("/beta/")).toBe("/");
    expect(withoutBasePath("/other")).toBe("/other");
  });

  it("does not strip prefixes from absolute URLs", async () => {
    const urls = [
      "https://cdn.example.com/assets/icon.svg",
      "http://cdn.example.com/assets/icon.svg",
      "//cdn.example.com/assets/icon.svg",
      "mailto:test@example.com",
    ];

    delete process.env.NEXT_PUBLIC_BASE_PATH;
    vi.resetModules();
    {
      const { withoutBasePath } = await importBasePathUtils();
      for (const url of urls) {
        expect(withoutBasePath(url)).toBe(url);
      }
    }

    process.env.NEXT_PUBLIC_BASE_PATH = "/beta/";
    vi.resetModules();
    {
      const { withoutBasePath } = await importBasePathUtils();
      for (const url of urls) {
        expect(withoutBasePath(url)).toBe(url);
      }
    }
  });

  it("removes the runtime base path when provided by the router", async () => {
    delete process.env.NEXT_PUBLIC_BASE_PATH;
    vi.resetModules();

    vi.stubGlobal("window", {
      next: { router: { basePath: "/runtime" } },
      document: {
        documentElement: {
          getAttribute: vi.fn().mockReturnValue(null),
        },
      },
    } as unknown as Window);

    const { withoutBasePath } = await importBasePathUtils();

    expect(withoutBasePath("/runtime/planner")).toBe("/planner");
    expect(withoutBasePath("/runtime")).toBe("/");
  });
});
