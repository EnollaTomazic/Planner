// src/components/chrome/useStickyOffsetClass.tsx
"use client";

import * as React from "react";

const DATA_ID_PREFIX = "page-tabs";

const sanitizeReactId = (value: string): string =>
  value.replace(/[^a-zA-Z0-9_-]/g, "");

export function useStickyOffsetClass(topOffset?: string) {
  const reactId = React.useId();
  const stickyId = React.useMemo(
    () => `${DATA_ID_PREFIX}-${sanitizeReactId(reactId)}`,
    [reactId],
  );

  const style = React.useMemo(() => {
    if (!topOffset) {
      return null;
    }

    return (
      <style jsx global>{`
        [data-page-tabs-id="${stickyId}"] {
          --page-tabs-top: ${topOffset};
        }

        [data-sticky="true"][data-page-tabs-id="${stickyId}"] {
          top: var(--page-tabs-top);
        }
      `}</style>
    );
  }, [stickyId, topOffset]);

  return [topOffset ? stickyId : undefined, style] as const;
}
