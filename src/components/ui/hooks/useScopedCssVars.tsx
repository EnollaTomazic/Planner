"use client";

import * as React from "react";

interface UseScopedCssVarsOptions {
  readonly attribute: `data-${string}`;
  readonly vars: Record<string, string | number>;
  readonly enabled?: boolean;
}

type CssVarStyle = React.CSSProperties & Record<string, string>;

interface UseScopedCssVarsResult {
  readonly scopeProps: Record<string, string> | undefined;
  readonly style: CssVarStyle | undefined;
}

export function useScopedCssVars({
  attribute,
  vars,
  enabled = true,
}: UseScopedCssVarsOptions): UseScopedCssVarsResult {
  const scopeProps = React.useMemo(() => {
    if (!enabled) return undefined;
    return { [attribute]: "" } as Record<string, string>;
  }, [attribute, enabled]);

  const style = React.useMemo(() => {
    if (!enabled) return undefined;
    const entries = Object.entries(vars);
    if (entries.length === 0) return undefined;

    const cssVars: CssVarStyle = {} as CssVarStyle;
    for (const [name, value] of entries) {
      cssVars[name] = String(value);
    }
    return cssVars;
  }, [enabled, vars]);

  return React.useMemo(
    () => ({
      scopeProps,
      style,
    }),
    [scopeProps, style],
  );
}
