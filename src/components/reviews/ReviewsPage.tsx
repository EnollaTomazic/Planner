"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import type { Review } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useReviewFilter } from "@/components/reviews";
import ReviewList from "./ReviewList";
import ReviewEditor from "./ReviewEditor";
import ReviewSummary from "./ReviewSummary";
import ReviewPanel from "./ReviewPanel";
import { BookOpen, Ghost, Plus } from "lucide-react";

import {
  Button,
  HeroSearchBar,
  PageHeader,
  PageShell,
  Select,
  TabBar,
} from "@/components/ui";

type SortKey = "newest" | "oldest" | "title";
type DetailMode = "summary" | "edit";

export type ReviewsPageProps = {
  reviews: Review[] | null | undefined;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRename: (id: string, nextTitle: string) => void;
  onDelete?: (id: string) => void;
  onChangeNotes?: (id: string, nextNotes: string) => void;
  onChangeTags?: (id: string, nextTags: string[]) => void;
  onChangeMeta?: (id: string, partial: Partial<Review>) => void;
};

export default function ReviewsPage({
  reviews,
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

  const handleCreateReview = React.useCallback(() => {
    setQ("");
    setSort("newest");
    setDetailMode("edit");
    onCreate();
  }, [onCreate]);

  const intentParam = searchParams?.get("intent") ?? null;
  React.useEffect(() => {
    if (intentParam === "create-review") {
      if (!intentApplied) {
        handleCreateReview();
        setIntentApplied(true);
      }
      return;
    }
    if (intentApplied) {
      setIntentApplied(false);
    }
  }, [intentParam, intentApplied, handleCreateReview]);

  const base = React.useMemo<Review[]>(
    () => (Array.isArray(reviews) ? reviews : []),
    [reviews],
  );

  const filtered = useReviewFilter(base, q, sort);
  const totalCount = base.length;
  const hasReviews = totalCount > 0;
  const filteredCount = filtered.length;

  const active = React.useMemo(
    () => base.find((r) => r.id === selectedId) || null,
    [base, selectedId],
  );
  const panelClass = "mx-auto";
  const detailBaseId = active ? `review-${active.id}` : "review-detail";
  const sortLabelId = React.useId();
  const emptySearchDescriptionId = "reviews-empty-search-description";

  return (
    <>
      <PageShell as="header" className="py-[var(--space-6)]">
        <PageHeader
          header={{
            id: "reviews-header",
            heading: "Reviews",
            icon: <BookOpen className="opacity-80" />,
            topClassName: "top-[var(--header-stack)]",
            underline: true,
            sticky: false,
          }}
          hero={{
            sticky: false,
            heading: "Browse Reviews",
            subtitle:
              totalCount > 0 ? (
                <span className="pill">Total {totalCount}</span>
              ) : undefined,
            children: hasReviews ? (
              <div className="grid gap-[var(--space-3)] sm:gap-[var(--space-4)] md:grid-cols-12">
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
                    items={[
                      { value: "newest", label: "Newest" },
                      { value: "oldest", label: "Oldest" },
                      { value: "title", label: "Title" },
                    ]}
                    className="w-full"
                    size="lg"
                  />
                </div>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  className={cn(
                    "btn-glitch",
                    "w-full whitespace-nowrap md:col-span-2 md:justify-self-end",
                  )}
                  onClick={handleCreateReview}
                >
                  <Plus />
                  <span>New Review</span>
                </Button>
              </div>
            ) : (
              <div className="grid gap-[var(--space-3)] sm:gap-[var(--space-4)] md:grid-cols-12">
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
                  Once you create your first review, you can filter by title, tag combinations, specific opponents, or patch history.
                </p>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  className={cn(
                    "btn-glitch",
                    "w-full whitespace-nowrap md:col-span-4 md:justify-self-end",
                  )}
                  onClick={handleCreateReview}
                >
                  <Plus />
                  <span>New Review</span>
                </Button>
              </div>
            ),
          }}
        />
      </PageShell>

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
              reviews={filtered}
              selectedId={selectedId}
              onSelect={(id) => {
                setDetailMode("summary");
                onSelect(id);
              }}
              onCreate={handleCreateReview}
              className="h-auto overflow-auto p-[var(--space-2)] md:h-[var(--content-viewport-height)]"
              header={
                filteredCount > 0 ? `${filteredCount} shown` : undefined
              }
              hoverRing
            />
          </nav>
          <div className="md:col-span-4 lg:col-span-8">
            {!active ? (
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
                  <p className="text-card-foreground">Select a review from the list or create a new one.</p>
                  <p>Once you do, summaries and edit tools will appear here.</p>
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
