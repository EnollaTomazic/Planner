import React from "react";
import { render, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { FieldRoot, FieldInput } from "../../src/components/ui/primitives/Field";

afterEach(cleanup);

describe("Field", () => {
  it("resolves numeric height to pixel value", () => {
    const { getByTestId } = render(
      <FieldRoot data-testid="field" height={48}>
        <FieldInput aria-label="Pixel height" />
      </FieldRoot>,
    );

    const field = getByTestId("field");
    expect(field.dataset.customHeight).toBe("true");
    const customHeight = field.style.getPropertyValue("--field-custom-height");
    expect(customHeight.trim().endsWith("px")).toBe(true);
    expect(Number.parseFloat(customHeight)).toBe(48);
  });
});
