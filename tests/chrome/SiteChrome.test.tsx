import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/components/chrome/NavBar", () => ({
  default: () => <nav />,
}));
vi.mock("@/components/chrome/BottomNav", () => ({
  default: () => <nav data-testid="mobile-nav" />,
}));
vi.mock("@/components/ui/theme/ThemeToggle", () => ({
  default: () => <button />,
}));
vi.mock("@/components/ui/AnimationToggle", () => ({
  default: () => <button />,
}));

import SiteChrome from "@/components/chrome/SiteChrome";

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
    expect(screen.getAllByTestId("mobile-nav")).not.toHaveLength(0);
  });

  it("renders provided children", () => {
    render(
      <SiteChrome>
        <div data-testid="inner" />
      </SiteChrome>,
    );
    expect(screen.getByTestId("inner")).toBeInTheDocument();
  });
});
