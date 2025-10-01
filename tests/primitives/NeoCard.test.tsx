import * as React from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import NeoCard from "@/components/ui/primitives/NeoCard";

afterEach(cleanup);

describe("NeoCard", () => {
  it("applies the semantic shadow token bundle", () => {
    const { container } = render(
      <NeoCard>
        <p>Token audit</p>
      </NeoCard>,
    );

    const root = container.firstElementChild as HTMLElement | null;
    expect(root).not.toBeNull();
    if (!root) {
      throw new Error("NeoCard root not rendered");
    }

    expect(root.className).toContain("card-neo-soft");
    expect(root.className).toContain("[box-shadow:var(--depth-shadow-soft)]");
    expect(root.className).toContain("[--neo-card-overlay-inset:0px]");
    expect(root.className).toContain(
      "[--neo-card-overlay-opacity:var(--surface-overlay-strong,0.2)]",
    );
  });

  it("renders overlay content after children for layering", () => {
    const { container } = render(
      <NeoCard overlay={<div data-testid="overlay" />}>content</NeoCard>,
    );

    const root = container.firstElementChild as HTMLElement | null;
    expect(root).not.toBeNull();
    if (!root) {
      throw new Error("NeoCard root not rendered");
    }

    const overlay = root.lastElementChild as HTMLElement | null;
    expect(overlay).not.toBeNull();
    expect(overlay?.dataset.testid).toBe("overlay");
  });
});
