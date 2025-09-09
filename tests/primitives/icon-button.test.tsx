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
    ["xs", "[&>svg]:h-5 [&>svg]:w-5"],
    ["sm", "[&>svg]:h-6 [&>svg]:w-6"],
    ["md", "[&>svg]:h-7 [&>svg]:w-7"],
    ["lg", "[&>svg]:h-8 [&>svg]:w-8"],
    ["xl", "[&>svg]:h-9 [&>svg]:w-9"],
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
    expect(classes).toContain("border bg-transparent hover:bg-panel/45");
    expect(classes).toContain(
      "border-[hsl(var(--line)/0.35)] text-[hsl(var(--foreground))]",
    );
  });

  it("applies solid variant with accent tone", () => {
    const { getByRole } = render(
      <IconButton variant="solid" tone="accent" aria-label="sa" />,
    );
    const classes = getByRole("button").className;
    expect(classes).toContain("border");
    expect(classes).toContain(
      "border-transparent bg-[hsl(var(--accent)/0.15)] hover:bg-[hsl(var(--accent)/0.25)] text-[hsl(var(--accent))]",
    );
  });

  it("applies glow variant with info tone", () => {
    const { getByRole } = render(
      <IconButton variant="glow" tone="info" aria-label="gi" />,
    );
    const classes = getByRole("button").className;
    expect(classes).toContain(
      "border bg-transparent hover:bg-panel/45 shadow-[0_0_8px_currentColor]",
    );
    expect(classes).toContain(
      "border-[hsl(var(--accent-2)/0.35)] text-[hsl(var(--accent-2))]",
    );
  });

  it("applies ring variant with danger tone", () => {
    const { getByRole } = render(
      <IconButton variant="ring" tone="danger" aria-label="rd" />,
    );
    const classes = getByRole("button").className;
    expect(classes).toContain("border bg-transparent hover:bg-panel/45");
    expect(classes).toContain(
      "border-[hsl(var(--danger)/0.35)] text-[hsl(var(--danger))]",
    );
    expect(classes).not.toContain("shadow-[0_0_8px_currentColor]");
  });
});
