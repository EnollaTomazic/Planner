"use client";

import { useCallback, useState } from "react";

import { cn } from "@/lib/utils";

import { PREVIEW_SURFACE_CONTAINER_CLASSNAME } from "@/components/gallery/constants";
import { PreviewRendererClient } from "./PreviewRendererClient";

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
        "transition-[inline-size] duration-motion-sm ease-out motion-reduce:transition-none",
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

export function PreviewSurface({
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
