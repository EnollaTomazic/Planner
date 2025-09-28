import React from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("RingNoiseDefs feature flag", () => {
  const originalFlag = process.env.NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS;

  const getSlopeAttribute = (container: HTMLElement) => {
    const elements = container.getElementsByTagName("feFuncA");
    return elements.item(0)?.getAttribute("slope") ?? undefined;
  };

  afterEach(() => {
    cleanup();
    if (originalFlag === undefined) {
      delete process.env.NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS;
    } else {
      process.env.NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS = originalFlag;
    }
    vi.resetModules();
  });

  it("defaults to numeric slope values when unset", async () => {
    delete process.env.NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS;
    vi.resetModules();

    const { default: RingNoiseDefs } = await import("@/icons/RingNoiseDefs");

    const { container } = render(
      <svg>
        <RingNoiseDefs id="noise" />
      </svg>,
    );

    expect(getSlopeAttribute(container)).toBe("0.1");
  });

  it("falls back to the CSS variable when the flag is disabled", async () => {
    process.env.NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS = "false";
    vi.resetModules();

    const { default: RingNoiseDefs } = await import("@/icons/RingNoiseDefs");

    const { container } = render(
      <svg>
        <RingNoiseDefs id="noise" />
      </svg>,
    );

    expect(getSlopeAttribute(container)).toBe("var(--gradient-noise-opacity, 0.1)");
  });

  it("uses numeric slope values when the flag is enabled", async () => {
    process.env.NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS = "true";
    vi.resetModules();

    const { default: RingNoiseDefs } = await import("@/icons/RingNoiseDefs");

    const { container } = render(
      <svg>
        <RingNoiseDefs id="noise" />
      </svg>,
    );

    expect(getSlopeAttribute(container)).toBe("0.1");
  });
});
