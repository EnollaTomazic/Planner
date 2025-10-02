import React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import RadioIconGroup, {
  type RadioIconGroupOption,
} from "@/components/ui/toggles/RadioIconGroup";

const TestIcon: RadioIconGroupOption["icon"] = (props) => (
  <svg role="presentation" aria-hidden {...props} />
);

const OPTIONS: readonly RadioIconGroupOption[] = [
  { value: "sun", label: "Sun", icon: TestIcon },
  { value: "moon", label: "Moon", icon: TestIcon },
  { value: "flame", label: "Flame", icon: TestIcon },
];

afterEach(() => {
  cleanup();
});

describe("RadioIconGroup", () => {
  it("exposes a labelled radiogroup with matching radios", () => {
    const { getByRole, getAllByRole } = render(
      <RadioIconGroup options={OPTIONS} value="sun" aria-label="Select tone" />,
    );

    const group = getByRole("radiogroup");
    expect(group).toHaveAttribute("aria-label", "Select tone");

    const radios = getAllByRole("radio");
    expect(radios).toHaveLength(OPTIONS.length);
    expect(radios[0]).toHaveAttribute("aria-labelledby");
  });

  it("announces loading via aria-busy", () => {
    const { getByRole, rerender } = render(
      <RadioIconGroup options={OPTIONS} value="sun" loading />,
    );

    const group = getByRole("radiogroup");
    expect(group).toHaveAttribute("aria-busy", "true");

    rerender(<RadioIconGroup options={OPTIONS} value="sun" loading={false} />);

    expect(group).not.toHaveAttribute("aria-busy");
  });

  it("supports keyboard navigation", () => {
    const handleChange = vi.fn();
    const { getAllByRole } = render(
      <RadioIconGroup options={OPTIONS} value="sun" onChange={handleChange} />,
    );

    const radios = getAllByRole("radio");
    radios[0].focus();

    fireEvent.keyDown(radios[0], { key: "ArrowRight" });
    expect(radios[1]).toHaveFocus();

    fireEvent.keyDown(radios[1], { key: "Enter" });
    expect(handleChange).toHaveBeenCalledWith("moon");
  });

  it("surfaces tone tokens for styling", () => {
    const { getAllByRole } = render(
      <RadioIconGroup options={OPTIONS} value="sun" tone="accent" />,
    );

    const firstWrapper = getAllByRole("radio")[0].parentElement;
    expect(firstWrapper?.className).toContain("[--radio-hover-surface:hsl(var(--accent)/0.16)]");
    expect(firstWrapper?.className).toContain("[--radio-active-surface:hsl(var(--accent)/0.26)]");
  });
});
