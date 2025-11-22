import * as React from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Card, cardSurfaceClassName } from "@/components/ui/Card";

afterEach(cleanup);

describe("Card (neo surface)", () => {
  it("applies the shared neo surface helpers", () => {
    const { container } = render(
      <Card depth="raised" className={cardSurfaceClassName}>
        <p>Token audit</p>
      </Card>,
    );

    const root = container.firstElementChild as HTMLElement | null;
    expect(root).not.toBeNull();
    if (!root) {
      throw new Error("Card root not rendered");
    }

    expect(root.className).toContain("card-neo-soft");
    expect(root.className).toContain("[box-shadow:var(--depth-shadow-soft)]");
    expect(root.className).toContain("[--neo-card-overlay-inset:0px]");
    expect(root.className).toContain(
      "[--neo-card-overlay-opacity:var(--surface-overlay-strong,0.2)]",
    );
    expect(root.dataset.depth).toBe("raised");
  });

  it("renders user overlays after content for layering", () => {
    const { container } = render(
      <Card glitch overlay={<div data-testid="overlay" />}>content</Card>,
    );

    const root = container.firstElementChild as HTMLElement | null;
    expect(root).not.toBeNull();
    if (!root) {
      throw new Error("Card root not rendered");
    }

    const overlay = root.lastElementChild as HTMLElement | null;
    expect(overlay).not.toBeNull();
    expect(overlay?.dataset.testid).toBe("overlay");
    expect(root.dataset.glitch).toBe("true");
  });
});
