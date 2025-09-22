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

    expect(getByTestId("field")).toHaveStyle("--field-h: 48px");
  });
});
