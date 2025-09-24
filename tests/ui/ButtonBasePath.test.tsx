import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH;

afterEach(() => {
  cleanup();
  process.env.NEXT_PUBLIC_BASE_PATH = ORIGINAL_BASE_PATH;
  vi.resetModules();
});

describe("ButtonBasePath", () => {
  it("prefixes the configured base path for root-relative href", async () => {
    process.env.NEXT_PUBLIC_BASE_PATH = "/beta";
    vi.resetModules();
    const { default: Button } = await import("@/components/ui/primitives/Button");
    const { getByRole } = render(
      <Button href="/planner">Planner</Button>,
    );
    expect(getByRole("link")).toHaveAttribute("href", "/beta/planner");
  });

  it("prefixes the configured base path for relative href without scheme", async () => {
    process.env.NEXT_PUBLIC_BASE_PATH = "/beta";
    vi.resetModules();
    const { default: Button } = await import("@/components/ui/primitives/Button");
    const { getByRole } = render(<Button href="planner">Planner</Button>);
    expect(getByRole("link")).toHaveAttribute("href", "/beta/planner");
  });

  it("prefixes when the base path shares the planner segment", async () => {
    process.env.NEXT_PUBLIC_BASE_PATH = "/planner";
    vi.resetModules();
    const { default: Button } = await import("@/components/ui/primitives/Button");
    const { getByRole } = render(<Button href="/planner">Planner</Button>);
    expect(getByRole("link")).toHaveAttribute("href", "/planner");
  });

  it("preserves hash and query-only href values", async () => {
    process.env.NEXT_PUBLIC_BASE_PATH = "/planner";
    vi.resetModules();
    const { default: Button } = await import("@/components/ui/primitives/Button");
    const { rerender, getByRole } = render(
      <Button href="#main">Skip</Button>,
    );
    expect(getByRole("link")).toHaveAttribute("href", "#main");

    rerender(<Button href="?modal=true">Open modal</Button>);
    expect(getByRole("link")).toHaveAttribute("href", "?modal=true");
  });

  it("keeps external href values unchanged", async () => {
    process.env.NEXT_PUBLIC_BASE_PATH = "/beta";
    vi.resetModules();
    const { default: Button } = await import("@/components/ui/primitives/Button");
    const { getByRole } = render(
      <Button href="https://example.com">External</Button>,
    );
    expect(getByRole("link")).toHaveAttribute("href", "https://example.com");
  });
});

describe("Button anchor security defaults", () => {
  it("applies noopener rel for blank targets without rel", async () => {
    vi.resetModules();
    const { default: Button } = await import("@/components/ui/primitives/Button");
    const { getByRole } = render(
      <Button href="https://example.com" target="_blank">
        External
      </Button>,
    );

    expect(getByRole("link")).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
  });

  it("preserves a provided rel for blank targets", async () => {
    vi.resetModules();
    const { default: Button } = await import("@/components/ui/primitives/Button");
    const { getByRole } = render(
      <Button href="https://example.com" rel="external" target="_blank">
        External
      </Button>,
    );

    expect(getByRole("link")).toHaveAttribute("rel", "external");
  });
});

describe("QuickActions base path integration", () => {
  it("uses the base path for its internal shortcuts", async () => {
    process.env.NEXT_PUBLIC_BASE_PATH = "/beta";
    vi.resetModules();
    const { default: QuickActions } = await import(
      "@/components/home/QuickActions",
    );
    render(<QuickActions />);

    expect(
      screen.getByRole("link", { name: "Planner Today" }),
    ).toHaveAttribute("href", "/beta/planner");
    expect(screen.getByRole("link", { name: "New Goal" })).toHaveAttribute(
      "href",
      "/beta/goals",
    );
    expect(screen.getByRole("link", { name: "New Review" })).toHaveAttribute(
      "href",
      "/beta/reviews",
    );
  });
});
