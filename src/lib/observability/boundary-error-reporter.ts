// src/lib/observability/boundary-error-reporter.ts
// Centralized helper for logging and capturing error boundary exceptions.

import { observabilityLogger } from "@/lib/logging";
import { captureException } from "./sentry";

const boundaryLog = observabilityLogger.child("error-boundary");

type BoundaryTags = Record<string, string>;

type BoundaryExtra = Record<string, unknown>;

type BoundaryInfo = Record<string, unknown>;

export type BoundaryErrorReport = {
  boundary: string;
  error: unknown;
  info?: BoundaryInfo;
  tags?: BoundaryTags;
  extra?: BoundaryExtra;
};

export function reportBoundaryError({
  boundary,
  error,
  info,
  tags,
  extra,
}: BoundaryErrorReport): void {
  boundaryLog.error("Error boundary captured an exception", {
    boundary,
    error,
    info,
    tags,
    extra,
  });

  const boundaryTags: BoundaryTags = {
    boundary,
    ...(tags ?? {}),
  };

  const boundaryExtra: BoundaryExtra = {
    boundary,
    ...(extra ?? {}),
  };

  if (info) {
    boundaryExtra.info = info;
  }

  void captureException(error, {
    tags: boundaryTags,
    extra: boundaryExtra,
  });
}
