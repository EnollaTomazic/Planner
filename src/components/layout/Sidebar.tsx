import * as React from "react";

import { cn } from "@/lib/utils";

import styles from "./Sidebar.module.css";
import {
  getSpacingValue,
  mergeStyleVars,
  type LayoutElement,
  type SpacingToken,
} from "./shared";

type SidebarSide = "start" | "end";

type SidebarOwnProps<TElement extends LayoutElement> = {
  as?: TElement;
  className?: string;
  style?: React.CSSProperties;
  /** Content rendered inside the sidebar pane. */
  sidebar: React.ReactNode;
  gap?: SpacingToken;
  /** Width reserved for the sidebar column on wide layouts. */
  width?: string;
  /** Switches the sidebar column to the opposite edge. */
  side?: SidebarSide;
  /** Container width that triggers the stacked layout. Defaults to `64ch`. */
  collapseBelow?: string;
  /** Overrides the collapsed order independent of `side`. */
  collapseTo?: SidebarSide;
  children?: React.ReactNode;
};

export type SidebarProps<TElement extends LayoutElement = "section"> =
  SidebarOwnProps<TElement> &
    Omit<
      React.ComponentPropsWithoutRef<TElement>,
      keyof SidebarOwnProps<TElement>
    >;

export default function Sidebar<TElement extends LayoutElement = "section">({
  as,
  className,
  style,
  sidebar,
  gap,
  width,
  side = "start",
  collapseBelow,
  collapseTo,
  children,
  ...rest
}: SidebarProps<TElement>) {
  const Component = (as ?? "section") as LayoutElement;
  const gapValue = getSpacingValue(gap);
  const collapseOrder = collapseTo ?? (side === "start" ? "start" : "end");

  const mergedStyle = mergeStyleVars(style, {
    "--sidebar-gap": gapValue,
    "--sidebar-width": width,
    "--sidebar-breakpoint": collapseBelow,
  });

  return (
    <Component
      className={cn(styles.sidebar, className)}
      data-side={side}
      data-collapse={collapseOrder}
      style={mergedStyle}
      {...rest}
    >
      <div className={styles.pane}>{sidebar}</div>
      <div className={styles.content}>{children}</div>
    </Component>
  );
}
