"use client";

import React, { useEffect, useMemo, useState } from "react";

import type { GalleryPreviewRenderer } from "@/components/gallery";

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

export default function PreviewSurface({
  renderer,
}: {
  readonly renderer: GalleryPreviewRenderer;
}) {
  const [status, setStatus] = useState<"loading" | "loaded">("loading");

  const rendered = useMemo(() => renderer(), [renderer]);

  useEffect(() => {
    if (!React.isValidElement(rendered)) {
      setStatus("loaded");
    }
  }, [rendered]);

  let content = rendered;

  if (React.isValidElement(rendered)) {
    const element = rendered as React.ReactElement<{
      onReady?: (...args: unknown[]) => void;
      onError?: (...args: unknown[]) => void;
    }>;
    content = React.cloneElement(element, {
      onReady: (...args: unknown[]) => {
        setStatus("loaded");
        if (typeof element.props.onReady === "function") {
          element.props.onReady(...args);
        }
      },
      onError: (...args: unknown[]) => {
        setStatus("loaded");
        if (typeof element.props.onError === "function") {
          element.props.onError(...args);
        }
      },
    });
  }

  return <PreviewSurfaceContainer status={status}>{content}</PreviewSurfaceContainer>;
}
