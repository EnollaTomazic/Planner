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
  it("normalizes navigation links for Next.js base path handling", async () => {
    const utils = await import("@/lib/utils");
    const withBasePathSpy = vi
      .spyOn(utils, "withBasePath")
      .mockImplementation((path: string, options?: { skipForNextLink?: boolean }) => {
        expect(options?.skipForNextLink).toBe(true);
        const needsSlash =
          path.length > 0 &&
          !path.endsWith("/") &&
          !path.includes("?") &&
          !path.includes("#");

        return needsSlash ? `${path}/` : path;
      });

    try {
      const NavBar = await loadNavBar();
      render(<NavBar />);

      const reviewsLink = screen.getByRole("link", { name: "Reviews" });
      expect(reviewsLink).toHaveAttribute("href", "/reviews/");
      expect(withBasePathSpy).toHaveBeenCalledWith("/reviews", {
        skipForNextLink: true,
      });
    } finally {
      withBasePathSpy.mockRestore();
    }
  });

  it("renders normalized navigation hrefs when NEXT_PUBLIC_BASE_PATH is set", async () => {
    process.env.NEXT_PUBLIC_BASE_PATH = "/beta";

    const NavBar = await loadNavBar();
    render(<NavBar />);

    const reviewsLink = screen.getByRole("link", { name: "Reviews" });
    expect(reviewsLink).toHaveAttribute("href", "/reviews/");
  });

  it("normalizes query string navigation items", async () => {
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
    expect(demoLink).toHaveAttribute("href", "/?demo=true");
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
