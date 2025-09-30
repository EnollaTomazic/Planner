import React from "react";
import fs from "node:fs";
import { render, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import Card from "@/components/ui/primitives/Card";

afterEach(cleanup);

describe("Card", () => {
  it("derives glitch overlay opacity from the token", async () => {
    const sentinelOpacity = "0.72";
    document.documentElement.style.setProperty(
      "--glitch-overlay-opacity-card",
      sentinelOpacity,
    );

    const { getByTestId, container } = render(
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

    const baseCard = getByTestId("card-base");
    const sunkenCard = getByTestId("card-sunken");

    expect(baseCard.dataset.depth).toBe("base");
    expect(sunkenCard.dataset.depth).toBe("sunken");

    const root = container.firstElementChild as HTMLElement | null;
    expect(root).not.toBeNull();

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
    expect(moduleSource).toContain("--card-depth-sm: var(--neo-depth-sm);");
    expect(moduleSource).toContain("data-depth=\"raised\"");

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

  it("exposes the depth tokens through the Card API", () => {
    const source = fs.readFileSync(
      "src/components/ui/primitives/Card.tsx",
      "utf8",
    );

    expect(source).toContain("data-depth");
    expect(source).toContain("depthShadowClasses");
    expect(source).toContain("shadow-elev-1");
  });
});
