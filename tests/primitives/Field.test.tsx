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
    const instanceId = field.getAttribute("data-field-instance");
    expect(instanceId).toBeTruthy();
    if (!instanceId) {
      throw new Error("Expected data-field-instance to be set");
    }
    const hasStyle = Array.from(
      document.querySelectorAll("style"),
    ).some((node) =>
      node.textContent?.includes(`[data-field-instance="${instanceId}"]`) &&
      node.textContent?.includes("--field-h: 48px"),
    );
    expect(hasStyle).toBe(true);
  });
});
