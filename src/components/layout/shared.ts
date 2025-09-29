import type React from "react";

export type LayoutElement =
  | "article"
  | "aside"
  | "div"
  | "footer"
  | "header"
  | "main"
  | "nav"
  | "section";

export type SpacingToken =
  | "0"
  | "0-125"
  | "0-25"
  | "0-5"
  | "0-75"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8";

export function getSpacingValue(token?: SpacingToken): string | undefined {
  if (!token) {
    return undefined;
  }
  if (token === "0") {
    return "0px";
  }
  return `var(--spacing-${token})`;
}

export function mergeStyleVars(
  style: React.CSSProperties | undefined,
  vars: Record<string, string | undefined>,
): React.CSSProperties | undefined {
  const entries = Object.entries(vars).filter(
    (entry): entry is [string, string] => Boolean(entry[1]),
  );
  if (entries.length === 0) {
    return style;
  }
  const varStyle = Object.fromEntries(entries) as React.CSSProperties;
  return style ? { ...varStyle, ...style } : varStyle;
}
