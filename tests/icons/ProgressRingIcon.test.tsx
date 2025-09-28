import React from "react";
import { render, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import ProgressRingIcon from "@/icons/ProgressRingIcon";

afterEach(() => {
  cleanup();
});

describe("ProgressRingIcon", () => {
  it("hides the SVG from assistive technology", () => {
    const { container } = render(<ProgressRingIcon pct={40} size="s" />);

    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });

  it("references the shared ring noise filter", () => {
    const { container } = render(
      <div>
        <ProgressRingIcon pct={55} />
        <ProgressRingIcon pct={65} />
      </div>,
    );

    const filters = Array.from(
      container.querySelectorAll("filter[id^='ring-noise-']"),
    );

    expect(filters.length).toBe(2);

    filters.forEach((filter) => {
      const id = filter.getAttribute("id");
      expect(id).toBeTruthy();
      const circles = container.querySelectorAll(
        `circle[filter="url(#${id})"]`,
      );
      expect(circles).toHaveLength(1);
    });
  });
});
