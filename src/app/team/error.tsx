"use client";

import { useEffect } from "react";
import type { JSX } from "react";
import { Button, PageShell } from "@/components/ui";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function TeamError({ error, reset }: ErrorProps): JSX.Element {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageShell
      as="main"
      role="alert"
      aria-live="assertive"
      className="flex min-h-[calc(var(--space-8)*5)] flex-col items-center justify-center gap-[var(--space-4)] py-[var(--space-8)] text-center"
    >
      <div className="space-y-[var(--space-3)]">
        <p className="text-title font-semibold tracking-[-0.01em] text-foreground">
          Team roster failed to load.
        </p>
        <p className="text-ui text-muted-foreground">
          Give the page a quick refresh to bring back the roster and highlight reels.
        </p>
      </div>
      <Button variant="primary" size="md" onClick={() => reset()}>
        Retry team page
      </Button>
    </PageShell>
  );
}
