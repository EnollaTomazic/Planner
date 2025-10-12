import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SiteChrome } from "@/components/chrome/SiteChrome";
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
