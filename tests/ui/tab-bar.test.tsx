import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { TabBar } from "@/components/ui";

afterEach(cleanup);

describe("TabBar", () => {
  it("announces aria label", () => {
    render(
      <TabBar
        items={[
          { key: "components", label: "Components" },
          { key: "colors", label: "Colors" },
        ]}
        ariaLabel="Prompts gallery view"
      />
    );
    expect(
      screen.getByRole("tablist", { name: "Prompts gallery view" }),
    ).toBeInTheDocument();
  });

  it("links tabs to panels via aria-controls", () => {
    render(
      <TabBar
        items={[
          {
            key: "components",
            label: "Components",
            id: "components-tab",
            controls: "components-panel",
          },
        ]}
      />
    );
    const tab = screen.getByRole("tab", { name: "Components" });
    expect(tab).toHaveAttribute("id", "components-tab");
    expect(tab).toHaveAttribute("aria-controls", "components-panel");
  });
});
