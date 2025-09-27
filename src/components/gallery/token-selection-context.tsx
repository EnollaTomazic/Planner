"use client";

import * as React from "react";

import type {
  DesignTokenCategory,
  DesignTokenMeta,
} from "@/lib/design-token-registry";

const CATEGORY_OVERRIDES: ReadonlySet<DesignTokenCategory> = new Set([
  "color",
  "radius",
  "shadow",
]);

export type TokenSelectionMap = Partial<
  Record<DesignTokenCategory, DesignTokenMeta>
>;

interface TokenSelectionContextValue {
  readonly selections: TokenSelectionMap;
  readonly toggleToken: (token: DesignTokenMeta) => void;
}

const TokenSelectionContext =
  React.createContext<TokenSelectionContextValue | null>(null);

export function TokenSelectionProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const [selections, setSelections] = React.useState<TokenSelectionMap>({});

  const toggleToken = React.useCallback((token: DesignTokenMeta) => {
    setSelections((prev) => {
      const current = prev[token.category];
      if (current?.name === token.name) {
        const next = { ...prev };
        delete next[token.category];
        return next;
      }

      return { ...prev, [token.category]: token };
    });
  }, []);

  const value = React.useMemo<TokenSelectionContextValue>(
    () => ({ selections, toggleToken }),
    [selections, toggleToken],
  );

  return (
    <TokenSelectionContext.Provider value={value}>
      {children}
    </TokenSelectionContext.Provider>
  );
}

export function useTokenSelection(): TokenSelectionContextValue {
  const context = React.useContext(TokenSelectionContext);

  if (!context) {
    throw new Error(
      "useTokenSelection must be used within a TokenSelectionProvider",
    );
  }

  return context;
}

const COLOR_OVERRIDE_TARGETS = ["--accent"] as const;
const RADIUS_OVERRIDE_TARGETS = ["--radius-card"] as const;
const SHADOW_OVERRIDE_TARGETS = ["--shadow"] as const;

type StyleRecord = Record<string, string>;

export function useGalleryTokenOverrideStyles(): [
  React.CSSProperties,
  boolean,
] {
  const { selections } = useTokenSelection();

  return React.useMemo(() => {
    const style: StyleRecord = {};

    const colorToken = selections.color;
    if (colorToken) {
      for (const target of COLOR_OVERRIDE_TARGETS) {
        style[target] = colorToken.value;
      }
    }

    const radiusToken = selections.radius;
    if (radiusToken) {
      for (const target of RADIUS_OVERRIDE_TARGETS) {
        style[target] = radiusToken.value;
      }
    }

    const shadowToken = selections.shadow;
    if (shadowToken) {
      for (const target of SHADOW_OVERRIDE_TARGETS) {
        style[target] = shadowToken.value;
      }
    }

    const hasOverrides = Object.keys(style).length > 0;

    const cssProperties = style as unknown as React.CSSProperties;

    return [cssProperties, hasOverrides];
  }, [selections.color, selections.radius, selections.shadow]);
}

export function GalleryTokenOverrideBoundary({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const [style, hasOverrides] = useGalleryTokenOverrideStyles();
  const appliedStyle = React.useMemo<React.CSSProperties>(
    () => ({ display: "contents", ...style }),
    [style],
  );

  return (
    <div
      style={appliedStyle}
      data-token-preview={hasOverrides ? "override" : undefined}
    >
      {children}
    </div>
  );
}

export function isTokenCategoryOverridable(
  category: DesignTokenCategory,
): boolean {
  return CATEGORY_OVERRIDES.has(category);
}
