import React from "react";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { Header, Hero } from "@/components/ui";

afterEach(cleanup);

describe("navigation tabs", () => {
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
        tabs={{
          items: [
            { key: "buttons", label: "Buttons" },
            { key: "inputs", label: "Inputs" },
          ],
          value: "buttons",
          onChange: () => {},
        }}
      />,
    );
    expect(screen.getByRole("tab", { name: "Buttons" })).toBeInTheDocument();
  });
});
