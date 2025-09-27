// src/components/reviews/ReviewList.tsx
"use client";

import * as React from "react";
import type { Review } from "@/lib/types";
import { cn } from "@/lib/utils";
import ReviewListItem from "./ReviewListItem";
import { Button } from "@/components/ui";
import { Ghost } from "lucide-react";

const PAGE_SIZE = 40;

export type ReviewListProps = {
  reviews: Review[];
  selectedId: string | null;
  onSelect?: (id: string) => void;
  onCreate?: () => void;
  className?: string;
  header?: React.ReactNode;
  hoverRing?: boolean;
};

export default function ReviewList({
  reviews,
  selectedId,
  onSelect,
  onCreate,
  className,
  header,
  hoverRing = false,
}: ReviewListProps) {
  const count = reviews.length;
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);

  React.useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [reviews]);

  const visibleReviews = React.useMemo(
    () => reviews.slice(0, visibleCount),
    [reviews, visibleCount],
  );

  const hasMore = visibleReviews.length < count;
  const shouldShowSummary = count > PAGE_SIZE;

  const summaryLabel = React.useMemo(() => {
    if (!shouldShowSummary) return "";
    if (hasMore) {
      return `Showing ${visibleReviews.length} of ${count}`;
    }
    return `Showing all ${count}`;
  }, [count, hasMore, shouldShowSummary, visibleReviews.length]);

  const handleLoadMore = React.useCallback(() => {
    setVisibleCount((prev) => Math.min(count, prev + PAGE_SIZE));
  }, [count]);

  const interactiveRingClass =
    hoverRing &&
    "hover:ring-2 hover:ring-[var(--focus)] focus-within:ring-2 focus-within:ring-[var(--focus)]";

  const containerClass = cn(
    "w-full mx-auto rounded-card r-card-lg border border-border/35 bg-card/60 text-card-foreground shadow-outline-subtle",
    "ds-card-pad backdrop-blur-sm transition-colors transition-shadow duration-chill",
    interactiveRingClass,
    className,
  );

  const emptyContainerClass = cn(
    "w-full mx-auto rounded-card r-card-lg text-card-foreground shadow-outline-subtle",
    "ds-card-pad backdrop-blur-sm transition-colors transition-shadow duration-chill",
    "relative isolate overflow-hidden glitch-card",
    interactiveRingClass,
    className,
  );

  const headerNode = header ? (
    <header className="mb-[var(--space-2)] text-ui text-muted-foreground">
      {header}
    </header>
  ) : null;

  if (count === 0) {
    return (
      <section data-scope="reviews" className={emptyContainerClass}>
        {headerNode}
        <div className="flex flex-col items-center justify-center gap-[var(--space-3)] text-center text-ui text-muted-foreground">
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
            <p className="text-card-foreground">It&rsquo;s a friendly ghost town in here.</p>
            <p>Spin up the first review and give this space a pulse.</p>
          </div>
          <Button
            type="button"
            variant="primary"
            onClick={onCreate}
            className="btn-glitch"
          >
            Create review
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section data-scope="reviews" className={containerClass}>
      {headerNode}
      <ul className="flex flex-col gap-[var(--space-3)]">
        {visibleReviews.map((r) => (
          <li key={r.id}>
            <ReviewListItem
              review={r}
              selected={r.id === selectedId}
              onClick={onSelect ? () => onSelect(r.id) : undefined}
            />
          </li>
        ))}
      </ul>
      {shouldShowSummary ? (
        <footer className="mt-[var(--space-3)] flex items-center justify-between gap-[var(--space-3)] text-ui text-muted-foreground">
          <span aria-live="polite">{summaryLabel}</span>
          {hasMore ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleLoadMore}
              className="shrink-0"
            >
              Load more
            </Button>
          ) : null}
        </footer>
      ) : null}
    </section>
  );
}
