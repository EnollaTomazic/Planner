import React from "react";
import type { CSSProperties } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { DripEdge } from "@/components/ui/primitives/DripEdge";

afterEach(cleanup);

describe("DripEdge", () => {
  it("maps tone tokens to gradient stops", () => {
    const { container } = render(<DripEdge tone="danger" />);

    const root = container.firstElementChild as HTMLElement | null;
    expect(root).not.toBeNull();
    if (!root) {
      throw new Error("DripEdge root not rendered");
    }

    expect(root.style.getPropertyValue("--drip-edge-stop-1").trim()).toBe(
      "var(--danger)",
    );
    expect(root.style.getPropertyValue("--drip-edge-stop-2").trim()).toBe(
      "var(--danger)",
    );
    expect(root.style.getPropertyValue("--drip-edge-stop-3").trim()).toBe(
      "var(--danger)",
    );
  });

  it("derives alpha tokens from the overlay intensity", () => {
    const { container } = render(<DripEdge />);

    const root = container.firstElementChild as HTMLElement | null;
    expect(root).not.toBeNull();
    if (!root) {
      throw new Error("DripEdge root not rendered");
    }

    expect(root.style.getPropertyValue("--drip-edge-alpha-1").trim()).toBe(
      "var(--glitch-overlay-button-opacity)",
    );
    expect(root.style.getPropertyValue("--drip-edge-alpha-2").trim()).toBe(
      "var(--glitch-overlay-button-opacity)",
    );
    expect(root.style.getPropertyValue("--drip-edge-alpha-3").trim()).toBe(
      "var(--glitch-overlay-button-opacity)",
    );
  });

  it("preserves caller-provided alpha overrides", () => {
    const customAlpha = "var(--glitch-static-opacity)";
    const { container } = render(
      <DripEdge
        style={{
          "--drip-edge-alpha-2": customAlpha,
        } as CSSProperties}
      />,
    );

    const root = container.firstElementChild as HTMLElement | null;
    expect(root).not.toBeNull();
    if (!root) {
      throw new Error("DripEdge root not rendered");
    }

    expect(root.style.getPropertyValue("--drip-edge-alpha-2").trim()).toBe(
      customAlpha,
    );
  });
});

