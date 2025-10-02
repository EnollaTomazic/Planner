"use client";

import * as React from "react";

import { Button } from "@/components/ui";
import { AIAbortButton, AIErrorCard, AILoadingShimmer } from "@/components/ui/ai";

export default function AIPreviewClient() {
  const [busy, setBusy] = React.useState(true);
  const [showError, setShowError] = React.useState(false);

  const handleAbort = React.useCallback(() => {
    setBusy(false);
    setShowError(true);
  }, []);

  const handleRetry = React.useCallback(() => {
    setBusy(true);
    setShowError(false);
  }, []);

  return (
    <div className="space-y-[var(--space-4)]">
      <AILoadingShimmer
        lines={4}
        label={busy ? "Generating response…" : "Stream paused"}
        className="border border-card-hairline/50 bg-card/55"
      >
        <div className="flex flex-wrap items-center gap-[var(--space-2)]">
          <AIAbortButton onAbort={handleAbort} busy={busy} />
          <Button
            type="button"
            size="sm"
            variant="quiet"
            onClick={() => setBusy((prev) => !prev)}
            className="px-[var(--space-3)]"
          >
            {busy ? "Pause preview" : "Resume preview"}
          </Button>
        </div>
      </AILoadingShimmer>

      {showError ? (
        <AIErrorCard
          description="The assistant stopped before completing the draft."
          hint="Retry to request a fresh response."
          onRetry={handleRetry}
        />
      ) : null}
    </div>
  );
}
