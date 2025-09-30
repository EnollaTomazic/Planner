import * as React from "react";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
import { NAV_ITEMS, PRIMARY_NAV_LABEL } from "@/config/nav";

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

  it("renders the mobile navigation drawer when opened", async () => {
    const user = userEvent.setup();
    render(
      <SiteChrome>
        <div />
      </SiteChrome>,
    );

    expect(
      screen.queryByRole("navigation", { name: PRIMARY_NAV_LABEL }),
    ).not.toBeInTheDocument();

    const trigger = screen.getByRole("button", { name: "Open navigation" });
    await user.click(trigger);

    const drawerNav = await screen.findByRole("navigation", {
      name: PRIMARY_NAV_LABEL,
    });
    expect(drawerNav).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.click(within(drawerNav).getByRole("link", { name: "Planner" }));

    await waitFor(() => {
      expect(
        screen.queryByRole("navigation", { name: PRIMARY_NAV_LABEL }),
      ).not.toBeInTheDocument();
    });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("renders provided children", () => {
    render(
      <SiteChrome>
        <div data-testid="inner" />
      </SiteChrome>,
    );
    expect(screen.getByTestId("inner")).toBeInTheDocument();
  });

  it("groups the display toggles inside a labelled toolbar", () => {
    render(
      <SiteChrome>
        <div />
      </SiteChrome>,
    );

    const toolbarRegion = screen.getByRole("region", { name: "Display controls" });
    const toolbar = within(toolbarRegion).getByRole("toolbar", {
      name: "Display controls",
    });

    expect(toolbar).toBeInTheDocument();
    expect(within(toolbar).getAllByRole("button")).toHaveLength(2);
  });

  it("marks the active route inside the mobile drawer", async () => {
    const user = userEvent.setup();
    render(
      <SiteChrome>
        <div />
      </SiteChrome>,
    );

    await user.click(screen.getByRole("button", { name: "Open navigation" }));

    const drawerNav = await screen.findByRole("navigation", {
      name: PRIMARY_NAV_LABEL,
    });
    const plannerLink = within(drawerNav).getByRole("link", { name: "Planner" });
    expect(plannerLink).toHaveAttribute("aria-current", "page");
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
      name: PRIMARY_NAV_LABEL,
    });
    const syncingItem = within(bottomNav).getByRole("button", { name: /Reviews/ });
    expect(syncingItem).toHaveAttribute("aria-busy", "true");
    expect(within(syncingItem).getByRole("status", { name: "Loading" })).toBeInTheDocument();

    const disabledItem = within(bottomNav).getByRole("button", { name: /Team/ });
    expect(disabledItem).toHaveAttribute("aria-disabled", "true");
    expect(disabledItem).toHaveAttribute("tabindex", "-1");
  });
});
