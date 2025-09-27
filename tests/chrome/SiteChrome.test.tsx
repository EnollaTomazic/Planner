import * as React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/planner",
}));
vi.mock("@/components/chrome/NavBar", () => ({
  default: () => <nav />,
}));
vi.mock("@/components/ui/theme/ThemeToggle", () => ({
  default: () => <button />,
}));
vi.mock("@/components/ui/AnimationToggle", () => ({
  default: () => <button />,
}));

import SiteChrome from "@/components/chrome/SiteChrome";
import BottomNav from "@/components/chrome/BottomNav";
import { NAV_ITEMS } from "@/components/chrome/nav-items";

describe("SiteChrome", () => {
  it("links the brand to home", async () => {
    render(
      <SiteChrome>
        <div />
      </SiteChrome>,
    );
    const link = screen.getByRole("link", { name: "Home" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });

  it("renders the mobile navigation", () => {
    render(
      <SiteChrome>
        <div />
      </SiteChrome>,
    );
    expect(
      screen.getByRole("navigation", { name: "Primary mobile navigation" }),
    ).toBeInTheDocument();
  });

  it("renders provided children", () => {
    render(
      <SiteChrome>
        <div data-testid="inner" />
      </SiteChrome>,
    );
    expect(screen.getByTestId("inner")).toBeInTheDocument();
  });

  it("exposes pressed and busy states for bottom navigation items", () => {
    render(
      <SiteChrome>
        <div />
      </SiteChrome>,
    );
    const bottomNav = screen.getByRole("navigation", {
      name: "Primary mobile navigation",
    });
    const plannerItem = within(bottomNav).getByRole("button", { name: "Planner" });
    expect(plannerItem).toHaveAttribute("aria-pressed", "true");
    expect(plannerItem).toHaveAttribute("aria-current", "page");
  });
});

describe("BottomNav", () => {
  it("marks disabled and syncing items for accessibility", () => {
    render(
      <BottomNav
        items={[
          { ...NAV_ITEMS[0], href: "/reviews", state: "syncing" },
          { ...NAV_ITEMS[1], href: "/planner", state: "active" },
          { ...NAV_ITEMS[3], href: "/team", state: "disabled" },
        ]}
      />,
    );

    const bottomNav = screen.getByRole("navigation", {
      name: "Primary mobile navigation",
    });
    const syncingItem = within(bottomNav).getByRole("button", { name: /Reviews/ });
    expect(syncingItem).toHaveAttribute("aria-busy", "true");
    expect(within(syncingItem).getByRole("status", { name: "Loading" })).toBeInTheDocument();

    const disabledItem = within(bottomNav).getByRole("button", { name: /Team/ });
    expect(disabledItem).toHaveAttribute("aria-disabled", "true");
    expect(disabledItem).toHaveAttribute("tabindex", "-1");
  });
});
