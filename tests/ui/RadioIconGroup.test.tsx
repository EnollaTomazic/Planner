import React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import RadioIconGroup, {
  type RadioIconGroupOption,
} from "@/components/ui/radio/RadioIconGroup";

const TestIcon: Exclude<RadioIconGroupOption["icon"], undefined> = (
  <svg role="presentation" aria-hidden />
);

const OPTIONS: readonly RadioIconGroupOption[] = [
  { id: "sun", value: "sun", label: "Sun", icon: TestIcon },
  { id: "moon", value: "moon", label: "Moon", icon: TestIcon },
  { id: "flame", value: "flame", label: "Flame", icon: TestIcon },
];

afterEach(() => {
  cleanup();
});

describe("RadioIconGroup", () => {
  it("exposes a labelled radiogroup with matching radios", () => {
    const { getByRole, getAllByRole, getByLabelText } = render(
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

    const radios = getAllByRole("radio");
    expect(radios).toHaveLength(OPTIONS.length);
    expect(radios[0]).toHaveAttribute("id", OPTIONS[0]!.id);
    expect(getByLabelText("Moon")).toHaveAttribute("id", OPTIONS[1]!.id);
  });

  it("announces loading via aria-busy", () => {
    const { getByRole, rerender } = render(
      <RadioIconGroup
        name="celestial"
        options={OPTIONS}
        value="sun"
        loading
        onChange={() => {}}
      />,
    );

    const group = getByRole("radiogroup");
    expect(group).toHaveAttribute("aria-busy", "true");

    rerender(
      <RadioIconGroup
        name="celestial"
        options={OPTIONS}
        value="sun"
        loading={false}
        onChange={() => {}}
      />,
    );

    expect(group).not.toHaveAttribute("aria-busy");
  });

  it("invokes change handlers on interaction", () => {
    const handleChange = vi.fn();
    const { getByLabelText } = render(
      <RadioIconGroup
        name="celestial"
        options={OPTIONS}
        value="sun"
        onChange={handleChange}
      />,
    );

    fireEvent.click(getByLabelText("Moon"));
    expect(handleChange).toHaveBeenCalledWith("moon");
  });

  it("surfaces tone tokens for styling", () => {
    const { getAllByRole } = render(
      <RadioIconGroup
        name="celestial"
        options={OPTIONS}
        value="sun"
        tone="accent"
        onChange={() => {}}
      />,
    );

    const firstRadio = getAllByRole("radio")[0];
    const label = firstRadio.parentElement?.querySelector("label");
    const iconContainer = label?.querySelector('[data-part="control"]');

    expect(iconContainer?.className).toContain("peer-checked:bg-accent/18");
    expect(iconContainer?.className).toContain("peer-checked:border-accent/45");
  });

  it("supports null selections", () => {
    const { getAllByRole } = render(
      <RadioIconGroup
        name="celestial"
        options={OPTIONS}
        value={null}
        onChange={() => {}}
      />,
    );

    const radios = getAllByRole("radio");
    for (const radio of radios) {
      expect(radio).not.toBeChecked();
    }
  });
});
