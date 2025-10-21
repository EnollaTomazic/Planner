import React from "react";
import { cleanup, render } from "@testing-library/react";
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
  cleanup();
  restoreBasePathEnv();
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("SegmentedButton", () => {
  it("prefixes the configured base path when rendered as an anchor", async () => {
    process.env.NEXT_PUBLIC_BASE_PATH = "/beta";
    vi.resetModules();

    const envModule = await import("@env");
    envModule.resetClientEnvCache();

    const utils = await import("../../src/lib/utils");
    const withBasePathSpy = vi.spyOn(utils, "withBasePath");
    const { SegmentedButton } = await import(
      "../../src/components/ui/primitives/SegmentedButton"
    );

    const { getByRole } = render(
      <SegmentedButton as="a" href="/docs">
        Docs
      </SegmentedButton>,
    );

    expect(withBasePathSpy).toHaveBeenCalledWith("/docs", {
      skipForNextLink: false,
    });

    const anchor = getByRole("link", { name: "Docs" });
    const resolvedHref = withBasePathSpy.mock.results.at(-1)?.value;

    expect(resolvedHref).toBe("/beta/docs/");
    expect(anchor).toHaveAttribute("href", "/beta/docs/");
  });
});
