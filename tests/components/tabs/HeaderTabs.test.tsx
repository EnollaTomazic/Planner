import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  HeaderTabs,
  type HeaderTabItem,
} from "@/components/tabs/HeaderTabs";
import styles from "@/components/tabs/HeaderTabs.module.css";

afterEach(cleanup);

describe("HeaderTabs", () => {
  it("renders items, icons, and stays within the color guard", () => {
    const items: HeaderTabItem<string>[] = [
      {
        key: "timeline",
        label: "Timeline",
        icon: (
          <svg data-testid="timeline-icon" aria-hidden="true">
            <circle cx="8" cy="8" r="4" />
          </svg>
        ),
      },
      { key: "files", label: "Files" },
      { key: "settings", label: "Settings" },
    ];

    const { container } = render(
      <HeaderTabs
        ariaLabel="Project sections"
        defaultValue="timeline"
        items={items}
      />,
    );

    const tablist = screen.getByRole("tablist", { name: "Project sections" });
    expect(tablist).toBeInTheDocument();

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[0]).toHaveClass(styles.tab);
    expect(within(tabs[0]).getByTestId("timeline-icon")).toBeInTheDocument();

    const disallowedColorPattern = /#|rgb\(/i;
    const elementsWithClass = container.querySelectorAll("[class]");
    for (const element of elementsWithClass) {
      const className = element.getAttribute("class") ?? "";
      expect(className).not.toMatch(disallowedColorPattern);
    }
  });

  it("fires onChange when a new tab is clicked", async () => {
    const items: HeaderTabItem<string>[] = [
      { key: "overview", label: "Overview" },
      { key: "insights", label: "Insights" },
    ];
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <HeaderTabs
        ariaLabel="Page sections"
        items={items}
        onChange={onChange}
        value="overview"
      />,
    );

    const insightsTab = screen.getByRole("tab", { name: "Insights" });
    await user.click(insightsTab);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("insights");
  });

  it("skips disabled tabs when navigating with the keyboard and keeps focus visible", () => {
    const items: HeaderTabItem<string>[] = [
      { key: "overview", label: "Overview" },
      { key: "blocked", label: "Blocked", disabled: true },
      { key: "archive", label: "Archive" },
    ];

    render(
      <HeaderTabs
        ariaLabel="Project navigation"
        defaultValue="overview"
        items={items}
      />,
    );

    const overviewTab = screen.getByRole("tab", { name: "Overview" });
    const blockedTab = screen.getByRole("tab", { name: "Blocked" });
    const archiveTab = screen.getByRole("tab", { name: "Archive" });

    expect(blockedTab).toHaveAttribute("aria-disabled", "true");

    overviewTab.focus();
    fireEvent.keyDown(overviewTab, { key: "ArrowRight" });

    expect(archiveTab).toHaveAttribute("aria-selected", "true");
    expect(archiveTab).toHaveFocus();
    expect(archiveTab).toHaveClass(styles.tab);

    fireEvent.keyDown(archiveTab, { key: "ArrowLeft" });

    expect(overviewTab).toHaveAttribute("aria-selected", "true");
    expect(overviewTab).toHaveFocus();
  });
});
