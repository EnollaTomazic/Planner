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

  it("labels hero frame slots using sanitized tab and search metadata", () => {
    const tabLabelId = "hero-tabs-label";
    render(
      <PageHeader
        header={baseHeader}
        hero={{
          ...baseHero,
          sticky: false,
          children: (
            <span id={tabLabelId} className="sr-only">
              Filter planner highlights
            </span>
          ),
        }}
        subTabs={{
          items: [
            { key: "overview", label: "Overview" },
            { key: "insights", label: "Insights" },
          ],
          value: "overview",
          onChange: vi.fn(),
          ariaLabel: "  Filter planner highlights  ",
          ariaLabelledBy: ` ${tabLabelId} `,
        }}
        search={{
          value: "",
          onValueChange: () => {},
          "aria-label": "  Search planner highlights  ",
        }}
      />,
    );

    const tabsSlot = screen.getByRole("group", {
      name: "Filter planner highlights",
    });
    const searchSlot = screen.getByRole("group", {
      name: "Search planner highlights",
    });

    expect(tabsSlot).not.toBeNull();
    expect(tabsSlot).toHaveAttribute("data-slot", "tabs");
    expect(tabsSlot).toHaveAttribute("aria-labelledby", tabLabelId);
    expect(tabsSlot).toHaveAttribute("aria-label", "Filter planner highlights");

    expect(searchSlot).not.toBeNull();
    expect(searchSlot).toHaveAttribute("data-slot", "search");
    expect(searchSlot).toHaveAttribute("aria-label", "Search planner highlights");
  });
});
