import * as React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import DashboardSectionHeader from "@/components/home/DashboardSectionHeader";

describe("DashboardSectionHeader", () => {
  it("renders the title layout with actions and show code button", () => {
    const toggleSpy = vi.fn();
    const { container } = render(
      <DashboardSectionHeader
        title="Planner"
        actions={<button type="button">Refresh</button>}
        showCode={{
          controls: "planner-code",
          onToggle: toggleSpy,
          expanded: false,
        }}
      />,
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders skeleton placeholders while loading", () => {
    const { container } = render(
      <DashboardSectionHeader title="Loading state" loading />,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
