import React from "react";
import fs from "node:fs";
import { render, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { Card } from "@/components/ui";

afterEach(cleanup);

describe("Card", () => {
  it("derives glitch overlay opacity from the token", async () => {
    const sentinelOpacity = "0.72";
    document.documentElement.style.setProperty(
      "--glitch-overlay-opacity-card",
      sentinelOpacity,
    );

    const { getByTestId } = render(
      <Card glitch data-testid="card">
        Token audit
      </Card>,
    );

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(
      getComputedStyle(document.documentElement)
        .getPropertyValue("--glitch-overlay-opacity-card")
        .trim(),
    ).toMatchInlineSnapshot(`"0.72"`);

    const css = fs.readFileSync(
      "src/components/ui/primitives/Card.module.css",
      "utf8",
    );

    expect(css).toContain(
      "--glitch-overlay-opacity: var(--glitch-overlay-opacity-card);",
    );

    document.documentElement.style.removeProperty(
      "--glitch-overlay-opacity-card",
    );
  });
});
