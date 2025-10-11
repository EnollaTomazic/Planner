import * as React from "react";

import { cn } from "@/lib/utils";

import styles from "./Cluster.module.css";
import {
  getSpacingValue,
  mergeStyleVars,
  type LayoutElement,
  type SpacingToken,
} from "./shared";

type ClusterCollapseMode = "stack" | "start" | "none";

type ClusterOwnProps<TElement extends LayoutElement> = {
  as?: TElement;
  className?: string;
  style?: React.CSSProperties;
  gap?: SpacingToken;
  rowGap?: SpacingToken;
  align?: React.CSSProperties["alignItems"];
  justify?: React.CSSProperties["justifyContent"];
  /** Disable wrapping when set to false. */
  wrap?: boolean;
  /** Width threshold for responsive adjustments. Defaults to `40rem`. */
  collapseBelow?: string;
  /** Behaviour when the container width drops below the threshold. */
  collapse?: ClusterCollapseMode;
  children?: React.ReactNode;
};

export type ClusterProps<TElement extends LayoutElement = "div"> =
  ClusterOwnProps<TElement> &
    Omit<
      React.ComponentPropsWithoutRef<TElement>,
      keyof ClusterOwnProps<TElement>
    >;

export function Cluster<TElement extends LayoutElement = "div">({
  as,
  className,
  style,
  gap,
  rowGap,
  align,
  justify,
  wrap = true,
  collapseBelow,
  collapse = "stack",
  children,
  ...rest
}: ClusterProps<TElement>) {
  const Component = (as ?? "div") as LayoutElement;
  const gapValue = getSpacingValue(gap);
  const rowGapValue = getSpacingValue(rowGap);

  let mergedStyle = mergeStyleVars(style, {
    "--cluster-gap": gapValue,
    "--cluster-row-gap": rowGapValue,
    "--cluster-collapse": collapseBelow,
  });

  if (align) {
    mergedStyle = { ...(mergedStyle ?? {}), alignItems: align };
  }

  if (justify) {
    mergedStyle = { ...(mergedStyle ?? {}), justifyContent: justify };
  }

  return (
    <Component
      className={cn(styles.cluster, className)}
      data-nowrap={wrap ? undefined : "true"}
      data-collapse={collapse === "none" ? undefined : collapse}
      style={mergedStyle}
      {...rest}
    >
      {children}
    </Component>
  );
}
