"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, PageShell } from "@/components/ui";

type RouteError = Error & { digest?: string };

type ErrorBoundaryProps = {
  error: RouteError;
  reset: () => void;
};

export default function RouteErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error(error);
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
          <h1 className="text-display-sm font-semibold text-foreground">
            Something went wrong
          </h1>
          <p className="text-body text-muted-foreground">
            This section hit an error, but the rest of Planner is still running. Try again or return home.
          </p>
        </div>
        <div className="flex flex-wrap gap-[var(--space-3)]">
          <Button variant="primary" onClick={reset}>
            Try again
          </Button>
          <Button asChild variant="ghost">
            <Link href="/">Go to dashboard</Link>
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
