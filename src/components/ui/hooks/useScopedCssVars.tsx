"use client";

import * as React from "react";

interface UseScopedCssVarsOptions {
  readonly attribute: `data-${string}`;
  readonly vars: Record<string, string | number>;
  readonly enabled?: boolean;
}

interface UseScopedCssVarsResult {
  readonly scopeProps: Record<string, string> | undefined;
  readonly Style: JSX.Element | null;
}

function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, "");
}

function formatDeclarations(vars: Record<string, string | number>): string {
  return Object.entries(vars)
    .map(([name, value]) => `${name}: ${String(value)};`)
    .join(" ");
}

export function useScopedCssVars({
  attribute,
  vars,
  enabled = true,
}: UseScopedCssVarsOptions): UseScopedCssVarsResult {
  const reactId = React.useId();
  const scopeValue = React.useMemo(
    () => `scoped-${sanitizeId(reactId)}`,
    [reactId],
  );

  const scopeProps = React.useMemo(() => {
    if (!enabled) return undefined;
    return { [attribute]: scopeValue } as Record<string, string>;
  }, [attribute, enabled, scopeValue]);

  const styleRules = React.useMemo(() => {
    if (!enabled) return "";
    const declarations = formatDeclarations(vars);
    if (!declarations) return "";
    return `[${attribute}="${scopeValue}"] { ${declarations} }`;
  }, [attribute, enabled, scopeValue, vars]);

  const Style = React.useMemo(() => {
    if (!styleRules) return null;
    return <style jsx global>{styleRules}</style>;
  }, [styleRules]);

  return React.useMemo(
    () => ({
      scopeProps,
      Style,
    }),
    [scopeProps, Style],
  );
}
