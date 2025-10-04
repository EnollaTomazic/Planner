"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, PageShell } from "@/components/ui";
import { createLogger } from "@/lib/logging";
import { captureException } from "@/lib/observability/sentry";
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
  useEffect(() => {
    routeErrorLog.error("Route error boundary captured an exception", error);
    void captureException(error, {
      tags: {
        boundary: "route",
      },
      extra: {
        digest: error?.digest,
      },
    });
  }, [error]);

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
            <Link href={homeHref}>{homeLabel}</Link>
          </Button>
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
