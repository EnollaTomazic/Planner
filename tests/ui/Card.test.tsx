import * as React from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Card } from "@/components/ui";
import { readFileSync } from "node:fs";
import path from "node:path";
import cardStyles from "@/components/ui/primitives/Card.module.css";

afterEach(cleanup);

describe("Card", () => {
  const cardCssSource = readFileSync(
    path.resolve(
      process.cwd(),
      "src/components/ui/primitives/Card.module.css",
    ),
    "utf8",
  );

  it("maps the glitch overlay opacity to the card token", () => {
    const root = document.documentElement;
    const previous = root.style.getPropertyValue("--glitch-overlay-opacity-card");
    const hadPrevious = previous.trim().length > 0;
    root.style.setProperty("--glitch-overlay-opacity-card", "0.64");

    try {
      const { container } = render(<Card glitch data-text="glitch" />);
      const element = container.firstElementChild as HTMLElement | null;

      expect(element).not.toBeNull();
      if (!element) {
        throw new Error("Card root element was not rendered");
      }

      const glitchClass = cardStyles.glitch;
      expect(glitchClass).toBeDefined();
      expect(element.classList.contains(glitchClass)).toBe(true);

      const cssMatch = cardCssSource.match(
        /\.glitch\s*\{[^}]*--glitch-overlay-opacity:[^;}]+;[^}]*\}/,
      );
      if (!cssMatch) {
        throw new Error("Glitch overlay declaration was not found in CSS");
      }

      const computedToken = getComputedStyle(element)
        .getPropertyValue("--glitch-overlay-opacity-card")
        .trim();

      const snippet = cssMatch[0].replace(/\s+/g, " ").trim();

      expect({ computedToken, declaration: snippet }).toMatchSnapshot();
    } finally {
      if (hadPrevious) {
        root.style.setProperty("--glitch-overlay-opacity-card", previous);
      } else {
        root.style.removeProperty("--glitch-overlay-opacity-card");
      }
    }
  });
});
