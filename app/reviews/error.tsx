"use client";

import { RouteErrorContent, type RouteErrorBoundaryProps } from "../error";

const TITLE = "Reviews hit a bump";
const DESCRIPTION =
  "We couldn't open your review vault. Give it another try to resume editing.";

export default function ReviewsErrorBoundary(props: RouteErrorBoundaryProps) {
  return (
    <RouteErrorContent
      {...props}
      title={TITLE}
      description={DESCRIPTION}
    />
  );
}
