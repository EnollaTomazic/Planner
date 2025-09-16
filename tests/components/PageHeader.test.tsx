import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { PageHeader } from "@/components/ui";

afterEach(cleanup);

describe("PageHeader", () => {
  const baseHeader = {
    heading: "Overview",
    subtitle: "Latest updates",
  } as const;

  const baseHero = {
    heading: "Team roadmap",
  } as const;

  it("renders header and hero within the default neomorphic frame", () => {
    const { container } = render(
      <PageHeader header={baseHeader} hero={baseHero} />,
    );

    expect(container.firstElementChild?.tagName).toBe("SECTION");

    const headerHeading = screen.getByRole("heading", { level: 1, name: "Overview" });
    const headerElement = headerHeading.closest<HTMLElement>("header");
    expect(headerElement).not.toBeNull();
    expect(headerElement?.className).not.toContain("after:");

    const heroHeading = screen.getByRole("heading", { level: 2, name: "Team roadmap" });
    const heroSection = heroHeading.closest<HTMLElement>("section");
    expect(heroSection).not.toBeNull();

    const heroFrame = heroHeading.closest<HTMLElement>("div.hero2-frame");
    expect(heroFrame).not.toBeNull();
    expect(heroFrame?.className).toContain("top-[var(--header-stack)]");
  });

  it("prefers hero-provided subTabs, search, and actions over fallbacks", () => {
    const fallbackSubTabs = {
      items: [{ key: "fallback", label: "Fallback" }],
      value: "fallback",
      onChange: vi.fn(),
    };

    const fallbackSearch = {
      value: "",
      placeholder: "Fallback search",
    };

    const fallbackActions = <button type="button">Fallback Action</button>;

    const { rerender } = render(
      <PageHeader
        header={baseHeader}
        hero={baseHero}
        subTabs={fallbackSubTabs}
        search={fallbackSearch}
        actions={fallbackActions}
      />,
    );

    expect(screen.getByRole("tab", { name: "Fallback" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Fallback search")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Fallback Action" }),
    ).toBeInTheDocument();

    rerender(
      <PageHeader
        header={baseHeader}
        hero={{
          ...baseHero,
          subTabs: {
            items: [{ key: "hero", label: "Hero" }],
            value: "hero",
            onChange: vi.fn(),
          },
          search: {
            value: "",
            placeholder: "Hero search",
          },
          actions: <button type="button">Hero Action</button>,
        }}
        subTabs={fallbackSubTabs}
        search={fallbackSearch}
        actions={fallbackActions}
      />,
    );

    expect(screen.getByRole("tab", { name: "Hero" })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Fallback" })).not.toBeInTheDocument();

    const heroSearchInput = screen.getByPlaceholderText("Hero search");
    expect(heroSearchInput).toBeInTheDocument();
    expect(screen.getByRole("search")).toHaveClass("rounded-full");
    expect(
      screen.queryByPlaceholderText("Fallback search"),
    ).not.toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Hero Action" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Fallback Action" }),
    ).not.toBeInTheDocument();

    rerender(
      <PageHeader
        header={baseHeader}
        hero={{
          ...baseHero,
          search: null,
          actions: null,
        }}
        subTabs={fallbackSubTabs}
        search={fallbackSearch}
        actions={fallbackActions}
      />,
    );

    expect(screen.getByRole("tab", { name: "Fallback" })).toBeInTheDocument();
    expect(screen.queryByRole("search")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Fallback Action" }),
    ).not.toBeInTheDocument();
  });

  it("merges className, contentClassName, and frameProps", () => {
    const { container } = render(
      <PageHeader
        as="section"
        header={baseHeader}
        hero={baseHero}
        className="outer-shell"
        contentClassName="inner-wrapper"
        frameProps={{
          className: "frame-shell",
          contentClassName: "frame-content",
          variant: "plain",
        }}
      />,
    );

    const root = container.firstElementChild as HTMLElement | null;
    expect(root?.tagName).toBe("SECTION");

    if (!root) {
      throw new Error("PageHeader root element was not rendered");
    }

    const frame = root.querySelector<HTMLElement>(".outer-shell");
    expect(frame).not.toBeNull();

    if (!frame) {
      throw new Error("Neomorphic frame element was not rendered");
    }

    expect(frame).toHaveClass("outer-shell");
    expect(frame).toHaveClass("frame-shell");
    expect(frame).toHaveClass("shadow-outline-faint");

    const frameContent = frame.querySelector<HTMLElement>(".frame-content");
    expect(frameContent).not.toBeNull();

    if (!frameContent) {
      throw new Error("Frame content wrapper not found");
    }

    expect(frameContent.className).toContain("relative");

    const innerContent = frameContent.querySelector<HTMLElement>(".inner-wrapper");
    expect(innerContent).not.toBeNull();

    if (!innerContent) {
      throw new Error("Inner content wrapper not found");
    }

    expect(innerContent.className).toContain("relative");
    expect(innerContent.className).toContain("z-[2]");
  });
});
