import * as React from "react";
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
});
