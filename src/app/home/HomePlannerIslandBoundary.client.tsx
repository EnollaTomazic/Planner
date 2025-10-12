"use client";

import * as React from "react";
import HomePlannerIsland, {
  type HomePlannerIslandProps,
} from "./HomePlannerIsland.client";

export default function HomePlannerIslandBoundary(
  props: HomePlannerIslandProps,
) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <HomePlannerIsland {...props} />;
}
