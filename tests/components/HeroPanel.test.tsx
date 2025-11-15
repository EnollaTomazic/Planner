import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Hero, type HeroAction, type HeroPanelProps } from "@/components/ui";

afterEach(cleanup);

describe("Hero panel variant", () => {
  const baseProps: HeroPanelProps = {
    variant: "panel",
    title: "Planner overview",
    subtitle: "Keep your team synced with goals and reviews",
  };

  it("renders title and subtitle with the expected typography", () => {
    render(<Hero {...baseProps} />);

    const heading = screen.getByRole("heading", { name: baseProps.title });
    expect(heading.tagName.toLowerCase()).toBe("h1");
    expect(heading).toHaveClass("text-xl");
    expect(heading).toHaveClass("md:text-2xl");

    const subtitle = screen.getByText(baseProps.subtitle);
    expect(subtitle).toHaveClass("text-lg");
    expect(subtitle).toHaveClass("text-muted-foreground");
  });

  it("renders provided actions using the shared button component", () => {
    const actions: HeroAction[] = [
      { id: "primary", label: "New goal" },
      { id: "secondary", label: "View reports", variant: "quiet" },
    ];

    render(<Hero {...baseProps} actions={actions} />);

    const buttons = actions.map((action) =>
      screen.getByRole("button", { name: action.label }),
    );

    expect(buttons).toHaveLength(actions.length);
    for (const button of buttons) {
      expect(button).toHaveClass("inline-flex");
    }
  });

  it("supports placing hero artwork on the left side", () => {
    render(
      <Hero
        {...baseProps}
        hero={<div data-testid="hero-art" />}
        heroPlacement="left"
      />,
    );

    const hero = screen.getByTestId("hero-art");
    const heroWrapper = hero.parentElement;
    expect(heroWrapper).not.toBeNull();
    expect(heroWrapper).toHaveClass("order-first");
  });

  it("allows customizing the heading level", () => {
    render(<Hero {...baseProps} headingLevel={3} />);

    const heading = screen.getByRole("heading", { level: 3, name: baseProps.title });
    expect(heading.tagName.toLowerCase()).toBe("h3");
  });
});
