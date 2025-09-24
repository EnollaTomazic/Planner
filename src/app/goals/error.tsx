"use client";

import { RouteErrorContent, type RouteErrorBoundaryProps } from "../error";

const TITLE = "Goals ran into a snag";
const DESCRIPTION =
  "We couldn't load your goals workspace. Retry to restore your progress.";

export default function GoalsErrorBoundary(props: RouteErrorBoundaryProps) {
  return (
    <RouteErrorContent
      {...props}
      title={TITLE}
      description={DESCRIPTION}
    />
  );
}
