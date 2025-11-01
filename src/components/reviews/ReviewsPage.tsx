"use client";

import * as React from "react";
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
  HeroSearchBar,
  PageShell,
  Select,
  TabBar,
  Skeleton,
  AIErrorCard,
} from "@/components/ui";
import {
  Header,
  PRIMARY_PAGE_NAV,
  type HeaderNavItem,
} from "@/components/ui/layout/Header";

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
  const sortLabelId = React.useId();
  const emptySearchDescriptionId = React.useId();
  const heroSubtitle = React.useMemo(() => {
    if (isLoading) {
      return (
        <span className="text-label text-muted-foreground" aria-live="polite">
          Syncing local reviews…
        </span>
      );
    }
    if (isErrored) {
      return (
        <span className="text-label font-medium text-danger" role="status">
          {errorMessage ?? "Unable to load reviews"}
        </span>
      );
    }
    if (totalCount > 0) {
      return <span className="pill">Total {totalCount}</span>;
    }
    return undefined;
  }, [errorMessage, isErrored, isLoading, totalCount]);
  const heroGridClass = "grid gap-[var(--space-3)] sm:gap-[var(--space-4)] md:grid-cols-12";
  const sortItems = React.useMemo(
    () => [
      { value: "newest", label: "Newest" },
      { value: "oldest", label: "Oldest" },
      { value: "title", label: "Title" },
    ],
    [],
  );

  const navItems = React.useMemo<HeaderNavItem[]>(
    () =>
      PRIMARY_PAGE_NAV.map((item) => ({
        ...item,
        active: item.key === "reviews",
      })),
    [],
  );

  const renderHeaderChildren = () => {
    if (isLoading) {
      return (
        <div className={heroGridClass}>
          <Skeleton
            ariaHidden={false}
            role="status"
            aria-label="Loading review search"
            className="md:col-span-8 h-[var(--control-h-lg)] w-full"
            radius="full"
          />
          <Skeleton
            ariaHidden={false}
            role="status"
            aria-label="Loading sort control"
            className="md:col-span-2 h-[var(--control-h-lg)] w-full"
            radius="md"
          />
          <Skeleton
            ariaHidden={false}
            role="status"
            aria-label="Loading review actions"
            className="md:col-span-2 h-[var(--control-h-lg)] w-full"
            radius="md"
          />
        </div>
      );
    }

    if (isErrored) {
      return (
        <div className={heroGridClass}>
          <HeroSearchBar
            round
            value={q}
            onValueChange={undefined}
            placeholder="Search unavailable until reviews sync."
            aria-label="Search reviews (temporarily unavailable)"
            className="md:col-span-8"
            debounceMs={300}
            disabled
            aria-busy={isErrored}
          />
          <div
            className="flex w-full flex-col gap-[var(--space-1)] text-left md:col-span-2"
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
          <Button
            type="button"
            variant="default"
            size="md"
            className={cn(
              "btn-glitch",
              "w-full whitespace-nowrap md:col-span-2 md:justify-self-end",
            )}
            onClick={onRetry ?? undefined}
            disabled={!onRetry}
          >
            Retry sync
          </Button>
          <p className="text-ui text-danger md:col-span-12" role="alert">
            {errorMessage ?? "We couldn’t load your reviews. Retry to continue."}
          </p>
        </div>
      );
    }

    if (hasReviews) {
      return (
        <div className={heroGridClass}>
          <HeroSearchBar
            round
            value={q}
            onValueChange={setQ}
            placeholder="Search title, tags, opponent, patch…"
            aria-label="Search reviews"
            className="md:col-span-8"
            debounceMs={300}
          />
          <div
            className="flex w-full flex-col gap-[var(--space-1)] text-left md:col-span-2"
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
          <Button
            type="button"
            variant="default"
            size="md"
            className={cn(
              "btn-glitch",
              "w-full whitespace-nowrap md:col-span-2 md:justify-self-end",
            )}
            onClick={commitCreateReview}
          >
            <Plus />
            <span>New Review</span>
          </Button>
        </div>
      );
    }

    return (
      <div className={heroGridClass}>
        <HeroSearchBar
          round
          value={q}
          onValueChange={undefined}
          placeholder="Add a review to unlock search by title, tags, opponent, or patch."
          aria-label="Search reviews (disabled until a review exists)"
          aria-describedby={emptySearchDescriptionId}
          className="md:col-span-8"
          debounceMs={300}
          disabled
        />
        <p
          id={emptySearchDescriptionId}
          className="text-ui text-muted-foreground md:col-span-8"
        >
          Once you publish your first review, smart filters, tagging, and matchup search become available.
        </p>
        <Button
          type="button"
          variant="default"
          size="md"
          className={cn(
            "btn-glitch",
            "w-full whitespace-nowrap md:col-span-4 md:justify-self-end",
          )}
          onClick={commitCreateReview}
        >
          <Plus />
          <span>New Review</span>
        </Button>
      </div>
    );
  };

  return (
    <>
      <Header
        id="reviews-header"
        heading="Reviews"
        subtitle={heroSubtitle}
        icon={<BookOpen className="opacity-80" />}
        navItems={navItems}
        variant="neo"
        underlineTone="brand"
        showThemeToggle
        sticky={false}
        className="py-[var(--space-6)]"
      >
        <div className="space-y-[var(--space-4)]">
          <p className="text-ui text-muted-foreground">Browse reviews, capture insights, and sync your notes.</p>
          {renderHeaderChildren()}
        </div>
      </Header>

      <PageShell
        as="section"
        className="py-[var(--space-6)] space-y-[var(--space-6)]"
        aria-labelledby="reviews-header"
      >
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
                className={cn(
                  panelClass,
                  "glitch-card space-y-[var(--space-4)] px-[var(--space-7)] py-[var(--space-7)]",
                )}
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
              <ReviewPanel
                aria-live="polite"
                className={cn(
                  panelClass,
                  "glitch-card px-[var(--space-7)] py-[var(--space-7)]",
                )}
              >
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
                  "relative isolate flex flex-col items-center justify-center gap-[var(--space-4)] overflow-hidden",
                  "glitch-card px-[var(--space-7)] py-[var(--space-8)] text-center text-ui text-muted-foreground",
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
                    Use the New Review button above to begin.
                  </p>
                </div>
              </ReviewPanel>
            ) : !active ? (
              <ReviewPanel
                aria-live="polite"
                className={cn(
                  panelClass,
                  "relative isolate flex flex-col items-center justify-center gap-[var(--space-3)] overflow-hidden",
                  "glitch-card px-[var(--space-7)] py-[var(--space-8)] text-center text-ui text-muted-foreground",
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
                  <p>Use New Review to document another match when you&rsquo;re ready.</p>
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
