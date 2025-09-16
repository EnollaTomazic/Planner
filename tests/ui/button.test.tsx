import React from "react";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import {
  Button,
  type ButtonProps,
  type ButtonSize,
} from "@/components/ui";

afterEach(cleanup);

describe("Button", () => {
  const sizes: Record<ButtonSize, string> = {
    sm: "h-[var(--control-h-sm)]",
    md: "h-[var(--control-h-md)]",
    lg: "h-[var(--control-h-lg)]",
  };

  const variantToneClasses: Record<
    NonNullable<ButtonProps["variant"]>,
    Record<NonNullable<ButtonProps["tone"]>, string[]>
  > = {
    primary: {
      primary: [
        "text-[hsl(var(--primary-foreground))]",
        "bg-[hsl(var(--foreground)/0.12)]",
        "border-[hsl(var(--foreground)/0.35)]",
        "[--hover:theme('colors.interaction.primary.hover')]",
        "[--active:theme('colors.interaction.primary.active')]",
      ],
      accent: [
        "text-[hsl(var(--accent-foreground))]",
        "bg-[hsl(var(--accent)/0.12)]",
        "border-[hsl(var(--accent)/0.35)]",
        "[--hover:theme('colors.interaction.accent.hover')]",
        "[--active:theme('colors.interaction.accent.active')]",
      ],
      info: [
        "text-[hsl(var(--accent-2-foreground))]",
        "bg-[hsl(var(--accent-2)/0.12)]",
        "border-[hsl(var(--accent-2)/0.35)]",
        "[--hover:theme('colors.interaction.info.hover')]",
        "[--active:theme('colors.interaction.info.active')]",
      ],
      danger: [
        "text-[hsl(var(--danger-foreground))]",
        "bg-[hsl(var(--danger)/0.12)]",
        "border-[hsl(var(--danger)/0.35)]",
        "[--hover:theme('colors.interaction.danger.hover')]",
        "[--active:theme('colors.interaction.danger.active')]",
      ],
    },
    secondary: {
      primary: ["text-foreground"],
      accent: ["text-accent", "bg-accent/15"],
      info: ["text-accent-2", "bg-accent-2/15"],
      danger: ["text-danger", "bg-danger/15"],
    },
    ghost: {
      primary: ["text-foreground"],
      accent: ["text-accent"],
      info: ["text-accent-2"],
      danger: ["text-danger"],
    },
  };

  const cases: [
    ButtonSize,
    NonNullable<ButtonProps["variant"]>,
    NonNullable<ButtonProps["tone"]>,
    string,
    string[],
  ][] = [];

  for (const [size, sizeCls] of Object.entries(sizes) as [
    ButtonSize,
    string
  ][]) {
    for (const variant of Object.keys(variantToneClasses) as Array<
      NonNullable<ButtonProps["variant"]>
    >) {
      for (const tone of Object.keys(variantToneClasses[variant]) as Array<
        NonNullable<ButtonProps["tone"]>
      >) {
        cases.push([
          size,
          variant,
          tone,
          sizeCls,
          variantToneClasses[variant][tone],
        ]);
      }
    }
  }

  it.each(cases)(
    "applies %s size, %s variant, %s tone",
    (size, variant, tone, sizeCls, toneClasses) => {
      const { getByRole } = render(
        <Button size={size} variant={variant} tone={tone}>
          Combo
        </Button>,
      );
      const btn = getByRole("button");
      expect(btn).toHaveClass(sizeCls);
      toneClasses.forEach((cls) => expect(btn).toHaveClass(cls));
    },
  );

  it("disables interaction when disabled", () => {
    const onClick = vi.fn();
    const { getByRole } = render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>,
    );
    const btn = getByRole("button");
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("sets data-loading and disables interaction when loading", () => {
    const onClick = vi.fn();
    const { getByRole } = render(
      <Button loading onClick={onClick}>
        Loading
      </Button>,
    );
    const btn = getByRole("button");
    expect(btn).toHaveAttribute("data-loading", "true");
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
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
});

