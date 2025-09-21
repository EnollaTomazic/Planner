"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type SegmentedButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  as?: React.ElementType;
  selected?: boolean;
  /** @deprecated Use `selected` instead. */
  isActive?: boolean;
  href?: string;
  loading?: boolean;
};

const SegmentedButton = React.forwardRef<
  HTMLElement,
  SegmentedButtonProps
>(({ as: Comp = "button", selected, isActive, className, type, loading, disabled, href, ...props }, ref) => {
  const resolvedSelected = selected ?? isActive ?? false;
  const cls = cn("btn-like-segmented", resolvedSelected && "is-active", className);
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
      aria-pressed={isButton ? resolvedSelected : undefined}
      aria-current={isLink ? (resolvedSelected ? "page" : undefined) : undefined}
      href={isLink ? href : undefined}
      {...typeProp}
      {...props}
    />
  );
});

SegmentedButton.displayName = "SegmentedButton";
export default SegmentedButton;
