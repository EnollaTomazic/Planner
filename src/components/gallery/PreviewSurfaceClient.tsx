"use client";

import { useCallback, useState } from "react";

import { cn } from "@/lib/utils";

import PreviewRendererClient from "./PreviewRendererClient";

export const PREVIEW_SURFACE_CONTAINER_CLASSNAME =
  "relative flex w-full items-center justify-center rounded-card r-card-lg border border-card-hairline-60 bg-surface-2/70 p-[var(--space-5)] shadow-[var(--shadow-inset-hairline)]";

function PreviewSurfaceContainer({
  children,
  status,
  className,
  containerSize,
}: {
  readonly children?: React.ReactNode;
  readonly status: "loading" | "loaded";
  readonly className?: string;
  readonly containerSize?: string;
}) {
  return (
    <section
      aria-busy={status === "loading"}
      aria-live={status === "loading" ? "polite" : undefined}
      className={cn(
        PREVIEW_SURFACE_CONTAINER_CLASSNAME,
        "transition-[inline-size] duration-quick ease-out motion-reduce:transition-none",
        containerSize ?? "cq-lg",
        className,
      )}
      data-container-size={containerSize ?? "cq-lg"}
      data-preview-container=""
      data-preview-ready={status}
    >
      {children}
    </section>
  );
}

interface PreviewSurfaceProps {
  readonly previewId: string;
  readonly className?: string;
  readonly containerSize?: string;
}

export default function PreviewSurface({
  previewId,
  className,
  containerSize,
}: PreviewSurfaceProps) {
  const [status, setStatus] = useState<"loading" | "loaded">("loading");

  const handleReady = useCallback(() => {
    setStatus("loaded");
  }, []);

  const handleError = useCallback(() => {
    setStatus("loaded");
  }, []);

  return (
    <PreviewSurfaceContainer
      status={status}
      className={className}
      containerSize={containerSize}
    >
      <PreviewRendererClient
        previewId={previewId}
        onReady={handleReady}
        onError={handleError}
      />
    </PreviewSurfaceContainer>
  );
}
