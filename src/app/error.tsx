"use client";

import { useEffect } from "react";
import type { JSX } from "react";
import { Button, PageShell } from "@/components/ui";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorState({ error, reset }: ErrorProps): JSX.Element {
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
          We lost the thread.
        </p>
        <p className="text-ui text-muted-foreground">
          Something went sideways while loading the home experience. Let’s try that again.
        </p>
      </div>
      <Button variant="primary" size="md" onClick={() => reset()}>
        Retry load
      </Button>
    </PageShell>
  );
}
