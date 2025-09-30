import React from "react";
import fs from "node:fs";
import { render, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { Card } from "@/components/ui";
import cardStyles from "@/components/ui/primitives/Card.module.css";

afterEach(cleanup);

describe("Card", () => {
  it("derives glitch overlay opacity from the token", async () => {
    const sentinelOpacity = "0.72";
    document.documentElement.style.setProperty(
      "--glitch-overlay-opacity-card",
      sentinelOpacity,
    );

    const style = document.createElement("style");
    style.dataset.testid = "card-glitch-style";
    style.textContent = `
      .${cardStyles.root} {
        --card-overlay-opacity-hover: 0.55;
        --card-overlay-opacity-sunken: 0.32;
      }

      .${cardStyles.glitch} {
        --card-overlay-opacity-hover: var(--glitch-overlay-opacity-card);
        --glitch-overlay-opacity: var(--glitch-overlay-opacity-card);
      }
    `;
    document.head.append(style);

    const { getByTestId } = render(
      <Card glitch data-testid="card">
        Token audit
      </Card>,
    );

    await new Promise((resolve) => setTimeout(resolve, 0));

    const card = getByTestId("card");

    expect(
      getComputedStyle(document.documentElement)
        .getPropertyValue("--glitch-overlay-opacity-card")
        .trim(),
    ).toMatchInlineSnapshot(`"0.72"`);

    expect(
      getComputedStyle(card)
        .getPropertyValue("--card-overlay-opacity-hover")
        .trim(),
    ).toMatchInlineSnapshot(`"var(--glitch-overlay-opacity-card)"`);

    expect(
      getComputedStyle(card)
        .getPropertyValue("--glitch-overlay-opacity")
        .trim(),
    ).toMatchInlineSnapshot(`"var(--glitch-overlay-opacity-card)"`);

    const css = fs.readFileSync(
      "src/components/ui/primitives/Card.module.css",
      "utf8",
    );

    expect(css).toContain(
      "--card-overlay-opacity-hover: var(--glitch-overlay-opacity-card);",
    );

    expect(css).toContain(
      "--glitch-overlay-opacity: var(--glitch-overlay-opacity-card);",
    );

    document.documentElement.style.removeProperty(
      "--glitch-overlay-opacity-card",
    );
    document.head.removeChild(style);
  });
});
