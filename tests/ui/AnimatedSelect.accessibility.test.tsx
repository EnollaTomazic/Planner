import * as React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Select } from "../../src/components/ui/Select";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("AnimatedSelect", () => {
  it("marks disabled and loading options with appropriate ARIA attributes", async () => {
    const originalRequestAnimationFrame = window.requestAnimationFrame;
    const originalCancelAnimationFrame = window.cancelAnimationFrame;

    window.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    }) as typeof window.requestAnimationFrame;
    window.cancelAnimationFrame = vi.fn() as unknown as typeof window.cancelAnimationFrame;

    try {
      render(
        <Select
          variant="animated"
          label="Schedule"
          items={[
            { value: "now", label: "Immediate" },
            { value: "soon", label: "Later today", disabled: true },
            { value: "later", label: "Tomorrow", loading: true },
          ]}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Schedule" }));

      const disabledOption = await screen.findByRole("option", { name: "Later today" });
      expect(disabledOption).toHaveAttribute("aria-disabled", "true");
      expect(disabledOption).toBeDisabled();

      const loadingOption = await screen.findByRole("option", { name: "Tomorrow" });
      expect(loadingOption).toHaveAttribute("aria-disabled", "true");
      expect(loadingOption).toHaveAttribute("aria-busy", "true");
      expect(loadingOption).toHaveAccessibleName("Tomorrow");
    } finally {
      window.requestAnimationFrame = originalRequestAnimationFrame;
      window.cancelAnimationFrame = originalCancelAnimationFrame;
    }
  });
});

