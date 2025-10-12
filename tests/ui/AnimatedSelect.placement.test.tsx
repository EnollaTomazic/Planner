import * as React from "react";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Select } from "../../src/components/ui/Select";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("AnimatedSelect", () => {
  it("flips upward when there is limited space below the trigger", async () => {
    const originalRequestAnimationFrame = window.requestAnimationFrame;
    const originalCancelAnimationFrame = window.cancelAnimationFrame;
    const originalInnerHeight = window.innerHeight;
    const originalInnerWidth = window.innerWidth;

    window.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    }) as typeof window.requestAnimationFrame;
    window.cancelAnimationFrame = vi.fn() as unknown as typeof window.cancelAnimationFrame;

    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 600,
    });
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 360,
    });

    try {
      const { getByRole } = render(
        <Select
          variant="animated"
          label="Schedule"
          items={[
            { value: "now", label: "Immediate" },
            { value: "soon", label: "Later today" },
            { value: "tomorrow", label: "Tomorrow" },
          ]}
        />
      );

      const trigger = getByRole("button", { name: "Schedule" }) as HTMLButtonElement;
      trigger.getBoundingClientRect = () =>
        ({
          width: 220,
          height: 40,
          top: 540,
          bottom: 580,
          left: 24,
          right: 244,
          x: 24,
          y: 540,
          toJSON: () => ({}),
        }) as DOMRect;

      fireEvent.click(trigger);

      await waitFor(() => {
        expect(document.querySelector('ul[role="listbox"]')).not.toBeNull();
      });

      const menu = document.querySelector<HTMLUListElement>('ul[role="listbox"]');
      expect(menu).not.toBeNull();
      expect(menu?.getAttribute("data-side")).toBe("top");
      const computed = menu ? window.getComputedStyle(menu) : null;
      expect(computed).not.toBeNull();
      expect(computed?.position).toBe("fixed");
      expect(computed?.bottom).toBe("68px");
      expect(computed?.maxHeight).toBe("360px");
      const transformOrigin = computed?.transformOrigin ?? "";
      expect(
        transformOrigin.endsWith("100%") || transformOrigin.includes("bottom"),
      ).toBe(true);
    } finally {
      window.requestAnimationFrame = originalRequestAnimationFrame;
      window.cancelAnimationFrame = originalCancelAnimationFrame;
      Object.defineProperty(window, "innerHeight", {
        configurable: true,
        value: originalInnerHeight,
      });
      Object.defineProperty(window, "innerWidth", {
        configurable: true,
        value: originalInnerWidth,
      });
    }
  });
});

