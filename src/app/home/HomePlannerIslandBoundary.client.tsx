"use client";

import * as React from "react";
import type { ReactNode } from "react";
import HomePlannerIsland, {
  type HomePlannerIslandProps,
} from "./HomePlannerIsland.client";

type HomePlannerIslandBoundaryProps = HomePlannerIslandProps & {
  fallback?: ReactNode;
};

export default function HomePlannerIslandBoundary({
  fallback,
  ...islandProps
}: HomePlannerIslandBoundaryProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return fallback ?? null;
  }

  return <HomePlannerIsland {...islandProps} />;
}
