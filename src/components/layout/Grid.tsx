import * as React from "react";

import { cn } from "@/lib/utils";

import styles from "./Grid.module.css";
import {
  getSpacingValue,
  mergeStyleVars,
  type LayoutElement,
  type SpacingToken,
} from "./shared";

export type GridTemplateCell<T extends string> = T | ".";
export type GridTemplateRow<T extends string> = readonly GridTemplateCell<T>[];
export type GridTemplate<T extends string> = readonly GridTemplateRow<T>[];

export type GridCollapseMode = "stack" | "none";

type GridOwnProps<TAreas extends string, TElement extends LayoutElement> = {
  as?: TElement;
  className?: string;
  style?: React.CSSProperties;
  /** Mapping of grid area name to the rendered node. */
  areas: Partial<Record<TAreas, React.ReactNode>>;
  /** Named template area definition. */
  template: GridTemplate<TAreas>;
  /** Gap between rows and columns, defaults to the layout spacing token. */
  gap?: SpacingToken;
  /** Overrides the row gap while preserving the column gap. */
  rowGap?: SpacingToken;
  /** Overrides the column gap while preserving the row gap. */
  columnGap?: SpacingToken;
  /** Custom value for `grid-template-columns`. */
  columns?: React.CSSProperties["gridTemplateColumns"];
  /** Custom value for `grid-template-rows`. */
  rows?: React.CSSProperties["gridTemplateRows"];
  /** Custom value for `grid-auto-flow`. */
  flow?: React.CSSProperties["gridAutoFlow"];
  /** Aligns items inside the grid. */
  alignItems?: React.CSSProperties["alignItems"];
  /** Aligns columns horizontally. */
  justifyItems?: React.CSSProperties["justifyItems"];
  /**
   * Collapse the template into a single column when the container width drops
   * below this measurement. Defaults to `64ch`.
   */
  collapseBelow?: string;
  /** Switches responsive collapse behaviour off when set to `"none"`. */
  collapse?: GridCollapseMode;
  children?: React.ReactNode;
};

export type GridProps<
  TAreas extends string,
  TElement extends LayoutElement = "div",
> = GridOwnProps<TAreas, TElement> &
  Omit<React.ComponentPropsWithoutRef<TElement>, keyof GridOwnProps<TAreas, TElement>>;

function formatTemplate<TAreas extends string>(
  template: GridTemplate<TAreas>,
): string {
  return template.map((row) => `"${row.join(" ")}"`).join(" ");
}

function collectTemplateAreas<TAreas extends string>(
  template: GridTemplate<TAreas>,
): TAreas[] {
  const seen = new Set<TAreas>();
  const order: TAreas[] = [];
  template.forEach((row) => {
    row.forEach((cell) => {
      if (cell === ".") {
        return;
      }
      if (!seen.has(cell)) {
        seen.add(cell);
        order.push(cell);
      }
    });
  });
  return order;
}

export default function Grid<
  TAreas extends string,
  TElement extends LayoutElement = "div",
>({
  as,
  className,
  style,
  areas,
  template,
  gap,
  rowGap,
  columnGap,
  columns,
  rows,
  flow,
  alignItems,
  justifyItems,
  collapseBelow,
  collapse = "stack",
  children,
  ...rest
}: GridProps<TAreas, TElement>) {
  const Component = (as ?? "div") as LayoutElement;
  const templateAreas = React.useMemo(
    () => collectTemplateAreas(template),
    [template],
  );

  const gapValue = getSpacingValue(gap);
  const rowGapValue = getSpacingValue(rowGap);
  const columnGapValue = getSpacingValue(columnGap);

  let mergedStyle = mergeStyleVars(style, {
    "--grid-gap": gapValue,
    "--grid-row-gap": rowGapValue,
    "--grid-column-gap": columnGapValue,
    "--grid-collapse": collapseBelow,
  });

  if (alignItems) {
    mergedStyle = { ...(mergedStyle ?? {}), alignItems };
  }

  if (justifyItems) {
    mergedStyle = { ...(mergedStyle ?? {}), justifyItems };
  }

  if (columns) {
    mergedStyle = { ...(mergedStyle ?? {}), gridTemplateColumns: columns };
  }

  if (rows) {
    mergedStyle = { ...(mergedStyle ?? {}), gridTemplateRows: rows };
  }

  if (flow) {
    mergedStyle = { ...(mergedStyle ?? {}), gridAutoFlow: flow };
  }

  const templateString = React.useMemo(
    () => formatTemplate(template),
    [template],
  );

  const areaNodes: React.ReactElement[] = [];

  templateAreas.forEach((key) => {
    const content = areas[key];
    if (content == null) {
      return;
    }
    const definedContent = content as React.ReactNode;
    areaNodes.push(
      <div key={key} style={{ gridArea: key }}>
        {definedContent}
      </div>,
    );
  });

  Object.entries(areas).forEach(([key, content]) => {
    if (content == null || templateAreas.includes(key as TAreas)) {
      return;
    }
    const definedContent = content as React.ReactNode;
    areaNodes.push(
      <div key={key} style={{ gridArea: key }}>
        {definedContent}
      </div>,
    );
  });

  const finalStyle: React.CSSProperties = {
    gridTemplateAreas: templateString,
    ...(mergedStyle ?? {}),
  };

  return (
    <Component
      className={cn(styles.grid, className)}
      style={finalStyle}
      data-collapse={collapse === "none" ? undefined : collapse}
      data-flow={flow === "column" ? "column" : undefined}
      {...rest}
    >
      {areaNodes}
      {children}
    </Component>
  );
}
