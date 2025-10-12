import React from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { GlitchProgress } from "../../src/components/ui/primitives/GlitchProgress";

afterEach(cleanup);

describe("GlitchProgress", () => {
  it("keeps zero progress state accessible and visible", () => {
    const { getByRole, getByText } = render(
      <GlitchProgress current={0} total={100} showPercentage />,
    );

    const track = getByRole("progressbar");
    expect(track).toHaveAttribute("data-progress-state", "zero");
    expect(track).toHaveAttribute("aria-valuenow", "0");

    const fill = track.querySelector<HTMLDivElement>(".glitch-fill");
    expect(fill).not.toBeNull();
    expect(fill).toHaveClass("progress-0");

    expect(getByText("0%")).toBeInTheDocument();
  });

  it("switches to the active state when progress is non-zero", () => {
    const { getByRole, getByText } = render(
      <GlitchProgress current={3} total={4} showPercentage />,
    );

    const track = getByRole("progressbar");
    expect(track).toHaveAttribute("data-progress-state", "active");
    expect(track).toHaveAttribute("aria-valuenow", "75");

    const fill = track.querySelector<HTMLDivElement>(".glitch-fill");
    expect(fill).not.toBeNull();
    expect(fill).toHaveClass("progress-75");

    expect(getByText("75%")).toBeInTheDocument();
  });
});
