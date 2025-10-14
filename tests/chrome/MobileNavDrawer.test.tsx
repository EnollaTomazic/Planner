import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>(
    "framer-motion",
  );
  return { ...actual, useReducedMotion: () => true };
});

vi.mock("next/navigation", () => ({ usePathname: () => "/reviews" }));

import { PRIMARY_NAV_LABEL } from "@/config/nav";

describe("MobileNavDrawer", () => {
  it("prefixes navigation links with the resolved base path", async () => {
    const utils = await import("@/lib/utils");
    const withBasePathSpy = vi
      .spyOn(utils, "withBasePath")
      .mockImplementation((path: string) => `/base${path}`);

    try {
      const { MobileNavDrawer } = await import(
        "@/components/chrome/MobileNavDrawer"
      );
      render(<MobileNavDrawer open onClose={() => {}} />);

      const navigation = await screen.findByRole("navigation", {
        name: PRIMARY_NAV_LABEL,
      });
      expect(navigation).toBeInTheDocument();

      const reviewsLink = await screen.findByRole("link", { name: "Reviews" });
      expect(reviewsLink).toHaveAttribute("href", "/base/reviews");
      expect(withBasePathSpy).toHaveBeenCalledWith("/reviews");
    } finally {
      withBasePathSpy.mockRestore();
    }
  });
});
