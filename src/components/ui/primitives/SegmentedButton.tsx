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
>(
  (
    {
      as: Comp = "button",
      selected,
      isActive,
      className,
      type,
      loading,
      disabled,
      href,
      onClick,
      tabIndex,
      ...restProps
    },
    ref,
  ) => {
  const resolvedSelected = selected ?? isActive ?? false;
  const cls = cn("btn-like-segmented", resolvedSelected && "is-active", className);
  const typeProp = Comp === "button" ? { type: type ?? "button" } : {};
  const isDisabled = disabled || loading;
  const isButton = Comp === "button";
  const isLink = !isButton && (Comp === "a" || href !== undefined);
  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (isDisabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (onClick) {
        (onClick as React.MouseEventHandler<HTMLElement>)(event);
      }
    },
    [isDisabled, onClick],
  );
  const shouldHandleClick = isDisabled || Boolean(onClick);
  return (
    <Comp
      ref={ref as React.Ref<HTMLElement>}
      className={cls}
      data-loading={loading}
      disabled={isButton ? isDisabled : undefined}
      aria-pressed={isButton ? resolvedSelected : undefined}
      aria-current={isLink ? (resolvedSelected ? "page" : undefined) : undefined}
      {...typeProp}
      {...restProps}
      href={isLink && !isDisabled ? href : undefined}
      aria-disabled={isLink && isDisabled ? true : undefined}
      tabIndex={isLink && isDisabled ? -1 : tabIndex}
      onClick={shouldHandleClick ? handleClick : undefined}
    />
  );
  },
);

SegmentedButton.displayName = "SegmentedButton";
export default SegmentedButton;
