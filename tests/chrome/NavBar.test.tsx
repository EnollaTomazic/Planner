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

import NavBar from "@/components/chrome/NavBar";
import { PRIMARY_NAV_LABEL } from "@/config/nav";

describe("NavBar", () => {
  it("disables underline animation with reduced motion", () => {
    render(<NavBar />);
    const underline = screen.getByTestId("nav-underline");
    const dur = getComputedStyle(underline).transitionDuration;
    expect(["0s", ""].includes(dur)).toBe(true);
  });

  it("uses the primary navigation landmark label", () => {
    render(<NavBar />);
    expect(
      screen.getByRole("navigation", { name: PRIMARY_NAV_LABEL }),
    ).toBeInTheDocument();
  });
});
