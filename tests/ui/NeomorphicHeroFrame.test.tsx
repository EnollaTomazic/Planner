import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { NeomorphicHeroFrame, type HeroVariant } from "@/components/ui";

afterEach(cleanup);

describe("NeomorphicHeroFrame", () => {
  it.each([
    ["header", "banner"],
    ["nav", "navigation"],
  ] as const)("renders %s element with %s landmark role", (as, role) => {
    render(
      <NeomorphicHeroFrame as={as}>
        <button type="button">Inner action</button>
      </NeomorphicHeroFrame>,
    );

    const frame = screen.getByRole(role);

    expect(frame.tagName.toLowerCase()).toBe(as);
    expect(frame).toHaveAttribute("role", role);
  });

  it.each([
    "default",
    "compact",
    "dense",
    "unstyled",
  ] satisfies HeroVariant[])("sets data-variant attribute for %s", (variant) => {
    const { container } = render(
      <NeomorphicHeroFrame variant={variant}>
        <span>Content</span>
      </NeomorphicHeroFrame>,
    );

    const frame = container.querySelector("[data-variant]") as HTMLElement | null;

    expect(frame).not.toBeNull();
    if (!frame) {
      throw new Error("Hero frame not found");
    }
    expect(frame).toHaveAttribute("data-variant", variant);
  });

  it("toggles focus halo data attribute when focus enters and leaves", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <>
        <NeomorphicHeroFrame>
          <button type="button">Focus me</button>
        </NeomorphicHeroFrame>
        <button type="button">Outside</button>
      </>,
    );

    const frame = container.querySelector("[data-variant]") as HTMLElement | null;
    const insideButton = screen.getByRole("button", { name: "Focus me" });
    const outsideButton = screen.getByRole("button", { name: "Outside" });

    expect(frame).not.toBeNull();
    if (!frame) {
      throw new Error("Hero frame not found");
    }
    expect(frame).not.toHaveAttribute("data-has-focus");

    await user.tab();

    expect(insideButton).toHaveFocus();
    expect(frame).toHaveAttribute("data-has-focus", "true");

    await user.tab();

    expect(outsideButton).toHaveFocus();
    expect(frame).not.toHaveAttribute("data-has-focus");
  });
});
