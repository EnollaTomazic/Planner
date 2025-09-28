import React from "react";
import { render, cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import TimerRingIcon from "@/icons/TimerRingIcon";

afterEach(() => {
  cleanup();
});

describe("TimerRingIcon", () => {
  it("announces timer progress via an accessible label", () => {
    render(<TimerRingIcon pct={72} />);

    expect(
      screen.getByRole("img", { name: "Timer 72% complete" }),
    ).toBeInTheDocument();
  });

  it("assigns unique gradient ids when rendering multiple icons", () => {
    const { container } = render(
      <div>
        <TimerRingIcon pct={25} size={80} />
        <TimerRingIcon pct={50} size={80} />
        <TimerRingIcon pct={75} size={80} />
      </div>,
    );

    const gradients = Array.from(
      container.querySelectorAll("linearGradient[id^='timer-ring-grad-']"),
    );

    expect(gradients).toHaveLength(3);

    const gradientIds = gradients
      .map((gradient) => gradient.getAttribute("id"))
      .filter((id): id is string => Boolean(id));

    expect(gradientIds).toHaveLength(3);
    expect(new Set(gradientIds).size).toBe(gradientIds.length);

    gradientIds.forEach((id) => {
      const matchedStrokes = container.querySelectorAll(
        `circle[stroke="url(#${id})"]`,
      );

      expect(matchedStrokes).toHaveLength(1);
    });

    const filters = Array.from(
      container.querySelectorAll("filter[id^='ring-noise-filter-']"),
    );

    expect(filters).toHaveLength(3);

    const filterIds = filters
      .map((filter) => filter.getAttribute("id"))
      .filter((id): id is string => Boolean(id));

    expect(filterIds).toHaveLength(3);
    expect(new Set(filterIds).size).toBe(filterIds.length);

    filterIds.forEach((id) => {
      const filteredStrokes = container.querySelectorAll(
        `circle[filter="url(#${id})"]`,
      );

      expect(filteredStrokes).toHaveLength(1);
    });
  });
});
