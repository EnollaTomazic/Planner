import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SiteChrome from "@/components/chrome/SiteChrome";

describe("SiteChrome", () => {
  it("links to the home page via the noxi brand", () => {
    render(<SiteChrome />);
    const homeLink = screen.getByRole("link", { name: /noxi/i });
    expect(homeLink).toHaveAttribute("href", "/");
  });
});
