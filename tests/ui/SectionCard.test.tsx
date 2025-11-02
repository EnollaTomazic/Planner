import * as React from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SectionCard } from "@/components/ui/layout/SectionCard";
import styles from "@/components/ui/layout/SectionCard.module.css";

afterEach(cleanup);

describe("SectionCard", () => {
  function renderSectionCard(
    props?: React.ComponentProps<typeof SectionCard>,
  ) {
    const { container } = render(
      <SectionCard {...props}>
        <SectionCard.Header title="Card heading" />
        <SectionCard.Body>Body copy</SectionCard.Body>
      </SectionCard>,
    );

    const section = container.querySelector("section");
    if (!section) {
      throw new Error("SectionCard root element was not rendered");
    }

    return section;
  }

  it("uses the neumorphic token stack for the default variant", () => {
    const root = renderSectionCard();

    expect(root.className).toContain("shadow-depth-outer-strong");
    expect(root.className).toContain("card-neo-soft");
    expect(root.className).toContain("rounded-card");
  });

  it("switches to the glitch token surface when requested", () => {
    const root = renderSectionCard({ variant: "glitch" });

    expect(root.className.split(/\s+/)).toContain(styles.glitch);
    expect(root.className).not.toContain("bg-glitch-noise");
    expect(root.className).toContain("rounded-card");
  });

  it("keeps sticky headers opt-in and token driven", () => {
    const { container } = render(
      <SectionCard>
        <SectionCard.Header title="Sticky heading" sticky topClassName="top-token" />
        <SectionCard.Body>Body copy</SectionCard.Body>
      </SectionCard>,
    );

    const header = container.querySelector(".section-h");
    expect(header).not.toBeNull();
    if (!header) {
      throw new Error("SectionCard header not found");
    }

    expect(header.className).toContain("sticky");
    expect(header.className).toContain("top-token");
  });
});
