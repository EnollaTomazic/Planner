import React from "react";
import { cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { configureAxe, toHaveNoViolations } from "jest-axe";

import RadioIconGroup, {
  type RadioIconGroupOption,
} from "@/components/ui/radio/RadioIconGroup";

import type { AxeMatchers } from "jest-axe";

declare module "vitest" {
  interface Assertion<T = any> extends AxeMatchers<T> {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}

expect.extend(toHaveNoViolations);

const axe = configureAxe({
  rules: {
    "color-contrast": { enabled: false },
  },
});

const TestIcon: Exclude<RadioIconGroupOption["icon"], undefined> = (
  <svg role="presentation" aria-hidden />
);

const OPTIONS: readonly RadioIconGroupOption[] = [
  { id: "sun", value: "sun", label: "Sun", icon: TestIcon },
  { id: "moon", value: "moon", label: "Moon", icon: TestIcon },
  { id: "flame", value: "flame", label: "Flame", icon: TestIcon },
  { id: "shield", value: "shield", label: "Shield", icon: TestIcon },
];

afterEach(() => {
  cleanup();
});

describe("RadioIconGroup", () => {
  it("renders native radios that share the provided name", async () => {
    const { container, getByRole, getByLabelText } = render(
      <RadioIconGroup
        name="celestial"
        options={OPTIONS}
        value="sun"
        aria-label="Select tone"
        onChange={() => {}}
      />,
    );

    const group = getByRole("radiogroup");
    expect(group).toHaveAttribute("aria-label", "Select tone");

    const inputs = Array.from(
      container.querySelectorAll<HTMLInputElement>('input[type="radio"]'),
    );
    expect(inputs).toHaveLength(OPTIONS.length);
    for (const input of inputs) {
      expect(input.name).toBe("celestial");
    }

    expect(getByLabelText("Sun")).toBe(inputs[0]);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("respects controlled updates including null to value transitions", () => {
    const { rerender, getByLabelText } = render(
      <RadioIconGroup
        name="celestial"
        options={OPTIONS}
        value={null}
        onChange={() => {}}
      />,
    );

    const sun = getByLabelText("Sun") as HTMLInputElement;
    const moon = getByLabelText("Moon") as HTMLInputElement;

    expect(sun.checked).toBe(false);
    expect(moon.checked).toBe(false);

    rerender(
      <RadioIconGroup
        name="celestial"
        options={OPTIONS}
        value="sun"
        onChange={() => {}}
      />,
    );

    expect(sun.checked).toBe(true);

    rerender(
      <RadioIconGroup
        name="celestial"
        options={OPTIONS}
        value="moon"
        onChange={() => {}}
      />,
    );

    expect(moon.checked).toBe(true);
    expect(sun.checked).toBe(false);
  });

  it("emits controlled change events via keyboard navigation", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    function ControlledGroup() {
      const [currentValue, setCurrentValue] = React.useState("sun");
      return (
        <RadioIconGroup
          name="celestial"
          options={OPTIONS}
          value={currentValue}
          onChange={(next) => {
            setCurrentValue(next);
            handleChange(next);
          }}
        />
      );
    }

    const { getByLabelText } = render(<ControlledGroup />);

    await user.tab();
    const sun = getByLabelText("Sun") as HTMLInputElement;
    const moon = getByLabelText("Moon") as HTMLInputElement;

    expect(document.activeElement).toBe(sun);

    await user.keyboard("{ArrowRight}");

    expect(moon.checked).toBe(true);
    expect(document.activeElement).toBe(moon);
    expect(handleChange).toHaveBeenCalledWith("moon");

    await user.keyboard("{ArrowLeft}");
    expect(sun.checked).toBe(true);
    expect(document.activeElement).toBe(sun);
    expect(handleChange).toHaveBeenLastCalledWith("sun");
  });

  it("provides motion-safe fallbacks when reduced motion is preferred", () => {
    const originalMatchMedia = window.matchMedia;
    const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: matchMediaMock,
    });

    try {
      const { container } = render(
        <RadioIconGroup
          name="celestial"
          options={OPTIONS}
          value="sun"
          onChange={() => {}}
        />,
      );

      const control = container.querySelector('[data-part="control"]');
      expect(control?.className).toContain(
        "motion-safe:group-active/radio:scale-95",
      );
      expect(control?.className).toContain("motion-reduce:transform-none");
    } finally {
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: originalMatchMedia,
      });
    }
  });
});
