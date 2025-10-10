// src/lib/observability/error-reporter.ts
// Centralized error reporting for client-side boundaries.

import { createLogger } from "@/lib/logging";
import { captureException } from "./sentry";

const errorReporterLog = createLogger("error-reporter");

type ErrorReporterBoundary = "app" | "route";

export type ErrorReporterOptions = {
  boundary: ErrorReporterBoundary;
  digest?: string;
  componentStack?: string;
  extra?: Record<string, unknown>;
  tags?: Record<string, string>;
};

type ReportableError = Error & { digest?: string };

function buildExtraPayload(
  digest?: string,
  componentStack?: string,
  extra?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  const payload: Record<string, unknown> = {};

  if (digest) {
    payload.digest = digest;
  }

  if (componentStack) {
    payload.componentStack = componentStack;
  }

  if (extra) {
    Object.assign(payload, extra);
  }

  return Object.keys(payload).length > 0 ? payload : undefined;
}

export function reportError(error: ReportableError, options: ErrorReporterOptions): void {
  const { boundary, digest, componentStack, extra, tags } = options;
  const boundaryLog = errorReporterLog.child(boundary);
  const extraPayload = buildExtraPayload(digest ?? error.digest, componentStack, extra);
  const tagPayload = { boundary, ...tags };

  if (extraPayload) {
    boundaryLog.error("Boundary captured an exception", error, extraPayload);
  } else {
    boundaryLog.error("Boundary captured an exception", error);
  }

  void captureException(error, {
    tags: tagPayload,
    extra: extraPayload,
  });
}

