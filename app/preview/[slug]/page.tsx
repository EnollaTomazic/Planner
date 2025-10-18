import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import {
  getGalleryPreviewRenderer,
  getGalleryPreviewAxisSummary,
  getGalleryPreviewRoute,
  getGalleryPreviewRoutes,
  type GalleryPreviewRoute,
} from "@/components/gallery";
import PreviewContentClient from "./PreviewContentClient";
import { PreviewThemeClient } from "@/components/gallery/PreviewThemeClient";
import { VARIANT_LABELS } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { readServerEnv } from '@env'

import { PREVIEW_SURFACE_CONTAINER_CLASSNAME } from "@/components/gallery/constants";

const { GITHUB_PAGES, SKIP_PREVIEW_STATIC } = readServerEnv();

const SKIP_PREVIEW_RENDER =
  GITHUB_PAGES === "true" || SKIP_PREVIEW_STATIC === "true";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getGalleryPreviewRoutes().map((route) => ({ slug: route.slug }));
}

interface PreviewPageParams {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PreviewPageParams): Promise<Metadata> {
  const { slug } = await params;
  const route = getGalleryPreviewRoute(slug);
  if (!route) {
    return { title: "Preview not found" };
  }
  const parts = [route.entryName];
  if (route.stateName) {
    parts.push(route.stateName);
  }
  const themeLabel = VARIANT_LABELS[route.themeVariant];
  parts.push(`${themeLabel} theme`);
  return {
    title: parts.join(" · "),
    description: `Gallery preview for ${parts.join(" · ")}.`,
  };
}

function PreviewSurfaceContainer({
  children,
  status,
}: {
  readonly children?: ReactNode;
  readonly status: "loading" | "loaded";
}) {
  return (
    <section
      aria-busy={status === "loading"}
      aria-live={status === "loading" ? "polite" : undefined}
      className={cn(
        PREVIEW_SURFACE_CONTAINER_CLASSNAME,
        "transition-[inline-size] duration-motion-sm ease-out motion-reduce:transition-none",
        "cq-lg",
      )}
      data-container-size="cq-lg"
      data-preview-container=""
      data-preview-ready={status}
    >
      {children}
    </section>
  );
}

interface PreviewContentProps {
  readonly route: GalleryPreviewRoute;
}

export function PreviewContent({ route }: PreviewContentProps) {
  return <PreviewContentClient route={route} />;
}

export function PreviewUnavailable({ route }: { readonly route: GalleryPreviewRoute }) {
  const themeLabel = VARIANT_LABELS[route.themeVariant];
  const stateLabel = route.stateName ?? null;
  const axisSummary = getGalleryPreviewAxisSummary(route.entryId, route.stateId);

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      data-preview-entry={route.entryId}
      data-preview-slug={route.slug}
      data-preview-state={route.stateId ?? undefined}
    >
      <PreviewThemeClient variant={route.themeVariant} background={route.themeBackground} />
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-[var(--space-5)] px-[var(--space-5)] py-[var(--space-6)]">
        <header className="space-y-[var(--space-2)]">
          <p className="text-caption font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Gallery preview
          </p>
          <h1 className="text-title font-semibold tracking-[-0.01em]">
            {route.entryName}
            {stateLabel ? <span className="text-muted-foreground"> · {stateLabel}</span> : null}
          </h1>
          <p className="text-label text-muted-foreground">
            {themeLabel}
            {route.themeBackground > 0 ? ` background ${route.themeBackground}` : " theme"}
          </p>
          {axisSummary ? (
            <p className="text-caption text-muted-foreground">{axisSummary}</p>
          ) : null}
        </header>
        <PreviewSurfaceContainer status="loading">
          <div className="space-y-[var(--space-2)] text-label text-muted-foreground">
            <p>Preview unavailable in the static export.</p>
            <p>Clone the repository and run the development server to view this preview.</p>
          </div>
        </PreviewSurfaceContainer>
      </div>
    </div>
  );
}

export default async function PreviewPage({ params }: PreviewPageParams) {
  const { slug } = await params;
  const route = getGalleryPreviewRoute(slug);
  if (!route) {
    notFound();
  }

  if (!getGalleryPreviewRenderer(route.previewId)) {
    notFound();
  }

  if (SKIP_PREVIEW_RENDER) {
    return <PreviewUnavailable route={route} />;
  }

  return <PreviewContent route={route} />;
}
