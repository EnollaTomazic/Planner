"use client";

import { RouteErrorContent, type RouteErrorBoundaryProps } from "../error";

const TITLE = "Planner is taking a timeout";
const DESCRIPTION =
  "The weekly planner failed to load. Try again to pick up where you left off.";

export default function PlannerErrorBoundary(props: RouteErrorBoundaryProps) {
  return (
    <RouteErrorContent
      {...props}
      title={TITLE}
      description={DESCRIPTION}
    />
  );
}
