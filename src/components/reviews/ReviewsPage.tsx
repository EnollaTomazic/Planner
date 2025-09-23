"use client";

import * as React from "react";
import type { Review } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useReviewFilter } from "@/components/reviews";
import ReviewList from "./ReviewList";
import ReviewEditor from "./ReviewEditor";
import ReviewSummary from "./ReviewSummary";
import ReviewPanel from "./ReviewPanel";
import { BookOpen, Ghost, Plus } from "lucide-react";

import { Button, Select, PageHeader, PageShell, TabBar } from "@/components/ui";

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
  const [q, setQ] = React.useState("");
  const [sort, setSort] = React.useState<SortKey>("newest");
  const [detailMode, setDetailMode] = React.useState<DetailMode>("summary");

  const handleCreateReview = React.useCallback(() => {
    setQ("");
    setSort("newest");
    setDetailMode("edit");
    onCreate();
  }, [onCreate]);

  const base = React.useMemo<Review[]>(
    () => (Array.isArray(reviews) ? reviews : []),
    [reviews],
  );

  const filtered = useReviewFilter(base, q, sort);

  const active = React.useMemo(
    () => base.find((r) => r.id === selectedId) || null,
    [base, selectedId],
  );
  const panelClass = "mx-auto";
  const detailBaseId = active ? `review-${active.id}` : "review-detail";

  return (
    <>
      <PageShell as="header" className="py-[var(--space-6)]">
        <PageHeader
          className="rounded-card r-card-lg px-[var(--space-4)] py-[var(--space-4)]"
          contentClassName="space-y-[var(--space-2)]"
          header={{
            id: "reviews-header",
            heading: "Reviews",
            icon: <BookOpen className="opacity-80" />,
            topClassName: "top-[var(--header-stack)]",
            underline: true,
            sticky: false,
          }}
          hero={{
            frame: false,
            sticky: false,
            topClassName: "top-[var(--header-stack)]",
            padding: "none",
            heading: "Browse Reviews",
            subtitle: <span className="pill">Total {base.length}</span>,
            search: {
              round: true,
              value: q,
              onValueChange: setQ,
              placeholder: "Search title, tags, opponent, patch…",
              "aria-label": "Search reviews",
              className: "flex-1",
            },
            actions: (
              <div className="flex flex-col gap-[var(--space-2)] sm:flex-row sm:items-center sm:gap-[var(--space-3)]">
                <label className="flex w-full flex-col gap-[var(--space-1)] sm:w-auto sm:flex-row sm:items-center sm:gap-[var(--space-2)]">
                  <span className="text-ui font-medium text-muted-foreground">
                    Sort
                  </span>
                  <Select
                    variant="animated"
                    ariaLabel="Sort reviews"
                    value={sort}
                    onChange={(v) => setSort(v as SortKey)}
                    items={[
                      { value: "newest", label: "Newest" },
                      { value: "oldest", label: "Oldest" },
                      { value: "title", label: "Title" },
                    ]}
                    className="w-full sm:w-auto"
                    size="lg"
                  />
                </label>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  className="w-full whitespace-nowrap sm:w-auto"
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
        as="main"
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
            header={`${filtered.length} shown`}
            hoverRing
          />
        </nav>
        <div className="md:col-span-4 lg:col-span-8">
          {!active ? (
            <ReviewPanel
              aria-live="polite"
              className={cn(
                panelClass,
                "flex flex-col items-center justify-center gap-[var(--space-2)] py-[var(--space-8)] text-ui text-muted-foreground",
              )}
            >
              <Ghost className="size-[var(--icon-size-xl)] opacity-60" />
              <p>Select a review from the list or create a new one.</p>
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
