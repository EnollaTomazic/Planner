import React from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import BlobContainer from "@/components/ui/primitives/BlobContainer";

afterEach(cleanup);

describe("BlobContainer", () => {
  it("injects the default glitch token bundle", () => {
    const { container } = render(<BlobContainer />);

    const root = container.firstElementChild as HTMLElement | null;
    expect(root).not.toBeNull();
    if (!root) {
      throw new Error("BlobContainer root not rendered");
    }

    expect(root.style.getPropertyValue("--blob-overlay-target").trim()).toBe(
      "var(--glitch-overlay-button-opacity)",
    );
    expect(root.style.getPropertyValue("--blob-noise-target").trim()).toBe(
      "var(--glitch-noise-level)",
    );
    expect(
      root.style.getPropertyValue("--blob-noise-active-target").trim(),
    ).toBe("var(--glitch-noise-level)");
  });

  it("respects explicit overlay and noise token overrides", () => {
    const { container } = render(
      <BlobContainer
        overlayToken="glitch-overlay-opacity-card"
        noiseToken="glitch-static-opacity"
        noiseActiveToken="glitch-noise-level"
      />,
    );

    const root = container.firstElementChild as HTMLElement | null;
    expect(root).not.toBeNull();
    if (!root) {
      throw new Error("BlobContainer root not rendered");
    }

    expect(root.style.getPropertyValue("--blob-overlay-target").trim()).toBe(
      "var(--glitch-overlay-opacity-card)",
    );
    expect(root.style.getPropertyValue("--blob-noise-target").trim()).toBe(
      "var(--glitch-static-opacity)",
    );
    expect(
      root.style.getPropertyValue("--blob-noise-active-target").trim(),
    ).toBe("var(--glitch-noise-level)");
  });
});

