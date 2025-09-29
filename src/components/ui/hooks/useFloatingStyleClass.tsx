"use client";

import * as React from "react";

const DIMENSION_PROPERTIES = new Set<keyof React.CSSProperties>([
  "top",
  "bottom",
  "left",
  "right",
  "minWidth",
  "maxHeight",
  "width",
  "height",
]);

const KEBAB_CACHE = new Map<string, string>();

function toKebabCase(property: string) {
  const cached = KEBAB_CACHE.get(property);
  if (cached) return cached;

  const kebab = property.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  KEBAB_CACHE.set(property, kebab);
  return kebab;
}

function formatCssValue(
  property: keyof React.CSSProperties,
  value: string | number | undefined | null,
) {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "number") {
    if (DIMENSION_PROPERTIES.has(property)) {
      return `${value}px`;
    }

    return `${value}`;
  }

  return value;
}

function withFallback(
  property: keyof React.CSSProperties,
  value: string | number | undefined,
  fallback: string,
) {
  const resolved = value ?? fallback;
  return formatCssValue(property, resolved);
}

function createDeclaration(
  property: keyof React.CSSProperties,
  value: string | number | undefined,
) {
  const formatted = formatCssValue(property, value);
  if (!formatted) return null;

  return `  ${toKebabCase(property)}: ${formatted};`;
}

function createDeclarationWithFallback(
  property: keyof React.CSSProperties,
  value: string | number | undefined,
  fallback: string,
) {
  const formatted = withFallback(property, value, fallback);
  if (!formatted) return null;

  return `  ${toKebabCase(property)}: ${formatted};`;
}

export function useFloatingStyleClass(fixedStyles?: React.CSSProperties) {
  const reactId = React.useId();
  const floatingId = React.useMemo(
    () => reactId.replace(/[:]/g, "_"),
    [reactId],
  );

  const positionValue = fixedStyles?.position;
  const topValue = fixedStyles?.top;
  const leftValue = fixedStyles?.left;
  const transformValue = fixedStyles?.transform;
  const bottomValue = fixedStyles?.bottom;
  const rightValue = fixedStyles?.right;
  const minWidthValue = fixedStyles?.minWidth;
  const maxHeightValue = fixedStyles?.maxHeight;
  const widthValue = fixedStyles?.width;
  const heightValue = fixedStyles?.height;
  const zIndexValue = fixedStyles?.zIndex;
  const transformOriginValue = fixedStyles?.transformOrigin;
  const hasFixedStyles = Boolean(fixedStyles);

  const styleRules = React.useMemo(() => {
    if (!hasFixedStyles) return null;

    const declarations: string[] = [];

    const position = createDeclarationWithFallback(
      "position",
      positionValue,
      "fixed",
    );
    const top = createDeclarationWithFallback("top", topValue, "auto");
    const left = createDeclarationWithFallback(
      "left",
      leftValue,
      "auto",
    );
    const transform = createDeclarationWithFallback(
      "transform",
      transformValue,
      "none",
    );

    if (position) declarations.push(position);
    if (top) declarations.push(top);
    if (left) declarations.push(left);
    if (transform) declarations.push(transform);

    const bottom = createDeclaration("bottom", bottomValue);
    if (bottom) declarations.push(bottom);

    const right = createDeclaration("right", rightValue);
    if (right) declarations.push(right);

    const minWidth = createDeclaration("minWidth", minWidthValue);
    if (minWidth) declarations.push(minWidth);

    const maxHeight = createDeclaration("maxHeight", maxHeightValue);
    if (maxHeight) declarations.push(maxHeight);

    const width = createDeclaration("width", widthValue);
    if (width) declarations.push(width);

    const height = createDeclaration("height", heightValue);
    if (height) declarations.push(height);

    const zIndex = createDeclaration("zIndex", zIndexValue);
    if (zIndex) declarations.push(zIndex);

    const transformOrigin = createDeclaration(
      "transformOrigin",
      transformOriginValue,
    );
    if (transformOrigin) declarations.push(transformOrigin);

    if (declarations.length === 0) {
      return null;
    }

    return `\n[data-floating-id="${floatingId}"] {\n${declarations.join("\n")}\n}`;
  }, [
    floatingId,
    hasFixedStyles,
    positionValue,
    topValue,
    leftValue,
    transformValue,
    bottomValue,
    rightValue,
    minWidthValue,
    maxHeightValue,
    widthValue,
    heightValue,
    zIndexValue,
    transformOriginValue,
  ]);

  const styleElement = React.useMemo(() => {
    if (!styleRules) return null;

    return <style jsx global>{styleRules}</style>;
  }, [styleRules]);

  return {
    floatingId: hasFixedStyles ? floatingId : undefined,
    floatingStyles: styleElement,
  } as const;
}
