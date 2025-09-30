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
      <>
        <Card glitch data-testid="card-base">
          Token audit
        </Card>
        <Card glitch depth="sunken" data-testid="card-sunken">
          Sunken token audit
        </Card>
      </>,
    );

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(
      getComputedStyle(document.documentElement)
        .getPropertyValue("--glitch-overlay-opacity-card")
        .trim(),
    ).toMatchInlineSnapshot(`"0.72"`);

    const moduleSource = fs.readFileSync(
      "src/components/ui/primitives/Card.module.css",
      "utf8",
    );

    expect(moduleSource).toContain(
      "--card-glitch-overlay-opacity: var(\n    --glitch-overlay-opacity-card,\n    0.55\n  );",
    );
    expect(moduleSource).toContain(
      "opacity: var(--card-glitch-overlay-opacity);",
    );
    expect(moduleSource).toContain(
      "opacity: var(--card-glitch-overlay-opacity-sunken);",
    );

    const source = fs.readFileSync(
      "src/components/ui/primitives/Card.tsx",
      "utf8",
    );

    expect(source).toContain(
      "opacity-[var(--glitch-overlay-opacity-card,0.55)]",
    );

    document.documentElement.style.removeProperty(
      "--glitch-overlay-opacity-card",
    );
  });
});
