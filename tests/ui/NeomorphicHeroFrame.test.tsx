import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import NeomorphicHeroFrame, {
  type HeroVariant,
  type NeomorphicHeroFrameProps,
} from "@/components/ui/layout/NeomorphicHeroFrame";

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

  it("defaults the divider tint attribute to the primary palette", () => {
    const { container } = render(
      <NeomorphicHeroFrame>
        <span>Content</span>
      </NeomorphicHeroFrame>,
    );

    const frame = container.querySelector("[data-variant]") as HTMLElement | null;

    expect(frame).not.toBeNull();
    if (!frame) {
      throw new Error("Hero frame not found");
    }
    expect(frame).toHaveAttribute("data-hero-divider-tint", "primary");
  });

  it("respects an explicit divider tint attribute", () => {
    const { container } = render(
      <NeomorphicHeroFrame data-hero-divider-tint="life">
        <span>Content</span>
      </NeomorphicHeroFrame>,
    );

    const frame = container.querySelector("[data-variant]") as HTMLElement | null;

    expect(frame).not.toBeNull();
    if (!frame) {
      throw new Error("Hero frame not found");
    }
    expect(frame).toHaveAttribute("data-hero-divider-tint", "life");
  });

  it("honours the slot shadow data attribute when provided", () => {
    const { container } = render(
      <NeomorphicHeroFrame data-hero-slot-shadow="strong">
        <span>Content</span>
      </NeomorphicHeroFrame>,
    );

    const frame = container.querySelector("[data-variant]") as HTMLElement | null;

    expect(frame).not.toBeNull();
    if (!frame) {
      throw new Error("Hero frame not found");
    }
    expect(frame).toHaveAttribute("data-hero-slot-shadow", "strong");
  });

  it("drops unsupported slot shadow tokens", () => {
    const { container } = render(
      <NeomorphicHeroFrame
        data-hero-slot-shadow={
          "ludicrous" as NeomorphicHeroFrameProps["data-hero-slot-shadow"]
        }
      >
        <span>Content</span>
      </NeomorphicHeroFrame>,
    );

    const frame = container.querySelector("[data-variant]") as HTMLElement | null;

    expect(frame).not.toBeNull();
    if (!frame) {
      throw new Error("Hero frame not found");
    }
    expect(frame).not.toHaveAttribute("data-hero-slot-shadow");
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

  it("applies accessible metadata to slot wrappers when provided", () => {
    render(
      <NeomorphicHeroFrame
        slots={{
          tabs: {
            node: <div>Tabs area</div>,
            label: "  Primary tabs  ",
          },
          actions: {
            node: (
              <div>
                <span id="actions-heading">Actions</span>
              </div>
            ),
            labelledById: " actions-heading ",
          },
        }}
      >
        <span>Content</span>
      </NeomorphicHeroFrame>,
    );

    const tabsSlot = screen.getByRole("group", { name: "Primary tabs" });
    const actionsSlot = screen.getByRole("group", { name: "Actions" });

    expect(tabsSlot).not.toBeNull();
    expect(tabsSlot).toHaveAttribute("data-slot", "tabs");
    expect(tabsSlot).toHaveAttribute("aria-label", "Primary tabs");
    expect(tabsSlot).not.toHaveAttribute("aria-labelledby");

    expect(actionsSlot).not.toBeNull();
    expect(actionsSlot).toHaveAttribute("data-slot", "actions");
    expect(actionsSlot).toHaveAttribute("aria-labelledby", "actions-heading");
    expect(actionsSlot).not.toHaveAttribute("aria-label");
  });

  it("uses the inset shadow token without stacking conflicting utilities", () => {
    const { container } = render(
      <NeomorphicHeroFrame
        slots={{
          tabs: <div>Tabs content</div>,
          search: <div>Search content</div>,
          actions: <button type="button">Action</button>,
        }}
      >
        <span>Content</span>
      </NeomorphicHeroFrame>,
    );

    const slotWells = container.querySelectorAll("[data-slot]");

    expect(slotWells).not.toHaveLength(0);
    slotWells.forEach((slot) => {
      expect(slot).toHaveClass("neo-inset");
      expect(slot).not.toHaveClass("shadow-depth-inner");
    });
  });
});
