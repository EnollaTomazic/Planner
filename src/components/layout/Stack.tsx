import * as React from "react";

import { cn } from "@/lib/utils";

import styles from "./Stack.module.css";
import {
  getSpacingValue,
  mergeStyleVars,
  type LayoutElement,
  type SpacingToken,
} from "./shared";

type StackOwnProps<TElement extends LayoutElement> = {
  as?: TElement;
  className?: string;
  style?: React.CSSProperties;
  gap?: SpacingToken;
  /** Optional larger gap applied once the container exceeds 48rem. */
  largeGap?: SpacingToken;
  align?: React.CSSProperties["alignItems"];
  justify?: React.CSSProperties["justifyContent"];
  children?: React.ReactNode;
};

export type StackProps<TElement extends LayoutElement = "div"> =
  StackOwnProps<TElement> &
    Omit<
      React.ComponentPropsWithoutRef<TElement>,
      keyof StackOwnProps<TElement>
    >;

export function Stack<TElement extends LayoutElement = "div">({
  as,
  className,
  style,
  gap,
  largeGap,
  align,
  justify,
  children,
  ...rest
}: StackProps<TElement>) {
  const Component = (as ?? "div") as LayoutElement;
  const gapValue = getSpacingValue(gap);
  const largeGapValue = getSpacingValue(largeGap);

  let mergedStyle = mergeStyleVars(style, {
    "--stack-gap": gapValue,
    "--stack-gap-lg": largeGapValue,
  });

  if (align) {
    mergedStyle = { ...(mergedStyle ?? {}), alignItems: align };
  }

  if (justify) {
    mergedStyle = { ...(mergedStyle ?? {}), justifyContent: justify };
  }

  return (
    <Component
      className={cn(styles.stack, className)}
      style={mergedStyle}
      {...rest}
    >
      {children}
    </Component>
  );
}
