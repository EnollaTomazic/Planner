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

export function useFloatingStyleClass(fixedStyles?: React.CSSProperties) {
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

  const floatingStyle = React.useMemo(() => {
    if (!hasFixedStyles) {
      return undefined;
    }

    const style: React.CSSProperties = {};

    const assign = (
      property: keyof React.CSSProperties,
      value: string | number | undefined,
      fallback?: string,
    ) => {
      const formatted =
        fallback === undefined
          ? formatCssValue(property, value)
          : withFallback(property, value, fallback);
      if (formatted === undefined) {
        return;
      }
      style[property] = formatted as never;
    };

    assign("position", positionValue, "fixed");
    assign("top", topValue, "auto");
    assign("left", leftValue, "auto");
    assign("transform", transformValue, "none");
    assign("bottom", bottomValue);
    assign("right", rightValue);
    assign("minWidth", minWidthValue);
    assign("maxHeight", maxHeightValue);
    assign("width", widthValue);
    assign("height", heightValue);
    assign("zIndex", zIndexValue);
    assign("transformOrigin", transformOriginValue);

    return style;
  }, [
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

  return {
    floatingStyle,
  } as const;
}
