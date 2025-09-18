import React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PageHeader } from "@/components/ui";

afterEach(cleanup);

describe("PageHeader", () => {
  const baseHeader = {
    heading: "Overview",
    subtitle: "Latest updates",
  } as const;

  const baseHero = {
    heading: "Team roadmap",
    subtitle: "Supporting updates",
  } as const;

  it("renders a single semantic header element by default", () => {
    const { container } = render(
      <PageHeader header={baseHeader} hero={baseHero} />,
    );

    const headerElements = container.querySelectorAll("header");
    expect(headerElements).toHaveLength(1);
    expect(headerElements[0]).toContainElement(
      screen.getByRole("heading", { level: 1, name: baseHeader.heading }),
    );
  });

  it("allows overriding the hero wrapper element via hero.as", () => {
    const { container, rerender } = render(
      <PageHeader header={baseHeader} hero={baseHero} />,
    );

    expect(container.querySelectorAll("section")).toHaveLength(2);
    expect(container.querySelectorAll("nav")).toHaveLength(0);

    rerender(
      <PageHeader
        header={baseHeader}
        hero={{
          ...baseHero,
          as: "nav",
        }}
      />,
    );

    const heroHeading = screen.getByRole("heading", {
      level: 2,
      name: baseHero.heading,
    });
    expect(heroHeading.closest("nav")).not.toBeNull();
    expect(container.querySelectorAll("nav")).toHaveLength(1);
    expect(container.querySelectorAll("section")).toHaveLength(1);
  });

  it("calms the hero typography by default", () => {
    render(<PageHeader header={baseHeader} hero={baseHero} />);

    const heroHeading = screen.getByRole("heading", {
      level: 2,
      name: baseHero.heading,
    });
    expect(heroHeading).toHaveClass("text-title");
    expect(heroHeading).toHaveClass("md:text-title");
    expect(heroHeading).toHaveClass("break-words");
    expect(heroHeading).toHaveClass("text-balance");
    expect(heroHeading).not.toHaveClass("text-title-lg");
    expect(heroHeading).not.toHaveClass("md:text-title-lg");
    expect(heroHeading).not.toHaveClass("truncate");

    const subtitle = screen.getByText(baseHero.subtitle);
    expect(subtitle).toHaveClass("font-normal");
    expect(subtitle).toHaveClass("break-words");
    expect(subtitle).not.toHaveClass("truncate");
    expect(subtitle).not.toHaveClass("font-medium");
  });

  it("allows opting into the elevated hero tone", () => {
    render(
      <PageHeader
        header={baseHeader}
        hero={{
          ...baseHero,
          tone: "heroic",
        }}
      />,
    );

    const heroHeading = screen.getByRole("heading", {
      level: 2,
      name: baseHero.heading,
    });
    expect(heroHeading).toHaveClass("text-title-lg");
    expect(heroHeading).toHaveClass("md:text-title-lg");
    expect(heroHeading).toHaveClass("break-words");
    expect(heroHeading).toHaveClass("text-balance");
    expect(heroHeading).not.toHaveClass("truncate");

    const subtitle = screen.getByText(baseHero.subtitle);
    expect(subtitle).toHaveClass("font-medium");
    expect(subtitle).toHaveClass("break-words");
    expect(subtitle).not.toHaveClass("truncate");
    expect(subtitle).not.toHaveClass("font-normal");
  });

  it("balances header text when titles span multiple lines", () => {
    const wrappingHeading =
      "Expanded overview with multi-line planning guidance";
    const eyebrow = "Planner daily briefing";

    render(
      <PageHeader
        header={{
          ...baseHeader,
          eyebrow,
          heading: wrappingHeading,
        }}
        hero={{
          ...baseHero,
          eyebrow: undefined,
        }}
      />,
    );

    const headerHeading = screen.getByRole("heading", {
      level: 1,
      name: wrappingHeading,
    });
    expect(headerHeading).toHaveClass("text-balance");
    expect(headerHeading).toHaveClass("break-words");

    const headerEyebrow = screen.getByText(eyebrow);
    expect(headerEyebrow).toHaveClass("text-balance");
    expect(headerEyebrow).toHaveClass("break-words");
  });

  it("moves header tabs into the hero when tabsInHero is enabled", () => {
    const ariaLabel = "Page sections";
    const headerTabs = {
      items: [
        { key: "overview", label: "Overview" },
        { key: "insights", label: "Insights" },
      ],
      value: "overview",
      onChange: vi.fn(),
      ariaLabel,
    };

    const { container } = render(
      <PageHeader
        tabsInHero
        header={{
          ...baseHeader,
          tabs: headerTabs,
        }}
        hero={baseHero}
      />,
    );

    const heroHeading = screen.getByRole("heading", {
      level: 2,
      name: baseHero.heading,
    });
    const heroSection = heroHeading.closest("section");
    expect(heroSection).not.toBeNull();

    const heroTablist = within(heroSection as HTMLElement).getByRole(
      "tablist",
      { name: ariaLabel },
    );
    expect(heroTablist).toBeInTheDocument();

    const headerElement = container.querySelector("header");
    expect(headerElement).not.toBeNull();
    expect(
      within(headerElement as HTMLElement).queryByRole("tablist", {
        name: ariaLabel,
      }),
    ).toBeNull();
  });

  it("centers the frame when only the search slot renders", () => {
    const { container } = render(
      <PageHeader
        header={baseHeader}
        hero={{
          ...baseHero,
          search: {
            value: "",
            onValueChange: vi.fn(),
            "aria-label": "Search",
          },
        }}
      />,
    );

    const slotGroup = container.querySelector('[data-align]');
    expect(slotGroup).not.toBeNull();
    expect(slotGroup).toHaveAttribute("data-align", "center");
    const slots = container.querySelectorAll('[data-slot]');
    expect(slots).toHaveLength(1);
    expect(slots[0]).toHaveAttribute("data-slot", "search");
  });

  it("biases toward center when search and actions slots render", () => {
    const { container } = render(
      <PageHeader
        header={baseHeader}
        hero={{
          ...baseHero,
          search: {
            value: "",
            onValueChange: vi.fn(),
            "aria-label": "Search",
          },
          actions: <button type="button">Sync</button>,
        }}
      />,
    );

    const slotGroup = container.querySelector('[data-align]');
    expect(slotGroup).not.toBeNull();
    expect(slotGroup).toHaveAttribute("data-align", "center");
    const slotKeys = Array.from(
      container.querySelectorAll('[data-slot]'),
      (node) => node.getAttribute("data-slot"),
    );
    expect(slotKeys).toContain("search");
    expect(slotKeys).toContain("actions");
  });

  it("leans toward the end when only tabs and actions render", () => {
    const { container } = render(
      <PageHeader
        header={baseHeader}
        hero={{
          ...baseHero,
          subTabs: {
            items: [
              { key: "overview", label: "Overview" },
              { key: "insights", label: "Insights" },
            ],
            value: "overview",
            onChange: vi.fn(),
            ariaLabel: "Hero tabs",
          },
          actions: <button type="button">Sync</button>,
        }}
      />,
    );

    const slotGroup = container.querySelector('[data-align]');
    expect(slotGroup).not.toBeNull();
    expect(slotGroup).toHaveAttribute("data-align", "end");
    const slots = container.querySelectorAll('[data-slot]');
    expect(slots).toHaveLength(2);
    expect(slots[0]).toHaveAttribute("data-slot", "tabs");
  });
});
