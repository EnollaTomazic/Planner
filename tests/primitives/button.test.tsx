import React from "react";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { Button } from "../../src/components/ui/primitives/Button";

afterEach(cleanup);

describe("Button", () => {
  it("renders its children", () => {
    const { getByRole } = render(<Button>Click me</Button>);
    expect(getByRole("button")).toHaveTextContent("Click me");
  });

  it("applies variant classes", () => {
    const { getByRole } = render(
      <Button className="btn-primary">Click me</Button>,
    );
    expect(getByRole("button")).toHaveClass("btn-primary");
  });

  it("has no outline when focused", () => {
    const { getByRole } = render(<Button>Focus</Button>);
    const btn = getByRole("button");
    btn.focus();
    const style = getComputedStyle(btn);
    expect(style.outlineStyle === "none" || style.outlineStyle === "").toBe(true);
    expect(style.outlineWidth === "0px" || style.outlineWidth === "").toBe(true);
  });

  it("has reduced opacity and no pointer events when disabled", () => {
    const onClick = vi.fn();
    const { getByRole } = render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>,
    );
    const btn = getByRole("button");
    expect(btn).toHaveClass(
      "disabled:opacity-50",
      "disabled:pointer-events-none",
    );
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it.each([
    ["sm", "[&>svg]:size-4"],
    ["md", "[&>svg]:size-5"],
    ["lg", "[&>svg]:size-6"],
  ])("applies %s icon sizing", (size, cls) => {
    const { getByRole } = render(
      <Button size={size as any}>
        <svg />
      </Button>,
    );
    expect(getByRole("button")).toHaveClass(cls);
  });

  it.each([
    ["sm", "gap-1"],
    ["md", "gap-2"],
    ["lg", "gap-3"],
  ])("applies %s gap spacing", (size, cls) => {
    const { getByRole } = render(
      <Button size={size as any}>
        <svg />
        Label
      </Button>,
    );
    expect(getByRole("button")).toHaveClass(cls);
  });
});
