import React from "react";
import { render, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import IconButton from "../../src/components/ui/primitives/IconButton";

afterEach(cleanup);

describe("IconButton", () => {
  it("renders children", () => {
    const { getByRole } = render(
      <IconButton aria-label="up">up</IconButton>,
    );
    expect(getByRole("button")).toHaveTextContent("up");
  });

  it("has no outline when focused", () => {
    const { getByRole } = render(
      <IconButton aria-label="focus">X</IconButton>,
    );
    const btn = getByRole("button");
    btn.focus();
    const style = getComputedStyle(btn);
    expect(style.outlineStyle === "none" || style.outlineStyle === "").toBe(
      true,
    );
    expect(style.outlineWidth === "0px" || style.outlineWidth === "").toBe(
      true,
    );
  });

  it("warns when missing accessible label", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<IconButton {...({} as any)}>warn</IconButton>);
    expect(warn).toHaveBeenCalledWith(
      "IconButton: Missing accessible label. Provide one of `aria-label`, `aria-labelledby`, or `title`.",
    );
    warn.mockRestore();
  });
});

