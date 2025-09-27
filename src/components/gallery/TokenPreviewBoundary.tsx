"use client";

import * as React from "react";

import { useTokenOverrides } from "./token-overrides-store";

const TOKEN_TO_CSS_VARIABLE: Record<string, readonly string[]> = {
  color: ["--accent"],
  radius: ["--radius-card"],
  shadow: ["--shadow-neo", "--shadow-neo-soft"],
};

function buildStyle(overrides: ReturnType<typeof useTokenOverrides>) {
  const style: React.CSSProperties = { display: "contents" };
  const styleRecord = style as Record<string, string>;

  for (const [category, token] of Object.entries(overrides)) {
    const variables = TOKEN_TO_CSS_VARIABLE[category as keyof typeof TOKEN_TO_CSS_VARIABLE];
    if (!token || !variables) {
      continue;
    }

    for (const variable of variables) {
      styleRecord[variable] = `var(${token.cssVar})`;
    }
  }

  return style;
}

export default function TokenPreviewBoundary({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const overrides = useTokenOverrides();
  const style = React.useMemo(() => buildStyle(overrides), [overrides]);

  return (
    <div data-token-preview-overrides="" style={style}>
      {children}
    </div>
  );
}
