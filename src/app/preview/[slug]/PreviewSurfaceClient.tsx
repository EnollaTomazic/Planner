"use client";

import * as React from "react";

import PreviewRendererClient from "@/components/gallery/PreviewRendererClient";

import { previewSurfaceContainerClasses } from "./previewSurfaceStyles";

interface PreviewSurfaceClientProps {
  readonly previewId: string;
}

export default function PreviewSurfaceClient({
  previewId,
}: PreviewSurfaceClientProps) {
  const [status, setStatus] = React.useState<"loading" | "loaded">("loading");
  const handleReady = React.useCallback(() => {
    setStatus("loaded");
  }, []);

  const handleError = React.useCallback(() => {
    setStatus("loaded");
  }, []);

  return (
    <section
      aria-busy={status === "loading"}
      aria-live={status === "loading" ? "polite" : undefined}
      className={previewSurfaceContainerClasses}
      data-preview-ready={status}
    >
      <PreviewRendererClient
        previewId={previewId}
        onReady={handleReady}
        onError={handleError}
      />
    </section>
  );
}
