import * as React from "react";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import {
  Button,
  type ButtonSize,
} from "../../src/components/ui/primitives/Button";
import fs from "fs";

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
    expect(style.outlineStyle === "none" || style.outlineStyle === "").toBe(
      true,
    );
    expect(style.outlineWidth === "0px" || style.outlineWidth === "").toBe(
      true,
    );
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
      "disabled:opacity-[var(--disabled)]",
      "disabled:pointer-events-none",
    );
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it.each<[ButtonSize, string]>([
    ["sm", "[&_svg]:size-4"],
    ["md", "[&_svg]:size-5"],
    ["lg", "[&_svg]:size-8"],
  ])("applies %s icon sizing", (size, cls) => {
    const { getByRole } = render(
      <Button size={size}>
        <svg />
      </Button>,
    );
    expect(getByRole("button")).toHaveClass(cls);
  });

  it.each<[ButtonSize, string]>([
    ["sm", "[&_svg]:size-4"],
    ["md", "[&_svg]:size-5"],
    ["lg", "[&_svg]:size-8"],
  ])("applies %s icon sizing for wrapped icons", (size, cls) => {
    const { getByRole } = render(
      <Button size={size}>
        <span>
          <svg />
        </span>
      </Button>,
    );
    expect(getByRole("button")).toHaveClass(cls);
  });

  it.each<[ButtonSize, string]>([
    ["sm", "gap-1"],
    ["md", "gap-2"],
    ["lg", "gap-4"],
  ])("applies %s gap spacing", (size, cls) => {
    const { getByRole } = render(
      <Button size={size}>
        <svg />
        Label
      </Button>,
    );
    expect(getByRole("button")).toHaveClass(cls);
  });

  it("avoids disallowed px spacing", () => {
    const content = fs.readFileSync(
      "src/components/ui/primitives/Button.tsx",
      "utf8",
    );
    expect(content).not.toMatch(/\bpx-(5|6)\b/);
  });
});
