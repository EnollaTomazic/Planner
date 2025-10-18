"use client";

import { RouteErrorContent, type RouteErrorBoundaryProps } from "../error";

const TITLE = "Team comps misfired";
const DESCRIPTION =
  "The team planner couldn't boot up. Retry to reload your compositions.";

export default function TeamErrorBoundary(props: RouteErrorBoundaryProps) {
  return (
    <RouteErrorContent
      {...props}
      title={TITLE}
      description={DESCRIPTION}
    />
  );
}
