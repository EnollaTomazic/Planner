import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { PRIMARY_NAV_LABEL } from "@/config/nav";

const ORIGINAL_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH;
let mockedPathname = "/reviews";

beforeEach(() => {
  vi.resetModules();
  vi.doMock("next/navigation", () => ({
    usePathname: () => mockedPathname,
  }));
  vi.doMock("framer-motion", async () => {
    const actual = await vi.importActual<
      typeof import("framer-motion")
    >("framer-motion");
    return { ...actual, useReducedMotion: () => true };
  });
});

afterEach(() => {
  process.env.NEXT_PUBLIC_BASE_PATH = ORIGINAL_BASE_PATH;
  mockedPathname = "/reviews";
  vi.clearAllMocks();
});

async function loadNavBar() {
  const module = await import("@/components/chrome/NavBar");
  return module.NavBar;
}

describe("NavBar", () => {
  it("prefixes navigation links with the resolved base path", async () => {
    const utils = await import("@/lib/utils");
    const withBasePathSpy = vi
      .spyOn(utils, "withBasePath")
      .mockImplementation((path: string) => {
        const needsSlash =
          path.length > 0 &&
          !path.endsWith("/") &&
          !path.includes("?") &&
          !path.includes("#");

        return `/base${path}${needsSlash ? "/" : ""}`;
      });

    try {
      const NavBar = await loadNavBar();
      render(<NavBar />);

      const reviewsLink = screen.getByRole("link", { name: "Reviews" });
      expect(reviewsLink).toHaveAttribute("href", "/base/reviews/");
      expect(withBasePathSpy).toHaveBeenCalledWith("/reviews");
    } finally {
      withBasePathSpy.mockRestore();
    }
  });

  it("renders navigation hrefs that include NEXT_PUBLIC_BASE_PATH", async () => {
    process.env.NEXT_PUBLIC_BASE_PATH = "/beta";

    const NavBar = await loadNavBar();
    render(<NavBar />);

    const reviewsLink = screen.getByRole("link", { name: "Reviews" });
    expect(reviewsLink).toHaveAttribute("href", "/beta/reviews/");
  });

  it("prefixes query string navigation items with the base path", async () => {
    process.env.NEXT_PUBLIC_BASE_PATH = "/beta";

    const NavBar = await loadNavBar();
    render(
      <NavBar
        items={[
          { href: "?demo=true", label: "Demo" },
          { href: "/planner", label: "Planner" },
        ]}
      />,
    );

    const demoLink = screen.getByRole("link", { name: "Demo" });
    expect(demoLink).toHaveAttribute("href", "/beta/?demo=true");
  });

  it("exposes a labelled primary navigation landmark", async () => {
    const NavBar = await loadNavBar();
    render(<NavBar />);

    expect(
      screen.getByRole("navigation", { name: PRIMARY_NAV_LABEL }),
    ).toBeInTheDocument();
  });

  it("disables underline animation with reduced motion", async () => {
    const NavBar = await loadNavBar();
    render(<NavBar />);

    const underline = screen.getByTestId("nav-underline");
    const dur = getComputedStyle(underline).transitionDuration;
    expect(["0s", ""].includes(dur)).toBe(true);
  });
});
