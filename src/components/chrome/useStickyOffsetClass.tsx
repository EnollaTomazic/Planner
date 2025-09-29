// src/components/chrome/useStickyOffsetClass.tsx
"use client";

import * as React from "react";

type StickyStyle = React.CSSProperties & Record<string, string>;

type StickyOffsetResult = {
  readonly style: StickyStyle | undefined;
};

export function useStickyOffsetClass(topOffset?: string): StickyOffsetResult {
  const style = React.useMemo(() => {
    if (!topOffset) {
      return undefined;
    }

    return {
      "--page-tabs-top": topOffset,
    } as StickyStyle;
  }, [topOffset]);

  return { style };
}
