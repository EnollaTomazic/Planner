import * as React from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import DashboardList from "@/components/home/DashboardList";

let restoreFns: Array<() => void> = [];

afterEach(() => {
  restoreFns.forEach((restore) => restore());
  restoreFns = [];
  vi.unstubAllEnvs();
});

describe("DashboardList", () => {
  it("resolves keys using ids, primitive values, and indexes while warning once", () => {
    type MixedItem = { id?: string; label: string } | string;

    vi.stubEnv("NODE_ENV", "development");

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    restoreFns.push(() => warnSpy.mockRestore());

    const capturedKeys: Array<string | null> = [];
    const originalCreateElement = React.createElement;
    const createElementSpy = vi
      .spyOn(React, "createElement")
      .mockImplementation((...args: Parameters<typeof originalCreateElement>) => {
        const [type] = args;
        const element = originalCreateElement(...args);

        if (type === "li") {
          capturedKeys.push(element.key);
        }

        return element;
      });
    restoreFns.push(() => createElementSpy.mockRestore());

    const items: MixedItem[] = [
      { id: "with-id", label: "Alpha" },
      "Bravo",
      { label: "Missing id" },
    ];

    render(
      <DashboardList
        items={items}
        renderItem={(item) => (typeof item === "string" ? item : item.label)}
        empty="No results"
      />,
    );

    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Bravo")).toBeInTheDocument();
    expect(screen.getByText("Missing id")).toBeInTheDocument();

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      "DashboardList: unable to determine a stable key for one or more items. Provide a `getKey` prop when rendering DashboardList to ensure stable item identity.",
    );
    expect(capturedKeys).toEqual(["with-id", "Bravo", "2"]);
  });

  it("applies itemClassName when provided as a string or function", () => {
    const items = [
      { id: "first", label: "First" },
      { id: "second", label: "Second" },
    ];

    const { container, rerender } = render(
      <DashboardList
        items={items}
        renderItem={(item) => item.label}
        empty="No results"
        itemClassName="static-class"
      />,
    );

    const initialItems = container.querySelectorAll("li");
    expect(initialItems).toHaveLength(2);
    expect(initialItems[0]).toHaveClass("static-class");
    expect(initialItems[1]).toHaveClass("static-class");

    rerender(
      <DashboardList
        items={items}
        renderItem={(item) => item.label}
        empty="No results"
        itemClassName={(_item, index) => `dynamic-${index}`}
      />,
    );

    const updatedItems = container.querySelectorAll("li");
    expect(updatedItems).toHaveLength(2);
    expect(updatedItems[0]).toHaveClass("dynamic-0");
    expect(updatedItems[1]).toHaveClass("dynamic-1");
  });

  it("shows the empty state with icon and call-to-action when no items are provided", () => {
    const emptyCopy = "Nothing to show";
    const cta = { label: "View all", href: "/items" };

    const { container } = render(
      <DashboardList<{ title: string }>
        items={[]}
        renderItem={() => null}
        empty={emptyCopy}
        cta={cta}
      />,
    );

    expect(container.querySelector("svg.lucide-circle-slash")).toBeInTheDocument();
    expect(screen.getByText(emptyCopy)).toBeInTheDocument();

    const link = screen.getByRole("link", { name: cta.label });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", cta.href);
  });
});
