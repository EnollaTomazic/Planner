"use client";

import * as React from "react";

import { useTokenOverrides } from "./token-overrides-store";

const TOKEN_TO_CSS_VARIABLE: Record<string, readonly string[]> = {
  color: ["--accent"],
  radius: ["--radius-card"],
  shadow: ["--shadow-neo", "--shadow-neo-soft"],
};

type PreviewStyle = React.CSSProperties & Record<string, string>;

function buildCssDeclarations(
  overrides: ReturnType<typeof useTokenOverrides>,
): PreviewStyle {
  const declarations: PreviewStyle = { display: "contents" };

  for (const [category, token] of Object.entries(overrides)) {
    const variables = TOKEN_TO_CSS_VARIABLE[category as keyof typeof TOKEN_TO_CSS_VARIABLE];
    if (!token || !variables) {
      continue;
    }

    for (const variable of variables) {
      declarations[variable] = `var(${token.cssVar})`;
    }
  }

  return declarations;
}

export default function TokenPreviewBoundary({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const overrides = useTokenOverrides();
  const cssDeclarations = React.useMemo(
    () => buildCssDeclarations(overrides),
    [overrides],
  );

  return (
    <div data-token-preview-overrides="" style={cssDeclarations}>
      {children}
    </div>
  );
}
