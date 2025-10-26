"use client";

import * as React from "react";

import { ThemeMatrix } from "@/components/prompts/ComponentsView";
import {
  ReviewList,
  ReviewPanel,
  ReviewSummary,
} from "@/components/reviews";
import {
  AIErrorCard,
  Button,
  Skeleton,
} from "@/components/ui";
import type { Review } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BookOpen, Ghost } from "lucide-react";

const noop = () => {};

const demoReviews: Review[] = [
  {
    id: "rev-1",
    title: "Scrim vs Azir",
    tags: ["midlane"],
    pillars: [],
    createdAt: Date.now() - 86_400_000,
    matchup: "Syndra vs Azir",
    role: "MID",
  },
  {
    id: "rev-2",
    title: "Playoffs vs Rumble",
    tags: ["toplane"],
    pillars: [],
    createdAt: Date.now() - 172_800_000,
    matchup: "Riven vs Rumble",
    role: "TOP",
  },
];

const detailPanelClass = "mx-auto";

function ReviewDetailLoadingPreview() {
  return (
    <ReviewPanel
      aria-busy="true"
      className={cn(
        detailPanelClass,
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
  );
}

function ReviewDetailErrorPreview() {
  return (
    <ReviewPanel
      aria-live="polite"
      className={cn(
        detailPanelClass,
        "glitch-card px-[var(--space-7)] py-[var(--space-7)]",
      )}
    >
      <AIErrorCard
        title="Review detail unavailable"
        description="We couldn’t load your review details."
        hint="Retry the sync to continue editing or summarizing your matches."
        retryLabel="Retry sync"
        onRetry={noop}
        className="w-full border-none bg-transparent p-0 shadow-none"
      />
    </ReviewPanel>
  );
}

function ReviewDetailEmptyPreview() {
  return (
    <ReviewPanel
      aria-live="polite"
      className={cn(
        detailPanelClass,
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
        <BookOpen aria-hidden className="size-[var(--space-6)]" />
      </span>
      <div className="space-y-[var(--space-1)]">
        <p className="text-card-foreground">You&rsquo;re ready to capture your first review.</p>
        <p>Log a match recap to unlock summaries, tagging, and focus tracking.</p>
      </div>
      <Button
        type="button"
        variant="default"
        size="md"
        className="btn-glitch"
        onClick={noop}
      >
        New Review
      </Button>
    </ReviewPanel>
  );
}

function ReviewDetailPlaceholderPreview() {
  return (
    <ReviewPanel
      aria-live="polite"
      className={cn(
        detailPanelClass,
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
        <Ghost aria-hidden className="size-[var(--space-6)]" />
      </span>
      <div className="space-y-[var(--space-1)]">
        <p className="text-card-foreground">Select a review from the list to see its summary.</p>
        <p>Use New Review to document another match when you&rsquo;re ready.</p>
      </div>
    </ReviewPanel>
  );
}

function ReviewDetailSummaryPreview({ review }: { review: Review }) {
  return (
    <ReviewPanel className={detailPanelClass}>
      <ReviewSummary review={review} onEdit={noop} />
    </ReviewPanel>
  );
}

function ReviewStatesPreview() {
  const previewRenderer = React.useMemo(() => {
    const Renderer = () => <ReviewsStateMatrix />;
    Renderer.displayName = "ReviewsStateMatrixRenderer";
    return Renderer;
  }, []);

  return (
    <ThemeMatrix
      entryId="reviews-states-preview"
      previewRenderer={previewRenderer}
    />
  );
}

function ReviewsStateMatrix() {
  return (
    <div className="space-y-[var(--space-6)]">
      <section aria-labelledby="review-list-states-heading">
        <header className="space-y-[var(--space-1)]">
          <h2
            id="review-list-states-heading"
            className="text-title font-semibold tracking-[-0.01em] text-foreground"
          >
            Review list states
          </h2>
          <p className="text-ui text-muted-foreground">
            Loading, error, and empty states now use tokenized skeletons and retry affordances before the ready list engages.
          </p>
        </header>
        <div className="mt-[var(--space-4)] grid gap-[var(--space-4)] lg:grid-cols-2">
          <figure className="space-y-[var(--space-2)]">
            <figcaption className="text-label font-medium text-muted-foreground">
              Loading
            </figcaption>
            <ReviewList
              reviews={[]}
              selectedId={null}
              loading
              onSelect={noop}
            />
          </figure>
          <figure className="space-y-[var(--space-2)]">
            <figcaption className="text-label font-medium text-muted-foreground">
              Error with retry
            </figcaption>
            <ReviewList
              reviews={[]}
              selectedId={null}
              error="Network request failed"
              onRetry={noop}
              onSelect={noop}
            />
          </figure>
          <figure className="space-y-[var(--space-2)]">
            <figcaption className="text-label font-medium text-muted-foreground">
              Empty dataset
            </figcaption>
            <ReviewList
              reviews={[]}
              selectedId={null}
              onSelect={noop}
            />
          </figure>
          <figure className="space-y-[var(--space-2)]">
            <figcaption className="text-label font-medium text-muted-foreground">
              Ready list
            </figcaption>
            <ReviewList
              reviews={demoReviews}
              selectedId={demoReviews[0]!.id}
              onSelect={noop}
            />
          </figure>
        </div>
      </section>

      <section aria-labelledby="review-detail-states-heading">
        <header className="space-y-[var(--space-1)]">
          <h2
            id="review-detail-states-heading"
            className="text-title font-semibold tracking-[-0.01em] text-foreground"
          >
            Review detail states
          </h2>
          <p className="text-ui text-muted-foreground">
            Detail panels lock interactions during sync, surface retry messaging, and encourage first-run setup when no reviews exist.
          </p>
        </header>
        <div className="mt-[var(--space-4)] grid gap-[var(--space-4)] lg:grid-cols-2">
          <figure className="space-y-[var(--space-2)]">
            <figcaption className="text-label font-medium text-muted-foreground">
              Loading detail
            </figcaption>
            <ReviewDetailLoadingPreview />
          </figure>
          <figure className="space-y-[var(--space-2)]">
            <figcaption className="text-label font-medium text-muted-foreground">
              Error detail
            </figcaption>
            <ReviewDetailErrorPreview />
          </figure>
          <figure className="space-y-[var(--space-2)]">
            <figcaption className="text-label font-medium text-muted-foreground">
              Empty state
            </figcaption>
            <ReviewDetailEmptyPreview />
          </figure>
          <figure className="space-y-[var(--space-2)]">
            <figcaption className="text-label font-medium text-muted-foreground">
              Ready summary
            </figcaption>
            <ReviewDetailSummaryPreview review={demoReviews[0]!} />
          </figure>
          <figure className="space-y-[var(--space-2)] lg:col-span-2">
            <figcaption className="text-label font-medium text-muted-foreground">
              Placeholder without selection
            </figcaption>
            <ReviewDetailPlaceholderPreview />
          </figure>
        </div>
      </section>
    </div>
  );
}

export default ReviewStatesPreview;
