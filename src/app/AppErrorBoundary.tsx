// src/app/AppErrorBoundary.tsx
"use client";

import * as React from "react";

import { ClientErrorBoundary } from "@/components/error/ClientErrorBoundary";
import { RouteErrorContent } from "./error";

type AppErrorBoundaryProps = {
  readonly children: React.ReactNode;
};

export default function AppErrorBoundary({
  children,
}: AppErrorBoundaryProps) {
  return (
    <ClientErrorBoundary
      name="app:root"
      renderFallback={({ error, reset }) => (
        <RouteErrorContent
          error={error}
          reset={reset}
          title="Planner hit a snag"
          description="We ran into an unexpected error while loading the interface. Try again or head back to safety."
          retryLabel="Retry Planner"
          homeLabel="Go home"
        />
      )}
    >
      {children}
    </ClientErrorBoundary>
  );
}
