import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH;

afterEach(() => {
  cleanup();
  if (ORIGINAL_BASE_PATH === undefined) {
    delete process.env.NEXT_PUBLIC_BASE_PATH;
  } else {
    process.env.NEXT_PUBLIC_BASE_PATH = ORIGINAL_BASE_PATH;
  }
  vi.resetModules();
});

describe("useBasePath", () => {
  it("returns the root base path by default", async () => {
    delete process.env.NEXT_PUBLIC_BASE_PATH;
    vi.resetModules();
    const { useBasePath } = await import("@/lib/base-path");
    const { result } = renderHook(() => useBasePath());

    expect(result.current.basePath).toBe("");
    expect(result.current.resolveHref("/planner")).toBe("/planner");
    expect(result.current.resolveAsset("planner-logo.svg")).toBe(
      "/planner-logo.svg",
    );
  });

  it("prefixes the configured base path", async () => {
    process.env.NEXT_PUBLIC_BASE_PATH = "/beta";
    vi.resetModules();
    const { useBasePath } = await import("@/lib/base-path");
    const { result } = renderHook(() => useBasePath());

    expect(result.current.basePath).toBe("/beta");
    expect(result.current.resolveHref("/planner")).toBe("/beta/planner");
    expect(result.current.resolveAsset("planner-logo.svg")).toBe(
      "/beta/planner-logo.svg",
    );
  });
});
