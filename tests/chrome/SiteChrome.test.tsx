import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

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

describe("SiteChrome", () => {
  it("links the brand to home", async () => {
    render(<SiteChrome />);
    const link = screen.getByRole("link", { name: "Home" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });
});
