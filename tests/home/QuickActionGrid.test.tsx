import * as React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import QuickActionGrid from "@/components/home/QuickActionGrid";

afterEach(cleanup);

describe("QuickActionGrid", () => {
  it("forwards linkProps event handlers and aria metadata", () => {
    const handleClick = vi.fn<(event: React.MouseEvent<HTMLAnchorElement>) => void>();
    render(
      <QuickActionGrid
        actions={[
          {
            href: "/planner",
            label: "Plan week",
            linkProps: {
              onClick: (event) => {
                event.preventDefault();
                handleClick(event);
              },
              "aria-label": "Plan your week",
            },
          },
        ]}
      />,
    );

    const actionLink = screen.getByRole("link", { name: "Plan your week" });
    fireEvent.click(actionLink);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("preserves external target attributes when rendering anchor actions", () => {
    const handleExternal = vi.fn();
    render(
      <QuickActionGrid
        actions={[
          {
            href: "https://example.com",
            label: "External",
            linkProps: {
              target: "_blank",
              onClick: (event) => {
                event.preventDefault();
                handleExternal();
              },
            },
          },
        ]}
      />,
    );

    const externalLink = screen.getByRole("link", { name: "External" });
    expect(externalLink).toHaveAttribute("target", "_blank");
    expect(externalLink).toHaveAttribute("rel", "noopener noreferrer");

    fireEvent.click(externalLink);
    expect(handleExternal).toHaveBeenCalledTimes(1);
  });

  it("renders hash actions with native anchors without crashing", () => {
    let renderResult: ReturnType<typeof render> | undefined;

    expect(() => {
      renderResult = render(
        <QuickActionGrid
          actions={[
            {
              href: "#hash-action",
              label: "Hash action",
            },
          ]}
        />,
      );
    }).not.toThrow();

    expect(renderResult).toBeDefined();
    const hashLink = renderResult!.getByRole("link", { name: "Hash action" });

    expect(hashLink).toBeInstanceOf(HTMLAnchorElement);
    expect(hashLink).toHaveAttribute("href", "#hash-action");
  });
});
