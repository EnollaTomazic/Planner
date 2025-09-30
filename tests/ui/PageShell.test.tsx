import * as React from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import PageShell, { layoutGridClassName } from "@/components/ui/layout/PageShell";

afterEach(cleanup);

describe("PageShell tokens", () => {
  it("exposes the layout grid tokens for spacing", () => {
    expect(layoutGridClassName).toContain("var(--space-4)");
    expect(layoutGridClassName).toContain("md:[--grid-gutter:var(--space-5)]");
    expect(layoutGridClassName).not.toMatch(/\bgap-(?!\[)/);
  });

  it("applies the tokenised grid wrapper when enabled", () => {
    const { getByTestId } = render(
      <PageShell grid>
        <div data-testid="grid-child">Child</div>
      </PageShell>,
    );

    const child = getByTestId("grid-child");
    const gridWrapper = child.parentElement;
    expect(gridWrapper).not.toBeNull();
    if (!gridWrapper) {
      throw new Error("Grid wrapper not found");
    }

    const className = gridWrapper.className;
    expect(className).toContain("[--grid-gutter:var(--space-4)]");
    expect(className).toContain("md:[--grid-gutter:var(--space-5)]");
    expect(className).not.toMatch(/\bgap-(?!\[)/);
  });
});

