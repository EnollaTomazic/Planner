"use client";

import * as React from "react";
import { Suspense } from "react";

import PreviewSurface, {
  PREVIEW_SURFACE_CONTAINER_CLASSNAME,
} from "@/components/gallery/PreviewSurfaceClient";
import PreviewThemeClient from "@/components/gallery/PreviewThemeClient";
import {
  getGalleryPreviewAxisSummary,
  type GalleryPreviewRoute,
} from "@/components/gallery";
import { BackgroundPicker, Card, Label, ThemePicker, Spinner } from "@/components/ui";
import { usePersistentState } from "@/lib/db";
import {
  VARIANT_LABELS,
  decodeThemeState,
  type Background,
  type Variant,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

const BACKGROUND_LABELS: Record<Background, string> = {
  0: "Default",
  1: "Alt 1",
  2: "Alt 2",
  3: "VHS",
  4: "Streak",
};

const CONTAINER_OPTIONS = [
  { id: "cq-sm", label: "Compact", width: "≤320px" },
  { id: "cq-md", label: "Comfort", width: "≤768px" },
  { id: "cq-lg", label: "Full", width: "≤1024px" },
] as const;

type ContainerSize = (typeof CONTAINER_OPTIONS)[number]["id"];

type ControlState = {
  variant: Variant;
  bg: Background;
  container: ContainerSize;
};

interface PreviewContentClientProps {
  readonly route: GalleryPreviewRoute;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isContainerSize(value: unknown): value is ContainerSize {
  if (typeof value !== "string") {
    return false;
  }
  return CONTAINER_OPTIONS.some((option) => option.id === value);
}

function PreviewLoadingFallback({ containerSize }: { containerSize: ContainerSize }) {
  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className={cn(
        PREVIEW_SURFACE_CONTAINER_CLASSNAME,
        "transition-[inline-size] duration-quick ease-out motion-reduce:transition-none",
        containerSize,
      )}
      data-container-size={containerSize}
      data-preview-container=""
      data-preview-ready="loading"
    >
      <div
        className="flex items-center gap-[var(--space-2)] text-label text-muted-foreground"
        role="status"
      >
        <Spinner />
        <span>Loading preview…</span>
      </div>
    </section>
  );
}

export default function PreviewContentClient({ route }: PreviewContentClientProps) {
  const controlsHeadingId = React.useId();
  const sliderId = React.useId();
  const sliderDescriptionId = React.useId();
  const sliderStatusId = React.useId();

  const defaultState = React.useMemo<ControlState>(
    () => ({
      variant: route.themeVariant,
      bg: route.themeBackground,
      container: "cq-lg",
    }),
    [route.themeVariant, route.themeBackground],
  );

  const decodeControlState = React.useCallback(
    (value: unknown): ControlState | null => {
      if (!isRecord(value)) {
        return null;
      }

      const themeState = decodeThemeState(value) ?? defaultState;
      const rawContainer = value["container"];
      const container = isContainerSize(rawContainer)
        ? rawContainer
        : defaultState.container;

      return {
        variant: themeState.variant,
        bg: themeState.bg,
        container,
      };
    },
    [defaultState],
  );

  const persistenceOptions = React.useMemo(
    () => ({ decode: decodeControlState }),
    [decodeControlState],
  );

  const [controlState, setControlState] = usePersistentState<ControlState>(
    `preview.controls:${route.slug}`,
    defaultState,
    persistenceOptions,
  );

  const handleVariantChange = React.useCallback(
    (next: Variant) => {
      setControlState((prev) => {
        if (prev.variant === next) {
          return prev;
        }
        return { ...prev, variant: next };
      });
    },
    [setControlState],
  );

  const handleBackgroundChange = React.useCallback(
    (next: Background) => {
      setControlState((prev) => {
        if (prev.bg === next) {
          return prev;
        }
        return { ...prev, bg: next };
      });
    },
    [setControlState],
  );

  const handleContainerChange = React.useCallback(
    (nextIndex: number) => {
      if (!Number.isFinite(nextIndex)) {
        return;
      }
      const clampedIndex = Math.min(
        Math.max(Math.trunc(nextIndex), 0),
        CONTAINER_OPTIONS.length - 1,
      );
      const option = CONTAINER_OPTIONS[clampedIndex];
      setControlState((prev) => {
        if (prev.container === option.id) {
          return prev;
        }
        return { ...prev, container: option.id };
      });
    },
    [setControlState],
  );

  const currentContainerIndex = React.useMemo(() => {
    const index = CONTAINER_OPTIONS.findIndex(
      (option) => option.id === controlState.container,
    );
    if (index >= 0) {
      return index;
    }
    return CONTAINER_OPTIONS.length - 1;
  }, [controlState.container]);

  const currentContainer = CONTAINER_OPTIONS[currentContainerIndex];
  const containerProgress =
    CONTAINER_OPTIONS.length > 1
      ? (currentContainerIndex / (CONTAINER_OPTIONS.length - 1)) * 100
      : 0;

  const themeLabel = VARIANT_LABELS[controlState.variant];
  const backgroundLabel = BACKGROUND_LABELS[controlState.bg] ?? BACKGROUND_LABELS[0];
  const backgroundSummary =
    controlState.bg === 0 ? "Default background" : `${backgroundLabel} background`;

  const sliderDescribedBy = `${sliderDescriptionId} ${sliderStatusId}`;
  const stateLabel = route.stateName ? ` · ${route.stateName}` : "";
  const axisSummary = React.useMemo(
    () => getGalleryPreviewAxisSummary(route.entryId, route.stateId),
    [route.entryId, route.stateId],
  );

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      data-preview-entry={route.entryId}
      data-preview-slug={route.slug}
      data-preview-state={route.stateId ?? undefined}
    >
      <PreviewThemeClient
        variant={controlState.variant}
        background={controlState.bg}
      />
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-[var(--space-5)] px-[var(--space-5)] py-[var(--space-6)]">
        <header className="space-y-[var(--space-2)]">
          <p className="text-caption font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Gallery preview
          </p>
          <h1 className="text-title font-semibold tracking-[-0.01em]">
            {route.entryName}
            {stateLabel ? <span className="text-muted-foreground">{stateLabel}</span> : null}
          </h1>
          <p aria-live="polite" className="text-label text-muted-foreground">
            {themeLabel} · {backgroundSummary}
          </p>
          {axisSummary ? (
            <p className="text-caption text-muted-foreground">{axisSummary}</p>
          ) : null}
        </header>

        <section aria-labelledby={controlsHeadingId} className="space-y-[var(--space-3)]">
          <h2
            id={controlsHeadingId}
            className="text-caption font-semibold uppercase tracking-[0.2em] text-muted-foreground"
          >
            Preview controls
          </h2>
          <Card className="bg-surface/75 border border-card-hairline-55 shadow-outline-subtle backdrop-blur-sm">
            <div className="flex flex-col gap-[var(--space-4)]">
              <div className="grid gap-[var(--space-3)] md:grid-cols-2">
                <ThemePicker
                  variant={controlState.variant}
                  onVariantChange={handleVariantChange}
                  className="w-full"
                />
                <BackgroundPicker
                  bg={controlState.bg}
                  onBgChange={handleBackgroundChange}
                  className="w-full"
                />
              </div>

              <div className="space-y-[var(--space-2)]">
                <Label htmlFor={sliderId}>Container width</Label>
                <p
                  id={sliderDescriptionId}
                  className="text-caption text-muted-foreground"
                >
                  Snap the preview to the small, medium, or large container query breakpoints.
                </p>
                <div className="group/slider relative mt-[var(--space-1)] h-[var(--space-6)]">
                  <div
                    className="pointer-events-none absolute left-0 right-0 top-1/2 h-[var(--space-1)] -translate-y-1/2 rounded-full bg-card-hairline-45 shadow-[var(--shadow-inset-hairline)]"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute left-0 top-1/2 h-[var(--space-1)] -translate-y-1/2 rounded-full bg-accent/60 shadow-[var(--shadow-glow-sm)] transition-[width] duration-quick ease-out motion-reduce:transition-none"
                    style={{ width: `${containerProgress}%` }}
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute top-1/2 size-[var(--space-5)] -translate-y-1/2 -translate-x-1/2 rounded-full border border-card-hairline-60 bg-card/90 shadow-[var(--shadow-control)] transition-[left] duration-quick ease-out motion-reduce:transition-none group-focus-visible/slider:ring-2 group-focus-visible/slider:ring-[var(--ring-contrast)] group-focus-visible/slider:shadow-[var(--shadow-glow-md)]"
                    style={{ left: `${containerProgress}%` }}
                    aria-hidden
                  />
                  <input
                    id={sliderId}
                    type="range"
                    min={0}
                    max={CONTAINER_OPTIONS.length - 1}
                    step={1}
                    value={currentContainerIndex}
                    aria-valuetext={`${currentContainer.label} width (${currentContainer.width})`}
                    aria-describedby={sliderDescribedBy}
                    onChange={(event) => {
                      const nextValue = Number(event.target.value);
                      handleContainerChange(nextValue);
                    }}
                    className="absolute inset-0 z-10 h-full w-full cursor-pointer appearance-none rounded-[var(--control-radius)] opacity-0 focus-visible:outline-none"
                  />
                </div>
                <p
                  id={sliderStatusId}
                  aria-live="polite"
                  className="text-caption text-muted-foreground"
                >
                  {currentContainer.label} width · {currentContainer.width}
                </p>
                <div className="flex items-center justify-between text-caption text-muted-foreground" aria-hidden>
                  {CONTAINER_OPTIONS.map((option) => {
                    const selected = option.id === currentContainer.id;
                    return (
                      <span
                        key={option.id}
                        className={cn(
                          "flex-1 text-center",
                          selected && "font-semibold text-foreground",
                        )}
                      >
                        {option.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        </section>

        <div className="flex flex-1 items-center justify-center">
          <Suspense fallback={<PreviewLoadingFallback containerSize={controlState.container} />}>
            <PreviewSurface
              previewId={route.previewId}
              containerSize={controlState.container}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
