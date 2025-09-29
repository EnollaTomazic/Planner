"use client";

import { useCallback, useState } from "react";

import PreviewRendererClient from "./PreviewRendererClient";

function PreviewSurfaceContainer({
  children,
  status,
}: {
  readonly children?: React.ReactNode;
  readonly status: "loading" | "loaded";
}) {
  return (
    <section
      aria-busy={status === "loading"}
      aria-live={status === "loading" ? "polite" : undefined}
      className="relative flex w-full items-center justify-center rounded-card r-card-lg border border-[hsl(var(--card-hairline)/0.6)] bg-[hsl(var(--surface-2)/0.7)] p-[var(--space-5)] shadow-[var(--shadow-inset-hairline)]"
      data-preview-ready={status}
    >
      {children}
    </section>
  );
}

interface PreviewSurfaceProps {
  readonly previewId: string;
}

export default function PreviewSurface({ previewId }: PreviewSurfaceProps) {
  const [status, setStatus] = useState<"loading" | "loaded">("loading");

  const handleReady = useCallback(() => {
    setStatus("loaded");
  }, []);

  const handleError = useCallback(() => {
    setStatus("loaded");
  }, []);

  return (
    <PreviewSurfaceContainer status={status}>
      <PreviewRendererClient
        previewId={previewId}
        onReady={handleReady}
        onError={handleError}
      />
    </PreviewSurfaceContainer>
  );
}
