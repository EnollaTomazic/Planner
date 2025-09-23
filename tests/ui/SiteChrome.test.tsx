import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
vi.mock("@/components/chrome/BottomNav", () => ({
  default: () => <nav />,
}));
import SiteChrome from "@/components/chrome/SiteChrome";
import { ThemeProvider } from "@/lib/theme-context";

describe("SiteChrome", () => {
  it("links to the home page via the noxi brand", () => {
    render(
      <ThemeProvider>
        <SiteChrome>
          <div />
        </SiteChrome>
      </ThemeProvider>,
    );
    const homeLink = screen.getByRole("link", { name: "Home" });
    expect(homeLink).toHaveAttribute("href", "/");
  });
});
