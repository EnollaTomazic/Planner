"use client";

import * as React from "react";

import {
  getPreviewManifest,
  loadModulePreviews,
} from "./preview-engine";
import { TokenPreviewBoundary } from "./TokenPreviewBoundary";
import type { GalleryPreviewRenderer } from "./registry";

const rendererCache = new Map<string, GalleryPreviewRenderer>();

async function resolveRenderer(previewId: string): Promise<GalleryPreviewRenderer> {
  const cached = rendererCache.get(previewId);
  if (cached) {
    return cached;
  }

  const manifest = getPreviewManifest(previewId);
  if (!manifest) {
    throw new Error(`Gallery preview "${previewId}" is not registered`);
  }

  const previews = await loadModulePreviews(manifest);
  const render = previews.get(previewId);
  if (!render) {
    throw new Error(`Gallery preview "${previewId}" not found in module`);
  }

  rendererCache.set(previewId, render);
  return render;
}

interface PreviewRendererClientProps {
  readonly previewId: string;
  readonly onReady?: () => void;
  readonly onError?: (error: Error) => void;
}

export function PreviewRendererClient({
  previewId,
  onReady,
  onError,
}: PreviewRendererClientProps) {
  const [renderer, setRenderer] = React.useState<GalleryPreviewRenderer | null>(() => {
    return rendererCache.get(previewId) ?? null;
  });
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const cached = rendererCache.get(previewId);
    if (cached) {
      setRenderer(() => cached);
      setError(null);
      onReady?.();
      return undefined;
    }

    let cancelled = false;
    resolveRenderer(previewId)
      .then((resolved) => {
        if (cancelled) {
          return;
        }
        rendererCache.set(previewId, resolved);
        setRenderer(() => resolved);
        setError(null);
        onReady?.();
      })
      .catch((cause) => {
        if (cancelled) {
          return;
        }
        const nextError = cause instanceof Error ? cause : new Error(String(cause));
        setError(nextError);
        onError?.(nextError);
      });

    return () => {
      cancelled = true;
    };
  }, [previewId, onError, onReady]);

  if (error) {
    return (
      <div className="text-label text-danger" role="alert">
        {error.message}
      </div>
    );
  }

  if (!renderer) {
    return null;
  }

  return React.createElement(TokenPreviewBoundary, undefined, renderer());
}
