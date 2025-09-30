import React from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Card } from "@/components/ui";
import cardStyles from "@/components/ui/primitives/Card.module.css";

afterEach(cleanup);

describe("Card", () => {
  it("syncs glitch overlay opacity with the token", () => {
    const root = document.documentElement;
    const sentinel = "0.42";

    root.style.setProperty("--glitch-overlay-opacity-card", sentinel);

    const styleTag = document.createElement("style");
    styleTag.textContent = `.${cardStyles.glitch} { --glitch-overlay-opacity: var(--glitch-overlay-opacity-card); }`;
    document.head.appendChild(styleTag);

    try {
      const { getByTestId } = render(
        <Card glitch data-testid="card">
          Content
        </Card>,
      );

      const card = getByTestId("card");
      const style = getComputedStyle(card);
      const overlay = style
        .getPropertyValue("--glitch-overlay-opacity")
        .trim();
      const token = getComputedStyle(document.documentElement)
        .getPropertyValue("--glitch-overlay-opacity-card")
        .trim();

      expect(overlay).toBe("var(--glitch-overlay-opacity-card)");
      expect({ overlay, token }).toMatchInlineSnapshot(`
        {
          "overlay": "var(--glitch-overlay-opacity-card)",
          "token": "0.42",
        }
      `);
    } finally {
      root.style.removeProperty("--glitch-overlay-opacity-card");
      styleTag.remove();
    }
  });
});
