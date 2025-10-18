"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button, PageShell } from "@/components/ui";
import { createLogger } from "@/lib/logging";
import { reportBoundaryError } from "@/lib/observability/boundary-error-reporter";
import { copyText } from "@/lib/clipboard";
import { withBasePath } from "@/lib/utils";

export type RouteError = Error & { digest?: string };

export type RouteErrorBoundaryProps = {
  error: RouteError;
  reset: () => void;
};

type RouteErrorContentProps = RouteErrorBoundaryProps & {
  title: string;
  description: string;
  retryLabel?: string;
  homeLabel?: string;
  homeHref?: string;
};

const routeErrorLog = createLogger("route:error-boundary");

export function RouteErrorContent({
  error,
  reset,
  title,
  description,
  retryLabel = "Try again",
  homeLabel = "Go to dashboard",
  homeHref = withBasePath("/"),
}: RouteErrorContentProps) {
  const errorId = useMemo(() => {
    if (error?.digest) return error.digest;
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return `fallback-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }, [error]);

  const stackPayload = useMemo(() => {
    const stack = typeof error?.stack === "string" ? error.stack : "";
    const message = error?.message ?? "Unknown error";
    const normalizedStack = stack.includes(message) ? stack : [message, stack].filter(Boolean).join("\n");
    const digestLine = error?.digest ? `Digest: ${error.digest}` : "";
    return [`Planner error ${errorId}`, digestLine, normalizedStack].filter(Boolean).join("\n\n");
  }, [error, errorId]);

  const [copyFeedback, setCopyFeedback] = useState<string>("");

  useEffect(() => {
    reportBoundaryError({
      boundary: "route",
      error,
      extra: {
        digest: error?.digest,
        errorId,
      },
      tags: {
        errorId,
      },
    });
  }, [error, errorId]);

  useEffect(() => {
    if (!copyFeedback) return undefined;
    const timer = window.setTimeout(() => setCopyFeedback(""), 4000);
    return () => window.clearTimeout(timer);
  }, [copyFeedback]);

  const handleCopyStack = useCallback(async () => {
    try {
      await copyText(stackPayload);
      setCopyFeedback("Stack copied to clipboard.");
    } catch (copyError) {
      routeErrorLog.warn("Failed to copy stack trace from route error boundary", copyError);
      setCopyFeedback("We couldn't copy the stack. Select and copy it manually if needed.");
    }
  }, [stackPayload]);

  return (
    <PageShell
      as="section"
      role="alert"
      aria-live="assertive"
      className="py-[var(--space-8)]"
    >
      <div className="flex max-w-prose flex-col gap-[var(--space-4)]">
        <div className="space-y-[var(--space-2)]">
          <h1 className="text-title-lg font-semibold text-foreground">
            {title}
          </h1>
          <p className="text-body text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap gap-[var(--space-3)]">
          <Button variant="default" onClick={reset}>
            {retryLabel}
          </Button>
          <Button asChild variant="quiet">
            <Link href={withBasePath(homeHref)}>{homeLabel}</Link>
          </Button>
          <Button
            type="button"
            variant="quiet"
            size="sm"
            onClick={handleCopyStack}
          >
            Copy stack
          </Button>
        </div>
        <div className="space-y-[var(--space-1)]">
          <p className="text-label text-muted-foreground">
            Reference ID: <span className="font-mono text-foreground">{errorId}</span>
          </p>
          <div className="sr-only" aria-live="polite">
            {copyFeedback}
          </div>
          {copyFeedback ? (
            <p className="text-label text-muted-foreground">{copyFeedback}</p>
          ) : null}
        </div>
      </div>
    </PageShell>
  );
}

export default function RouteErrorBoundary(props: RouteErrorBoundaryProps) {
  return (
    <RouteErrorContent
      {...props}
      title="Something went wrong"
      description="This section hit an error, but the rest of Planner is still running. Try again or return home."
    />
  );
}
