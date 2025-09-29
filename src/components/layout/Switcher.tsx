import * as React from "react";

import { cn } from "@/lib/utils";

import styles from "./Switcher.module.css";
import {
  getSpacingValue,
  mergeStyleVars,
  type LayoutElement,
  type SpacingToken,
} from "./shared";

type SwitcherDistribution = "fit" | "fill";

type SwitcherOwnProps<TElement extends LayoutElement> = {
  as?: TElement;
  className?: string;
  style?: React.CSSProperties;
  gap?: SpacingToken;
  align?: React.CSSProperties["alignItems"];
  /** Minimum column width before items wrap to the next row. */
  minItemWidth?: string;
  /** Container width at which the layout switches to columns. */
  threshold?: string;
  /**
   * Controls how tracks fill the available space. `fit` uses `auto-fit`, while
   * `fill` uses `auto-fill` to preserve empty tracks.
   */
  distribution?: SwitcherDistribution;
  children?: React.ReactNode;
};

export type SwitcherProps<TElement extends LayoutElement = "div"> =
  SwitcherOwnProps<TElement> &
    Omit<
      React.ComponentPropsWithoutRef<TElement>,
      keyof SwitcherOwnProps<TElement>
    >;

export default function Switcher<TElement extends LayoutElement = "div">({
  as,
  className,
  style,
  gap,
  align,
  minItemWidth,
  threshold,
  distribution = "fit",
  children,
  ...rest
}: SwitcherProps<TElement>) {
  const Component = (as ?? "div") as LayoutElement;
  const gapValue = getSpacingValue(gap);

  let mergedStyle = mergeStyleVars(style, {
    "--switcher-gap": gapValue,
    "--switcher-align": align,
    "--switcher-min": minItemWidth,
    "--switcher-threshold": threshold,
  });

  if (align) {
    mergedStyle = { ...(mergedStyle ?? {}), alignItems: align };
  }

  return (
    <Component
      className={cn(styles.switcher, className)}
      data-distribution={distribution === "fill" ? "fill" : undefined}
      style={mergedStyle}
      {...rest}
    >
      {children}
    </Component>
  );
}
