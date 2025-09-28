import React from "react";
import { render, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import ProgressRingIcon from "@/icons/ProgressRingIcon";
import TimerRingIcon from "@/icons/TimerRingIcon";
import { VARIANTS, applyTheme } from "@/lib/theme";

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute("style");
  document.documentElement.className = "";
  delete document.documentElement.dataset.themePref;
});

describe.each(VARIANTS)("Ring icons across themes", ({ id: variant }) => {
  it(`renders ring icons for the ${variant} theme`, () => {
    applyTheme({ variant, bg: 0 });

    const { container } = render(
      <div className="flex gap-4">
        <ProgressRingIcon pct={60} size="m" />
        <TimerRingIcon pct={80} size="l" />
      </div>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
