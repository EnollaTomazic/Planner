import * as React from "react";
import { withBasePath } from "@/lib/utils";

type BasePathResolvers = {
  basePath: string;
  resolveHref: (href: string) => string;
  resolveAsset: (path: string) => string;
};

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const resolveWithBasePath = (value: string): string => withBasePath(value);

export function useBasePath(): BasePathResolvers {
  const basePath = React.useMemo(() => BASE_PATH, []);

  const resolveHref = React.useCallback(resolveWithBasePath, [basePath]);
  const resolveAsset = React.useCallback(resolveWithBasePath, [basePath]);

  return React.useMemo(
    () => ({
      basePath,
      resolveHref,
      resolveAsset,
    }),
    [basePath, resolveHref, resolveAsset],
  );
}
