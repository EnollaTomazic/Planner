import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HeroTabs } from "@/components/ui/layout/hero/HeroTabs";

afterEach(cleanup);

describe("HeroTabs", () => {
  it("forwards tab item props like loading and ids", () => {
    render(
      <HeroTabs
        activeKey="overview"
        onChange={() => {}}
        linkPanels
        ariaLabel="Hero tabs demo"
        tabs={[
          {
            key: "overview",
            label: "Overview",
            loading: true,
            className: "custom-tab",
            id: "custom-id",
            controls: "panel-id",
          },
          { key: "timeline", label: "Timeline" },
        ]}
      />,
    );

    const activeTab = screen.getByRole("tab", { name: "Overview" });

    expect(activeTab).toHaveAttribute("data-loading", "true");
    expect(activeTab).toHaveAttribute("aria-busy", "true");
    expect(activeTab).toBeDisabled();
    expect(activeTab).toHaveClass("custom-tab");
    expect(activeTab.id).toMatch(/custom-id$/);
    expect(activeTab).toHaveAttribute(
      "aria-controls",
      expect.stringMatching(/panel-id$/),
    );
  });

  it("uses the provided idBase for deterministic tab ids", () => {
    render(
      <HeroTabs
        activeKey="overview"
        onChange={() => {}}
        linkPanels
        idBase="components"
        ariaLabel="Hero tabs demo"
        tabs={[
          {
            key: "overview",
            label: "Overview",
          },
          { key: "timeline", label: "Timeline" },
        ]}
      />,
    );

    const overviewTab = screen.getByRole("tab", { name: "Overview" });

    expect(overviewTab.id).toBe("components-overview-tab");
    expect(overviewTab).toHaveAttribute(
      "aria-controls",
      "components-overview-panel",
    );
  });
});
