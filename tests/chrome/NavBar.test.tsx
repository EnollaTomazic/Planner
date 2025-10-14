import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/reviews" }));
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>(
    "framer-motion",
  );
  return { ...actual, useReducedMotion: () => true };
});

import { PRIMARY_NAV_LABEL } from "@/config/nav";

async function loadNavBar() {
  const module = await import("@/components/chrome/NavBar");
  return module.NavBar;
}

describe("NavBar", () => {
  it("prefixes navigation links with the resolved base path", async () => {
    const utils = await import("@/lib/utils");
    const withBasePathSpy = vi
      .spyOn(utils, "withBasePath")
      .mockImplementation((path: string) => `/base${path}`);

    try {
      const NavBar = await loadNavBar();
      render(<NavBar />);

      const reviewsLink = screen.getByRole("link", { name: "Reviews" });
      expect(reviewsLink).toHaveAttribute("href", "/base/reviews");
      expect(withBasePathSpy).toHaveBeenCalledWith("/reviews");
    } finally {
      withBasePathSpy.mockRestore();
    }
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
