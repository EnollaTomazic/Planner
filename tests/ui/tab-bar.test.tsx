import React from "react";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
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
    expect(tab.id).toMatch(/components-tab$/);
    expect(tab.getAttribute("aria-controls")).toMatch(/components-panel$/);
  });

  it("moves focus with arrow keys", () => {
    render(
      <TabBar
        items={[
          { key: "one", label: "One" },
          { key: "two", label: "Two" },
        ]}
      />
    );
    const tablist = screen.getByRole("tablist");
    const first = screen.getByRole("tab", { name: "One" });
    const second = screen.getByRole("tab", { name: "Two" });
    first.focus();
    fireEvent.keyDown(tablist, { key: "ArrowRight" });
    expect(second).toHaveFocus();
    expect(second).toHaveAttribute("aria-selected", "true");
  });

  it("ignores arrow keys in right slot inputs", () => {
    render(
      <TabBar
        items={[
          { key: "one", label: "One" },
          { key: "two", label: "Two" },
        ]}
        right={<input aria-label="search" />}
      />
    );
    const input = screen.getByRole("textbox", { name: "search" });
    input.focus();
    fireEvent.keyDown(input, { key: "ArrowRight" });
    const first = screen.getByRole("tab", { name: "One" });
    expect(first).toHaveAttribute("aria-selected", "true");
  });

  it("allows focusing active panel", () => {
    function Wrapper() {
      const [val, setVal] = React.useState("one");
      return (
        <>
          <TabBar
            items={[
              { key: "one", label: "One" },
              { key: "two", label: "Two" },
            ]}
            value={val}
            onValueChange={setVal}
          />
          <div
            role="tabpanel"
            id="one-panel"
            aria-labelledby="one-tab"
            hidden={val !== "one"}
            tabIndex={0}
          >
            One
          </div>
          <div
            role="tabpanel"
            id="two-panel"
            aria-labelledby="two-tab"
            hidden={val !== "two"}
            tabIndex={0}
          >
            Two
          </div>
        </>
      );
    }

    render(<Wrapper />);
    const tablist = screen.getByRole("tablist");
    const first = screen.getByRole("tab", { name: "One" });
    first.focus();
    fireEvent.keyDown(tablist, { key: "ArrowRight" });
    const panel = screen.getByRole("tabpanel");
    panel.focus();
    expect(panel).toHaveFocus();
  });
});
