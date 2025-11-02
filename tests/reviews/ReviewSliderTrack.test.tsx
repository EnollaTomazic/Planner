import React from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ReviewSliderTrack } from "@/components/reviews/ReviewSliderTrack";

afterEach(() => {
  cleanup();
});

describe("ReviewSliderTrack", () => {
  it("applies glitch tokens for the score tone", () => {
    const { container } = render(
      <ReviewSliderTrack value={7} tone="score" variant="input" />,
    );

    const root = container.querySelector("[data-tone='score']");
    expect(root).not.toBeNull();
    expect(root?.className).toContain(
      "[--slider-fill-background:var(--edge-iris)]",
    );
    expect(root?.className).toContain(
      "[--slider-fill-tint:hsl(var(--accent-1)/0.35)]",
    );

    const track = root?.querySelector("div");
    const fill = track?.firstElementChild as HTMLElement | null;
    expect(fill?.className).toContain("[background:var(--slider-fill-background)]");
    expect(fill?.className).toContain("shadow-[var(--slider-fill-shadow)]");
  });

  it("switches state tokens for the focus tone", () => {
    const { container } = render(
      <ReviewSliderTrack value={6} tone="focus" variant="input" />,
    );

    const root = container.querySelector("[data-tone='focus']");
    expect(root).not.toBeNull();
    expect(root?.className).toContain(
      "[--slider-fill-tint:hsl(var(--focus)/0.35)]",
    );
    expect(root?.className).toContain(
      "[--slider-knob-hover-surface:hsl(var(--focus)/0.3)]",
    );
  });
});
