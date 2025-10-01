// src/components/reviews/ReviewList.tsx
"use client";

import * as React from "react";
import type { Review } from "@/lib/types";
import { cn } from "@/lib/utils";
import ReviewListItem from "./ReviewListItem";
import { Button } from "@/components/ui";
import { Ghost } from "lucide-react";

const PAGE_SIZE = 40;
const REVIEW_SCROLL_STORAGE_KEY = "planner:reviews:list-scroll";
const REVIEW_AUTOLOAD_STORAGE_KEY = "planner:reviews:auto-load";

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
  const [autoLoadEnabled, setAutoLoadEnabled] = React.useState(true);
  const scrollContainerRef = React.useRef<HTMLElement | null>(null);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const autoLoadLockRef = React.useRef(false);
  const restoredRef = React.useRef(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = sessionStorage.getItem(REVIEW_AUTOLOAD_STORAGE_KEY);
    if (stored !== null) {
      setAutoLoadEnabled(stored === "true");
    }
  }, []);

  React.useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [reviews]);

  const visibleReviews = React.useMemo(
    () => reviews.slice(0, visibleCount),
    [reviews, visibleCount],
  );

  const hasMore = visibleReviews.length < count;
  const shouldShowSummary = count > PAGE_SIZE;
  const progressRatio = count === 0 ? 0 : visibleReviews.length / count;
  const progressPercent = Math.min(100, Math.round(progressRatio * 100));

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

  const handleToggleAutoLoad = React.useCallback(() => {
    setAutoLoadEnabled((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        sessionStorage.setItem(REVIEW_AUTOLOAD_STORAGE_KEY, String(next));
      }
      return next;
    });
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const container = scrollContainerRef.current;
    if (!container) return undefined;

    const stored = sessionStorage.getItem(REVIEW_SCROLL_STORAGE_KEY);
    if (!restoredRef.current && stored) {
      const parsed = Number.parseInt(stored, 10);
      if (!Number.isNaN(parsed)) {
        container.scrollTop = parsed;
      }
    }
    restoredRef.current = true;

    let frame = 0;
    const handleScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        sessionStorage.setItem(
          REVIEW_SCROLL_STORAGE_KEY,
          Math.round(container.scrollTop).toString(),
        );
      });
    };

    const handlePageHide = () => {
      sessionStorage.setItem(
        REVIEW_SCROLL_STORAGE_KEY,
        Math.round(container.scrollTop).toString(),
      );
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pagehide", handlePageHide);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      sessionStorage.setItem(
        REVIEW_SCROLL_STORAGE_KEY,
        Math.round(container.scrollTop).toString(),
      );
    };
  }, [visibleReviews.length]);

  React.useEffect(() => {
    autoLoadLockRef.current = false;
  }, [visibleReviews.length]);

  React.useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (!autoLoadEnabled) return undefined;
    if (!hasMore) return undefined;
    const container = scrollContainerRef.current;
    const sentinel = sentinelRef.current;
    if (!container || !sentinel) return undefined;
    if (!("IntersectionObserver" in window)) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !autoLoadLockRef.current) {
            autoLoadLockRef.current = true;
            handleLoadMore();
          }
        });
      },
      {
        root: container,
        rootMargin: "25% 0px",
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [autoLoadEnabled, handleLoadMore, hasMore, visibleReviews.length]);

  const interactiveRingClass =
    hoverRing &&
    "hover:ring-2 hover:ring-[var(--theme-ring,var(--focus))] focus-within:ring-2 focus-within:ring-[var(--theme-ring,var(--focus))]";

  const containerClass = cn(
    "w-full mx-auto rounded-card r-card-lg border border-border/35 bg-card/60 text-card-foreground shadow-outline-subtle",
    "ds-card-pad backdrop-blur-sm transition-colors transition-shadow duration-chill",
    interactiveRingClass,
    className,
  );

  const emptyContainerClass = cn(
    "w-full mx-auto rounded-card r-card-lg text-card-foreground",
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
            variant="default"
            size="md"
            onClick={onCreate}
            className={cn("btn-glitch")}
          >
            Create review
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section
      data-scope="reviews"
      className={containerClass}
      ref={(node) => {
        scrollContainerRef.current = node;
      }}
    >
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
        <footer className="mt-[var(--space-3)] flex flex-col gap-[var(--space-2)] text-ui text-muted-foreground">
          <div className="flex items-center justify-between gap-[var(--space-3)]">
            <span aria-live="polite">{summaryLabel}</span>
            {hasMore ? (
              <div className="flex items-center gap-[var(--space-2)]">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleToggleAutoLoad}
                  className="shrink-0"
                  aria-pressed={autoLoadEnabled}
                >
                  {autoLoadEnabled ? "Pause auto-load" : "Enable auto-load"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="soft"
                  onClick={handleLoadMore}
                  className="shrink-0"
                >
                  Load more
                </Button>
              </div>
            ) : null}
          </div>
          <div
            role="progressbar"
            aria-label="Reviews shown"
            aria-valuemin={0}
            aria-valuemax={count}
            aria-valuenow={visibleReviews.length}
            className="relative h-[var(--space-1)] w-full overflow-hidden rounded-full border border-border/40 bg-card/40"
          >
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 block h-full rounded-full bg-accent/70"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </footer>
      ) : null}
      <div ref={sentinelRef} aria-hidden className="h-px w-full" />
    </section>
  );
}
