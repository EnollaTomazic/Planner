"use client";

import * as React from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import type { Review } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useReviewFilter } from "@/components/reviews";
import { ReviewList } from "./ReviewList";
import { ReviewEditor } from "./ReviewEditor";
import { ReviewSummary } from "./ReviewSummary";
import { ReviewPanel } from "./ReviewPanel";
import { BookOpen, Ghost, Plus } from "lucide-react";

import {
  Button,
  Hero,
  PageShell,
  Select,
  TabBar,
  Skeleton,
  AIErrorCard,
} from "@/components/ui";

type SortKey = "newest" | "oldest" | "title";
type DetailMode = "summary" | "edit";

export type ReviewsPageProps = {
  reviews: Review[] | null | undefined;
  loading?: boolean;
  error?: Error | string | null;
  onRetry?: (() => void) | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRename: (id: string, nextTitle: string) => void;
  onDelete?: (id: string) => void;
  onChangeNotes?: (id: string, nextNotes: string) => void;
  onChangeTags?: (id: string, nextTags: string[]) => void;
  onChangeMeta?: (id: string, partial: Partial<Review>) => void;
};

export function ReviewsPage({
  reviews,
  loading,
  error = null,
  onRetry = null,
  selectedId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  onChangeNotes,
  onChangeTags,
  onChangeMeta,
}: ReviewsPageProps) {
  const searchParams = useSearchParams();
  const [q, setQ] = React.useState("");
  const [sort, setSort] = React.useState<SortKey>("newest");
  const [detailMode, setDetailMode] = React.useState<DetailMode>("summary");
  const [intentApplied, setIntentApplied] = React.useState(false);

  const isLoading = (loading ?? (typeof reviews === "undefined")) === true;
  const errorMessage = React.useMemo(() => {
    if (error instanceof Error) {
      const message = error.message?.trim();
      if (message?.length) return message;
    }
    if (typeof error === "string") {
      const trimmed = error.trim();
      if (trimmed.length > 0) return trimmed;
    }
    if (error && typeof error !== "object") {
      return String(error);
    }
    if (reviews === null) {
      return "We couldn’t load your reviews.";
    }
    return null;
  }, [error, reviews]);
  const isErrored = Boolean(errorMessage);
  const allowInteractions = !isLoading && !isErrored;

  const commitCreateReview = React.useCallback(() => {
    setQ("");
    setSort("newest");
    setDetailMode("edit");
    onCreate();
  }, [onCreate]);

  const tryCreateReview = React.useCallback(() => {
    if (!allowInteractions) return false;
    commitCreateReview();
    return true;
  }, [allowInteractions, commitCreateReview]);

  const intentParam = searchParams?.get("intent") ?? null;
  React.useEffect(() => {
    if (intentParam === "create-review") {
      if (!intentApplied) {
        const created = tryCreateReview();
        if (created) {
          setIntentApplied(true);
        }
      }
      return;
    }
    if (intentApplied) {
      setIntentApplied(false);
    }
  }, [intentParam, intentApplied, tryCreateReview]);

  const base = React.useMemo<Review[]>(
    () => (Array.isArray(reviews) ? reviews : []),
    [reviews],
  );

  const filtered = useReviewFilter(base, q, sort);
  const totalCount = base.length;
  const listReviews = allowInteractions ? filtered : [];
  const filteredCount = allowInteractions ? filtered.length : 0;
  const hasReviews = allowInteractions && totalCount > 0;

  const active = React.useMemo(
    () => {
      if (!allowInteractions) return null;
      return base.find((r) => r.id === selectedId) ?? null;
    },
    [allowInteractions, base, selectedId],
  );
  const panelClass = "mx-auto";
  const detailBaseId = active ? `review-${active.id}` : "review-detail";
  const heroHeadingId = React.useId();
  const sortLabelId = React.useId();
  const emptySearchDescriptionId = React.useId();
  const emptySearchTooltipId = React.useId();
  const sortItems = React.useMemo(
    () => [
      { value: "newest", label: "Newest" },
      { value: "oldest", label: "Oldest" },
      { value: "title", label: "Title" },
    ],
    [],
  );

  const shouldShowEmptySearchHelper = allowInteractions && totalCount === 0;
  const [isSearchTooltipOpen, setIsSearchTooltipOpen] = React.useState(false);

  const closeSearchTooltip = React.useCallback(() => {
    setIsSearchTooltipOpen(false);
  }, []);

  const openSearchTooltip = React.useCallback(() => {
    if (!shouldShowEmptySearchHelper) return;
    setIsSearchTooltipOpen(true);
  }, [shouldShowEmptySearchHelper]);

  const handleSearchFocus = React.useCallback<
    React.FocusEventHandler<HTMLInputElement>
  >(() => {
    openSearchTooltip();
  }, [openSearchTooltip]);

  const handleSearchBlur = React.useCallback<
    React.FocusEventHandler<HTMLInputElement>
  >(() => {
    closeSearchTooltip();
  }, [closeSearchTooltip]);

  const handleSearchMouseEnter = React.useCallback<
    React.MouseEventHandler<HTMLInputElement>
  >(() => {
    openSearchTooltip();
  }, [openSearchTooltip]);

  const handleSearchMouseLeave = React.useCallback<
    React.MouseEventHandler<HTMLInputElement>
  >((event) => {
      const target = event.currentTarget;
      if (target instanceof HTMLElement && target === document.activeElement) {
        return;
      }
      closeSearchTooltip();
    },
    [closeSearchTooltip],
  );

  const handleSearchKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape" || event.key === "Esc") {
        closeSearchTooltip();
      }
    },
    [closeSearchTooltip],
  );

  React.useEffect(() => {
    if (!shouldShowEmptySearchHelper) {
      setIsSearchTooltipOpen(false);
      return undefined;
    }

    if (!isSearchTooltipOpen) {
      return undefined;
    }

    const handleWindowKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Esc") {
        closeSearchTooltip();
      }
    };

    window.addEventListener("keydown", handleWindowKeyDown);
    return () => window.removeEventListener("keydown", handleWindowKeyDown);
  }, [shouldShowEmptySearchHelper, isSearchTooltipOpen, closeSearchTooltip]);

  const heroSearchLabel = isLoading
    ? "Search reviews (temporarily unavailable)"
    : isErrored
      ? "Search reviews (temporarily unavailable)"
      : !hasReviews
        ? "Search reviews (add a review to search)"
        : "Search reviews";
  const heroSearchDescription = React.useMemo(() => {
    const ids: string[] = [];
    if (shouldShowEmptySearchHelper) {
      ids.push(emptySearchTooltipId);
    }
    if (!hasReviews) {
      ids.push(emptySearchDescriptionId);
    }
    return ids.length > 0 ? ids.join(" ") : undefined;
  }, [shouldShowEmptySearchHelper, emptySearchTooltipId, hasReviews, emptySearchDescriptionId]);
  const heroSearchDisabled = !allowInteractions;
  const heroSearchTooltip = shouldShowEmptySearchHelper ? (
    <div
      id={emptySearchTooltipId}
      role="tooltip"
      className={cn(
        "pointer-events-none absolute left-1/2 top-full z-20 w-max max-w-[min(22rem,calc(100vw-var(--space-6)))] -translate-x-1/2",
        "rounded-[var(--radius-lg)] border border-card-hairline bg-[hsl(var(--surface-2))] px-[var(--space-3)] py-[var(--space-2)]",
        "text-label font-medium text-foreground shadow-depth-soft",
        "transition-[opacity,transform] duration-motion-sm ease-out motion-reduce:transition-none motion-reduce:transform-none",
        isSearchTooltipOpen
          ? "opacity-100 translate-y-[var(--space-2)]"
          : "pointer-events-none opacity-0 -translate-y-[var(--space-1)]",
      )}
      aria-hidden={isSearchTooltipOpen ? undefined : "true"}
    >
      <span className="block text-balance text-center leading-tight">
        Add a review to search.
      </span>
    </div>
  ) : null;

  return (
    <>
      <PageShell
        as="header"
        grid
        aria-labelledby={heroHeadingId}
        className="py-[var(--space-6)]"
      >
        <Hero
          as="section"
          className="col-span-full md:col-span-12"
          topClassName="top-[var(--header-stack)]"
          title={<span id={heroHeadingId}>Reviews</span>}
          subtitle="Capture and learn from your past sprints."
          glitch="default"
          frame
          icon={<BookOpen className="opacity-80" />}
          search={
          {
            value: q,
            onValueChange: setQ,
            placeholder: "Search reviews...",
            "aria-label": heroSearchLabel,
            "aria-describedby": heroSearchDescription,
            height: "lg",
            debounceMs: 300,
            variant: "sunken",
            loading: isLoading,
            disabled: heroSearchDisabled,
            className: shouldShowEmptySearchHelper
              ? "relative"
              : undefined,
            right: heroSearchTooltip ?? undefined,
            onFocus: shouldShowEmptySearchHelper ? handleSearchFocus : undefined,
            onBlur: shouldShowEmptySearchHelper ? handleSearchBlur : undefined,
            onMouseEnter: shouldShowEmptySearchHelper
              ? handleSearchMouseEnter
              : undefined,
            onMouseLeave: shouldShowEmptySearchHelper
              ? handleSearchMouseLeave
              : undefined,
            onKeyDown: shouldShowEmptySearchHelper ? handleSearchKeyDown : undefined,
          }
          }
          actions={
            <Button
              type="button"
              variant="default"
              size="md"
              className={cn("btn-glitch", "whitespace-nowrap")}
              onClick={commitCreateReview}
              disabled={!allowInteractions}
            >
              <Plus />
              <span>New review</span>
            </Button>
          }
          illustration={
            <Image
              src="/images/agnes.svg"
              alt="Agnes watching over review browsing"
              fill
              sizes="(min-width: 1280px) 38vw, (min-width: 768px) 56vw, 100vw"
              priority={false}
              className="object-contain object-right md:object-center"
            />
          }
        />
      </PageShell>

      <PageShell
        as="main"
        id="page-main"
        tabIndex={-1}
        className="py-[var(--space-6)] space-y-[var(--space-6)]"
        aria-labelledby={heroHeadingId}
      >
        {isLoading ? (
          <div className="flex flex-col gap-[var(--space-3)] sm:gap-[var(--space-4)] md:flex-row md:items-end md:justify-end">
            <Skeleton
              ariaHidden={false}
              role="status"
              aria-label="Loading sort control"
              className="h-[var(--control-h-lg)] w-full md:w-[16rem]"
              radius="md"
            />
          </div>
        ) : isErrored ? (
          <div className="space-y-[var(--space-3)]">
            <div className="flex flex-col gap-[var(--space-3)] sm:gap-[var(--space-4)] md:flex-row md:items-end md:justify-end">
              <div
                className="flex w-full flex-col gap-[var(--space-1)] text-left md:w-[16rem]"
                aria-labelledby={sortLabelId}
              >
                <span
                  id={sortLabelId}
                  className="text-ui font-medium text-muted-foreground"
                >
                  Sort
                </span>
                <Select
                  variant="animated"
                  label="Sort reviews"
                  hideLabel
                  value={sort}
                  onChange={(v) => setSort(v as SortKey)}
                  items={sortItems}
                  className="w-full"
                  size="lg"
                  disabled
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-[var(--space-2)]">
              <Button
                type="button"
                variant="default"
                size="md"
                className={cn("btn-glitch", "whitespace-nowrap")}
                onClick={onRetry ?? undefined}
                disabled={!onRetry}
              >
                Retry sync
              </Button>
              <p className="text-ui text-danger" role="alert">
                {errorMessage ?? "We couldn’t load your reviews. Retry to continue."}
              </p>
            </div>
          </div>
        ) : hasReviews ? (
          <div className="flex flex-col gap-[var(--space-3)] sm:gap-[var(--space-4)] md:flex-row md:items-end md:justify-end">
            <div
              className="flex w-full flex-col gap-[var(--space-1)] text-left md:w-[16rem]"
              aria-labelledby={sortLabelId}
            >
              <span
                id={sortLabelId}
                className="text-ui font-medium text-muted-foreground"
              >
                Sort
              </span>
              <Select
                variant="animated"
                label="Sort reviews"
                hideLabel
                value={sort}
                onChange={(v) => setSort(v as SortKey)}
                items={sortItems}
                className="w-full"
                size="lg"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-[var(--space-2)]">
            <p
              id={emptySearchDescriptionId}
              className="text-ui text-muted-foreground"
            >
              Once you publish your first review, smart filters, tagging, and matchup search become available.
            </p>
          </div>
        )}
        <div
          className={cn(
            "grid grid-cols-1 items-start gap-[var(--space-4)] sm:gap-[var(--space-6)] lg:gap-[var(--space-8)] md:grid-cols-6 lg:grid-cols-12",
          )}
        >
          <nav
            aria-label="Review list"
            className="md:col-span-2 lg:col-span-4"
          >
              <ReviewList
                reviews={listReviews}
                selectedId={selectedId}
                loading={isLoading}
                error={errorMessage}
                onRetry={isErrored ? onRetry : null}
                onSelect={
                  allowInteractions
                    ? (id) => {
                        setDetailMode("summary");
                        onSelect(id);
                      }
                    : undefined
                }
                className="h-auto overflow-auto p-[var(--space-2)] md:h-[var(--content-viewport-height)]"
                header={
                  allowInteractions && filteredCount > 0
                    ? `${filteredCount} shown`
                    : undefined
                }
                hasAnyReviews={allowInteractions && totalCount > 0}
                hoverRing
              />
          </nav>
          <div className="md:col-span-4 lg:col-span-8">
            {isLoading ? (
              <ReviewPanel
                aria-busy="true"
                className={cn(panelClass, "space-y-[var(--space-4)]")}
              >
                <div className="space-y-[var(--space-2)]">
                  <Skeleton
                    ariaHidden={false}
                    role="status"
                    aria-label="Loading review summary"
                    className="h-[var(--space-6)] w-2/3"
                    radius="sm"
                  />
                  <Skeleton className="w-3/4" />
                </div>
                <div className="grid gap-[var(--space-3)] sm:grid-cols-[var(--space-12)_1fr]">
                  <Skeleton
                    ariaHidden={false}
                    role="status"
                    aria-label="Loading review avatar"
                    className="h-[var(--space-12)] w-[var(--space-12)]"
                    radius="full"
                  />
                  <div className="space-y-[var(--space-2)]">
                    <Skeleton className="w-2/3" />
                    <Skeleton className="w-3/4" />
                    <Skeleton className="w-full" />
                  </div>
                </div>
                <Skeleton
                  ariaHidden={false}
                  role="status"
                  aria-label="Loading review actions"
                  className="h-[var(--space-10)] w-full"
                  radius="sm"
                />
              </ReviewPanel>
            ) : isErrored ? (
              <ReviewPanel aria-live="polite" className={panelClass}>
                <AIErrorCard
                  title="Review detail unavailable"
                  description={errorMessage ?? "We couldn’t load your review details."}
                  hint="Retry the sync to continue editing or summarizing your matches."
                  retryLabel="Retry sync"
                  onRetry={onRetry ?? undefined}
                  className="w-full border-none bg-transparent p-0 shadow-none"
                />
              </ReviewPanel>
            ) : !hasReviews ? (
              <ReviewPanel
                aria-live="polite"
                className={cn(
                  panelClass,
                  "relative flex flex-col items-center justify-center gap-[var(--space-4)] overflow-hidden",
                  "text-center text-ui text-muted-foreground",
                )}
              >
                <span
                  aria-hidden
                  className="glitch-rail pointer-events-none absolute inset-y-[var(--space-2)] left-1/2 hidden w-[var(--spacing-1)] -translate-x-1/2 rounded-full opacity-80 mix-blend-screen sm:block"
                />
                <span
                  aria-hidden
                  data-text=""
                  className="glitch-anim inline-flex items-center justify-center rounded-full border border-border/40 bg-card/70 p-[var(--space-3)] text-muted-foreground motion-reduce:animate-none"
                >
                  <BookOpen
                    aria-hidden
                    focusable="false"
                    className="size-[var(--space-6)]"
                  />
                </span>
                <div className="space-y-[var(--space-1)]">
                  <p className="text-card-foreground">You&rsquo;re ready to capture your first review.</p>
                  <p>
                    Log a match recap to unlock summaries, tagging, and focus tracking.
                    Use the New review button above to begin.
                  </p>
                </div>
              </ReviewPanel>
            ) : !active ? (
              <ReviewPanel
                aria-live="polite"
                className={cn(
                  panelClass,
                  "relative flex flex-col items-center justify-center gap-[var(--space-3)] overflow-hidden",
                  "text-center text-ui text-muted-foreground",
                )}
              >
                <span
                  aria-hidden
                  className="glitch-rail pointer-events-none absolute inset-y-[var(--space-2)] left-1/2 hidden w-[var(--spacing-1)] -translate-x-1/2 rounded-full opacity-80 mix-blend-screen sm:block"
                />
                <span
                  aria-hidden
                  data-text=""
                  className="glitch-anim inline-flex items-center justify-center rounded-full border border-border/40 bg-card/70 p-[var(--space-3)] text-muted-foreground motion-reduce:animate-none"
                >
                  <Ghost
                    aria-hidden
                    focusable="false"
                    className="size-[var(--space-6)]"
                  />
                </span>
                <div className="space-y-[var(--space-1)]">
                  <p className="text-card-foreground">Select a review from the list to see its summary.</p>
                  <p>Use New review to document another match when you&rsquo;re ready.</p>
                </div>
              </ReviewPanel>
            ) : (
              <div className="space-y-[var(--space-4)]">
                <TabBar<DetailMode>
                  items={[
                    { key: "summary", label: "Summary" },
                    { key: "edit", label: "Edit" },
                  ]}
                  value={detailMode}
                  onValueChange={setDetailMode}
                  ariaLabel="Review detail mode"
                  idBase={detailBaseId}
                />
                <div
                  id={`${detailBaseId}-summary-panel`}
                  role="tabpanel"
                  aria-labelledby={`${detailBaseId}-summary-tab`}
                  hidden={detailMode !== "summary"}
                  tabIndex={detailMode === "summary" ? 0 : -1}
                >
                  {detailMode === "summary" ? (
                    <ReviewPanel className={panelClass}>
                      <ReviewSummary
                        key={`summary-${active.id}`}
                        review={active}
                        onEdit={() => setDetailMode("edit")}
                      />
                    </ReviewPanel>
                  ) : null}
                </div>
                <div
                  id={`${detailBaseId}-edit-panel`}
                  role="tabpanel"
                  aria-labelledby={`${detailBaseId}-edit-tab`}
                  hidden={detailMode !== "edit"}
                  tabIndex={detailMode === "edit" ? 0 : -1}
                >
                  {detailMode === "edit" ? (
                    <ReviewPanel className={panelClass}>
                      <ReviewEditor
                        key={`editor-${active.id}`}
                        review={active}
                        onChangeNotes={(value: string) =>
                          onChangeNotes?.(active.id, value)
                        }
                        onChangeTags={(values: string[]) =>
                          onChangeTags?.(active.id, values)
                        }
                        onRename={(title: string) =>
                          onRename(active.id, title)
                        }
                        onChangeMeta={(partial: Partial<Review>) =>
                          onChangeMeta?.(active.id, partial)
                        }
                        onDone={() => setDetailMode("summary")}
                        onDelete={
                          onDelete ? () => onDelete(active.id) : undefined
                        }
                      />
                    </ReviewPanel>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </PageShell>
    </>
  );
}
