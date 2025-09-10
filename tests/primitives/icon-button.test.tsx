import React from "react";
import { render, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
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

  const sizeCases = [
    ["xs", "h-8 w-8"],
    ["sm", "h-9 w-9"],
    ["md", "h-10 w-10"],
    ["lg", "h-11 w-11"],
    ["xl", "h-12 w-12"],
  ] as const;

  sizeCases.forEach(([size, cls]) => {
    it(`applies ${size} size classes`, () => {
      const { getByRole } = render(
        <IconButton size={size} aria-label={size} />,
      );
      expect(getByRole("button").className).toContain(cls);
    });
  });

  const iconCases = [
    ["xs", "[&>svg]:h-[18px] [&>svg]:w-[18px]"],
    ["sm", "[&>svg]:h-[20px] [&>svg]:w-[20px]"],
    ["md", "[&>svg]:h-[22px] [&>svg]:w-[22px]"],
    ["lg", "[&>svg]:h-[25px] [&>svg]:w-[25px]"],
    ["xl", "[&>svg]:h-[27px] [&>svg]:w-[27px]"],
  ] as const;

  iconCases.forEach(([iconSize, cls]) => {
    it(`applies ${iconSize} icon size classes`, () => {
      const { getByRole } = render(
        <IconButton iconSize={iconSize} aria-label={iconSize} />,
      );
      expect(getByRole("button").className).toContain(cls);
    });
  });

  it("applies ring variant with primary tone", () => {
    const { getByRole } = render(
      <IconButton variant="ring" tone="primary" aria-label="rp" />,
    );
    const classes = getByRole("button").className;
    expect(classes).toContain("border bg-card/35 hover:bg-[--hover]");
    expect(classes).toContain("[--hover:hsl(var(--panel)/0.45)]");
    expect(classes).toContain("border-line/35 text-foreground");
  });

  it("applies solid variant with accent tone", () => {
    const { getByRole } = render(
      <IconButton variant="solid" tone="accent" aria-label="sa" />,
    );
    const classes = getByRole("button").className;
    expect(classes).toContain("border");
    expect(classes).toContain(
      "border-transparent bg-accent/15 text-accent",
    );
    expect(classes).toContain("[--hover:hsl(var(--accent)/0.25)]");
  });

  it("applies glow variant with info tone", () => {
    const { getByRole } = render(
      <IconButton variant="glow" tone="info" aria-label="gi" />,
    );
    const classes = getByRole("button").className;
    expect(classes).toContain("border bg-card/35");
    expect(classes).toContain("hover:bg-[--hover]");
    expect(classes).toContain("shadow-[0_0_8px_currentColor]");
    expect(classes).toContain("[--hover:hsl(var(--panel)/0.45)]");
    expect(classes).toContain("border-accent-2/35 text-accent-2");
  });

  it("applies ring variant with danger tone", () => {
    const { getByRole } = render(
      <IconButton variant="ring" tone="danger" aria-label="rd" />,
    );
    const classes = getByRole("button").className;
    expect(classes).toContain("border bg-card/35 hover:bg-[--hover]");
    expect(classes).toContain("[--hover:hsl(var(--panel)/0.45)]");
    expect(classes).toContain("border-danger/35 text-danger");
    expect(classes).not.toContain("shadow-[0_0_8px_currentColor]");
  });
});
