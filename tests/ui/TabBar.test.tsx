import React from "react";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { Header } from "@/components/ui/layout/Header";
import { Hero } from "@/components/ui/layout/Hero";

afterEach(cleanup);

describe("TabBar", () => {
  it("renders view tabs in header and handles arrow navigation", () => {
    function Wrapper() {
      const [view, setView] = React.useState("components");
      return (
        <Header
          heading="Playground"
          tabs={{
            items: [
              { key: "components", label: "Components" },
              { key: "colors", label: "Colors" },
            ],
            value: view,
            onChange: setView,
          }}
        />
      );
    }
    render(<Wrapper />);
    const tablist = screen.getByRole("tablist");
    const first = screen.getByRole("tab", { name: "Components" });
    const second = screen.getByRole("tab", { name: "Colors" });
    first.focus();
    fireEvent.keyDown(tablist, { key: "ArrowRight" });
    expect(second).toHaveFocus();
    expect(second).toHaveAttribute("aria-selected", "true");
  });

  it("shows section tabs in hero only when provided", () => {
    const { rerender } = render(<Hero heading="Components" />);
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();

    rerender(
      <Hero
        heading="Components"
        subTabs={{
          items: [
            { key: "buttons", label: "Buttons" },
            { key: "inputs", label: "Inputs" },
          ],
          value: "buttons",
          onChange: () => {},
          idBase: "components",
        }}
      />,
    );
    const firstTab = screen.getByRole("tab", { name: "Buttons" });
    expect(firstTab).toBeInTheDocument();
    expect(firstTab.id).toBe("components-buttons-tab");
    expect(firstTab).toHaveAttribute(
      "aria-controls",
      "components-buttons-panel",
    );
  });

  it("no longer renders the decorative header rail", () => {
    const { container, rerender } = render(<Hero heading="Components" />);
    expect(container.querySelector(".header-rail")).toBeNull();

    rerender(<Hero heading="Components" rail />);
    expect(container.querySelector(".header-rail")).toBeNull();
  });
});
