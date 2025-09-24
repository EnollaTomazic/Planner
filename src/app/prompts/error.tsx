"use client";

import { RouteErrorContent, type RouteErrorBoundaryProps } from "../error";

const TITLE = "Prompts couldn't load";
const DESCRIPTION =
  "The prompt library fizzled out. Refresh to get your saved ideas back.";

export default function PromptsErrorBoundary(props: RouteErrorBoundaryProps) {
  return (
    <RouteErrorContent
      {...props}
      title={TITLE}
      description={DESCRIPTION}
    />
  );
}
