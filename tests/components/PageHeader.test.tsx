import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PageHeader } from "@/components/ui";

afterEach(cleanup);

describe("PageHeader", () => {
  const baseHeader = {
    heading: "Overview",
    subtitle: "Latest updates",
  } as const;

  const baseHero = {
    heading: "Team roadmap",
  } as const;

  it("renders a single semantic header element by default", () => {
    const { container } = render(
      <PageHeader header={baseHeader} hero={baseHero} />,
    );

    const headerElements = container.querySelectorAll("header");
    expect(headerElements).toHaveLength(1);
    expect(headerElements[0]).toContainElement(
      screen.getByRole("heading", { level: 1, name: baseHeader.heading }),
    );
  });

  it("allows overriding the hero wrapper element via hero.as", () => {
    const { container, rerender } = render(
      <PageHeader header={baseHeader} hero={baseHero} />,
    );

    expect(container.querySelectorAll("section")).toHaveLength(2);
    expect(container.querySelectorAll("nav")).toHaveLength(0);

    rerender(
      <PageHeader
        header={baseHeader}
        hero={{
          ...baseHero,
          as: "nav",
        }}
      />,
    );

    const heroHeading = screen.getByRole("heading", {
      level: 2,
      name: baseHero.heading,
    });
    expect(heroHeading.closest("nav")).not.toBeNull();
    expect(container.querySelectorAll("nav")).toHaveLength(1);
    expect(container.querySelectorAll("section")).toHaveLength(1);
  });
});
