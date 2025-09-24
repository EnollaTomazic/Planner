// src/components/reviews/ReviewList.tsx
"use client";

import * as React from "react";
import type { Review } from "@/lib/types";
import { cn } from "@/lib/utils";
import ReviewListItem from "./ReviewListItem";
import { Button } from "@/components/ui";
import { Tv } from "lucide-react";

export const MAX_VISIBLE_REVIEWS = 200;

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
  const visibleReviews = React.useMemo(() => {
    if (reviews.length <= MAX_VISIBLE_REVIEWS) {
      return reviews;
    }
    return reviews.slice(0, MAX_VISIBLE_REVIEWS);
  }, [reviews]);
  const hiddenCount = Math.max(count - visibleReviews.length, 0);

  const containerClass = cn(
    "w-full mx-auto rounded-card r-card-lg border border-border/35 bg-card/60 text-card-foreground shadow-outline-subtle",
    "ds-card-pad backdrop-blur-sm transition-colors transition-shadow duration-200",
    hoverRing &&
      "hover:ring-2 hover:ring-[var(--focus)] focus-within:ring-2 focus-within:ring-[var(--focus)]",
    className,
  );

  const headerNode = header ? (
    <header className="mb-[var(--space-2)] text-ui text-muted-foreground">
      {header}
    </header>
  ) : null;

  if (count === 0) {
    return (
      <section data-scope="reviews" className={containerClass}>
        {headerNode}
        <div className="flex flex-col items-center justify-center gap-[var(--space-3)] text-center text-ui text-muted-foreground">
          <Tv className="size-[var(--space-5)] opacity-60" />
          <p>No reviews yet</p>
          <Button variant="primary" onClick={onCreate}>
            New Review
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
        {hiddenCount > 0 ? (
          <li>
            <div className="rounded-card border border-border/35 bg-card/50 px-[var(--space-3)] py-[var(--space-2)] text-label text-muted-foreground">
              Showing {visibleReviews.length} of {count}. Refine your filters to narrow the list.
            </div>
          </li>
        ) : null}
      </ul>
    </section>
  );
}
