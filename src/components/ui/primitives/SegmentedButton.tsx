"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type SegmentedButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  as?: React.ElementType;
  isActive?: boolean;
  href?: string;
};

const SegmentedButton = React.forwardRef<
  HTMLElement,
  SegmentedButtonProps
>(({ as: Comp = "button", isActive, className, type, ...props }, ref) => {
  const cls = cn("btn-like-segmented", isActive && "is-active", className);
  const typeProp =
    Comp === "button" && (props as React.ButtonHTMLAttributes<HTMLButtonElement>).type === undefined
      ? { type: type ?? "button" }
      : {};
  return <Comp ref={ref as React.Ref<HTMLElement>} className={cls} {...typeProp} {...props} />;
});

SegmentedButton.displayName = "SegmentedButton";
export default SegmentedButton;
