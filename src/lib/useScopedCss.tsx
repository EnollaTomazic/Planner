import * as React from "react";

export interface UseScopedCssOptions {
  readonly attribute?: string;
  readonly generator: (
    scopeSelector: string,
    scopeValue: string,
  ) => string | null | undefined;
}

export function useScopedCss({
  attribute = "data-scope-id",
  generator,
}: UseScopedCssOptions) {
  const reactId = React.useId();
  const scopeValue = React.useMemo(
    () => reactId.replace(/[:]/g, "_"),
    [reactId],
  );

  const scopeSelector = React.useMemo(
    () => `[${attribute}="${scopeValue}"]`,
    [attribute, scopeValue],
  );

  const cssRules = React.useMemo(() => {
    const rules = generator(scopeSelector, scopeValue);
    if (!rules) {
      return null;
    }

    const trimmed = rules.trim();
    return trimmed.length > 0 ? trimmed : null;
  }, [generator, scopeSelector, scopeValue]);

  const styleElement = React.useMemo(() => {
    if (!cssRules) {
      return null;
    }

    return <style jsx global>{cssRules}</style>;
  }, [cssRules]);

  return {
    scopeAttribute: attribute,
    scopeSelector,
    scopeValue,
    styles: styleElement,
  } as const;
}
