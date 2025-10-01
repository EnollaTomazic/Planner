import React from "react";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import Button, {
  type ButtonProps,
  type ButtonSize,
  type ButtonVariant,
} from "@/components/ui/primitives/Button";

afterEach(cleanup);

describe("Button", () => {
  const sizes: Record<ButtonSize, string> = {
    sm: "h-[var(--control-h-sm)]",
    md: "h-[var(--control-h-md)]",
    lg: "h-[var(--control-h-lg)]",
    xl: "h-[var(--control-h-xl)]",
  };

  const defaultToneClassMap = {
    primary: [
      "text-[hsl(var(--primary-foreground))]",
      "[--neu-surface:hsl(var(--primary-soft))]",
      "border-[hsl(var(--primary)/0.35)]",
      "[--hover:hsl(var(--primary)/0.14)]",
      "[--active:hsl(var(--primary)/0.2)]",
    ],
    accent: [
      "text-on-accent",
      "[--neu-surface:hsl(var(--accent)/0.12)]",
      "border-[hsl(var(--accent)/0.35)]",
      "[--hover:hsl(var(--accent)/0.14)]",
      "[--active:hsl(var(--accent)/0.2)]",
    ],
    info: [
      "text-on-accent",
      "[--neu-surface:hsl(var(--accent-2)/0.12)]",
      "border-[hsl(var(--accent-2)/0.35)]",
      "[--hover:hsl(var(--accent-2)/0.14)]",
      "[--active:hsl(var(--accent-2)/0.2)]",
    ],
    danger: [
      "text-[hsl(var(--danger-foreground))]",
      "[--neu-surface:hsl(var(--danger)/0.12)]",
      "border-[hsl(var(--danger)/0.35)]",
      "[--hover:hsl(var(--danger)/0.14)]",
      "[--active:hsl(var(--danger)/0.2)]",
    ],
  } as const;

  const neoToneClassMap = {
    primary: [
      "text-muted-foreground",
      "hover:text-foreground",
      "active:text-foreground",
      "focus-visible:text-foreground",
      "[--neu-surface:hsl(var(--panel)/0.6)]",
      "[--hover:hsl(var(--primary)/0.25)]",
      "[--active:hsl(var(--primary)/0.35)]",
    ],
    accent: [
      "text-on-accent",
      "[--neu-surface:hsl(var(--accent)/0.3)]",
      "[--hover:hsl(var(--accent)/0.25)]",
      "[--active:hsl(var(--accent)/0.2)]",
    ],
    info: [
      "text-on-accent",
      "[--neu-surface:hsl(var(--accent-2)/0.25)]",
      "[--hover:hsl(var(--accent-2)/0.2)]",
      "[--active:hsl(var(--accent-2)/0.15)]",
    ],
    danger: [
      "text-[hsl(var(--danger-tint-foreground))]",
      "[--neu-surface:hsl(var(--danger)/0.25)]",
      "[--hover:hsl(var(--danger)/0.14)]",
      "[--active:hsl(var(--danger)/0.2)]",
    ],
  } as const;

  const quietToneClassMap = {
    primary: [
      "text-foreground",
      "[--neu-surface:hsl(var(--card)/0.6)]",
      "border-[hsl(var(--line)/0.35)]",
      "[--hover:hsl(var(--bg)/0.8)]",
      "[--active:hsl(var(--bg))]",
    ],
    accent: [
      "text-on-accent",
      "[--neu-surface:hsl(var(--accent)/0.2)]",
      "border-accent/35",
      "[--hover:hsl(var(--accent)/0.25)]",
      "[--active:hsl(var(--accent)/0.35)]",
    ],
    info: [
      "text-on-accent",
      "[--neu-surface:hsl(var(--accent-2)/0.2)]",
      "border-accent-2/35",
      "[--hover:hsl(var(--accent-2)/0.25)]",
      "[--active:hsl(var(--accent-2)/0.35)]",
    ],
    danger: [
      "text-danger",
      "[--neu-surface:hsl(var(--danger)/0.12)]",
      "border-danger/35",
      "[--hover:hsl(var(--danger)/0.1)]",
      "[--active:hsl(var(--danger)/0.2)]",
    ],
  } as const;

  const variantToneClasses: Record<
    ButtonVariant,
    Record<NonNullable<ButtonProps["tone"]>, readonly string[]>
  > = {
    default: defaultToneClassMap,
    neo: neoToneClassMap,
    quiet: quietToneClassMap,
    glitch: defaultToneClassMap,
  };

  const cases: [
    ButtonSize,
    ButtonVariant,
    NonNullable<ButtonProps["tone"]>,
    string,
    readonly string[],
  ][] = [];

  for (const [size, sizeCls] of Object.entries(sizes) as [
    ButtonSize,
    string
  ][]) {
    for (const variant of Object.keys(variantToneClasses) as ButtonVariant[]) {
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

