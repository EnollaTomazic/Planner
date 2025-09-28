"use client";

import * as React from "react";
import { getBasePath, withBasePath as resolveWithBasePath } from "@/lib/utils";

type BasePathHelpers = {
  readonly basePath: string;
  readonly withBasePath: (path: string) => string;
};

export default function useBasePath(): BasePathHelpers {
  const basePath = React.useMemo(() => getBasePath(), []);

  const prefixWithBasePath = React.useCallback((path: string) => {
    return resolveWithBasePath(path);
  }, []);

  return React.useMemo(
    () => ({
      basePath,
      withBasePath: prefixWithBasePath,
    }),
    [basePath, prefixWithBasePath],
  );
}
