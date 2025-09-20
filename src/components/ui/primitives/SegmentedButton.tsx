"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ButtonSize } from "./Button";

export type SegmentedButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  as?: React.ElementType;
  isActive?: boolean;
  href?: string;
  loading?: boolean;
  size?: ButtonSize;
};

const SEGMENTED_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: cn(
    "h-[var(--control-h-sm)]",
    "px-[var(--space-3)]",
    "py-[var(--space-1)]",
    "text-ui",
    "gap-[var(--space-2)]",
  ),
  md: cn(
    "h-[var(--control-h-md)]",
    "px-[var(--space-4)]",
    "py-[var(--space-2)]",
    "text-ui",
    "gap-[var(--space-2)]",
  ),
  lg: cn(
    "h-[var(--control-h-lg)]",
    "px-[var(--space-5)]",
    "py-[var(--space-3)]",
    "text-title",
    "gap-[var(--space-3)]",
  ),
  xl: cn(
    "h-[var(--control-h-xl)]",
    "px-[var(--space-6)]",
    "py-[var(--space-3)]",
    "text-title-lg",
    "gap-[var(--space-4)]",
  ),
};

const SegmentedButton = React.forwardRef<
  HTMLElement,
  SegmentedButtonProps
>(({ as: Comp = "button", isActive, className, type, loading, disabled, href, size = "md", ...props }, ref) => {
  const sizeClasses = SEGMENTED_SIZE_CLASSES[size] ?? SEGMENTED_SIZE_CLASSES.md;
  const cls = cn(
    "btn-like-segmented",
    sizeClasses,
    isActive && "is-active",
    className,
  );
  const typeProp =
    Comp === "button" && (props as React.ButtonHTMLAttributes<HTMLButtonElement>).type === undefined
      ? { type: type ?? "button" }
      : {};
  const isDisabled = disabled || loading;
  const isButton = Comp === "button";
  const isLink = !isButton && (Comp === "a" || href !== undefined);
  return (
    <Comp
      ref={ref as React.Ref<HTMLElement>}
      className={cls}
      data-loading={loading}
      disabled={isButton ? isDisabled : undefined}
      aria-pressed={isButton ? isActive : undefined}
      aria-current={isLink ? (isActive ? "page" : undefined) : undefined}
      href={isLink ? href : undefined}
      {...typeProp}
      {...props}
    />
  );
});

SegmentedButton.displayName = "SegmentedButton";
export default SegmentedButton;
