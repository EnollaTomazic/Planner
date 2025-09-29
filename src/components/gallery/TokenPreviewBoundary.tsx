"use client";

import * as React from "react";

import { useTokenOverrides } from "./token-overrides-store";

const TOKEN_TO_CSS_VARIABLE: Record<string, readonly string[]> = {
  color: ["--accent"],
  radius: ["--radius-card"],
  shadow: ["--shadow-neo", "--shadow-neo-soft"],
};

function buildCssDeclarations(overrides: ReturnType<typeof useTokenOverrides>) {
  const declarations: string[] = ["display: contents;"];

  for (const [category, token] of Object.entries(overrides)) {
    const variables = TOKEN_TO_CSS_VARIABLE[category as keyof typeof TOKEN_TO_CSS_VARIABLE];
    if (!token || !variables) {
      continue;
    }

    for (const variable of variables) {
      declarations.push(`${variable}: var(${token.cssVar});`);
    }
  }

  return declarations.join(" ");
}

export default function TokenPreviewBoundary({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const overrides = useTokenOverrides();
  const instanceId = React.useId();
  const cssDeclarations = React.useMemo(
    () => buildCssDeclarations(overrides),
    [overrides],
  );

  return (
    <>
      <style jsx global>{`
        [data-token-preview-id="${instanceId}"] {
          ${cssDeclarations}
        }
      `}</style>
      <div data-token-preview-overrides="" data-token-preview-id={instanceId}>
        {children}
      </div>
    </>
  );
}
