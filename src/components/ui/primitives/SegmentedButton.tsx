"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type SegmentedButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  as?: React.ElementType;
  isActive?: boolean;
  href?: string;
  loading?: boolean;
};

const SegmentedButton = React.forwardRef<
  HTMLElement,
  SegmentedButtonProps
>(({ as: Comp = "button", isActive, className, type, loading, disabled, ...props }, ref) => {
  const cls = cn("btn-like-segmented", isActive && "is-active", className);
  const typeProp =
    Comp === "button" && (props as React.ButtonHTMLAttributes<HTMLButtonElement>).type === undefined
      ? { type: type ?? "button" }
      : {};
  const isDisabled = disabled || loading;
  return (
    <Comp
      ref={ref as React.Ref<HTMLElement>}
      className={cls}
      data-loading={loading}
      disabled={Comp === "button" ? isDisabled : undefined}
      {...typeProp}
      {...props}
    />
  );
});

SegmentedButton.displayName = "SegmentedButton";
export default SegmentedButton;
