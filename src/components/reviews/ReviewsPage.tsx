"use client";

import React, { useCallback, useMemo, useState } from "react";
import type { Review } from "@/lib/types";
import { cn } from "@/lib/utils";
import ReviewList from "./ReviewList";
import ReviewEditor from "./ReviewEditor";
import ReviewSummary from "./ReviewSummary";
import ReviewPanel from "./ReviewPanel";
import { Ghost, Plus as PlusIcon } from "lucide-react";

import {
  Badge,
  Button,
  HeroCol,
  HeroGrid,
  NeomorphicHeroFrame,
  PageShell,
  SearchBar,
  Select,
  TabBar,
} from "@/components/ui";
import { useReviewFilter } from "./useReviewFilter";

type SortKey = "newest" | "oldest" | "title";
type DetailMode = "summary" | "edit";

type SortSelectOption = { key: SortKey; label: string };

type SortSelectProps = {
  "aria-label": string;
  value: SortKey;
  onValueChange: (next: SortKey) => void;
  items: SortSelectOption[];
};

function SortSelect({
  "aria-label": ariaLabel,
  value,
  onValueChange,
  items,
}: SortSelectProps) {
  return (
    <Select
      variant="animated"
      ariaLabel={ariaLabel}
      value={value}
      onChange={(next) => onValueChange(next as SortKey)}
      items={items.map(({ key, label }) => ({ value: key, label }))}
      className="w-full sm:w-auto"
      buttonClassName="!h-[var(--control-h-lg)] !px-[var(--space-4)]"
    />
  );
}

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
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [detailMode, setDetailMode] = useState<DetailMode>("summary");

  const base = useMemo<Review[]>(
    () => (Array.isArray(reviews) ? reviews : []),
    [reviews],
  );

  const list = useReviewFilter(base, q, sort);

  const active = base.find((r) => r.id === selectedId) || null;
  const panelClass = "mx-auto";
  const detailBaseId = active ? `review-${active.id}` : "review-detail";
  const state = useMemo(
    () => ({ q, sort }),
    [q, sort],
  );

  const createReview = useCallback(() => {
    setQ("");
    setSort("newest");
    setDetailMode("edit");
    onCreate();
  }, [onCreate]);

  return (
    <PageShell
      as="main"
      className="py-[var(--space-6)] space-y-[var(--space-6)]"
      aria-labelledby="reviews-header"
    >
      <header id="reviews-header">
        <NeomorphicHeroFrame
          as="header"
          variant="default"
          align="between"
          label="Reviews header"
          slots={{
            tabs: null,
            search: (
              <SearchBar
                value={state.q}
                onValueChange={(next) => setQ(next)}
                placeholder="Search title, tags, opponent, patch…"
                aria-label="Search reviews"
              />
            ),
            actions: (
              <div className="flex flex-wrap items-center gap-[var(--space-2)]">
                <SortSelect
                  aria-label="Sort reviews"
                  value={state.sort}
                  onValueChange={(next) => setSort(next)}
                  items={[
                    { key: "newest", label: "Newest" },
                    { key: "oldest", label: "Oldest" },
                    { key: "title", label: "Title" },
                  ]}
                />
                <Button variant="primary" onClick={createReview}>
                  <PlusIcon /> <span>New Review</span>
                </Button>
              </div>
            ),
          }}
        >
          <HeroGrid>
            <HeroCol span={8}>
              <h2 className="text-title font-semibold">Browse Reviews</h2>
              <Badge>Total {list.length}</Badge>
            </HeroCol>
          </HeroGrid>
        </NeomorphicHeroFrame>
      </header>

      <div
        className={cn(
          "grid grid-cols-1 items-start gap-[var(--space-4)] sm:gap-[var(--space-6)] lg:gap-[var(--space-8)] md:grid-cols-6 lg:grid-cols-12",
        )}
      >
        <nav
          aria-label="Review list"
          className="md:col-span-2 lg:col-span-4"
        >
          <div className="card-neo-soft rounded-card r-card-lg overflow-hidden bg-card/50 shadow-neo-strong">
            <div className="section-b">
              <div className="mb-[var(--space-2)] text-ui text-muted-foreground">
                {list.length} shown
              </div>
              <ReviewList
                reviews={list}
                selectedId={selectedId}
                onSelect={(id) => {
                  setDetailMode("summary");
                  onSelect(id);
                }}
                onCreate={onCreate}
                className="h-auto overflow-auto p-[var(--space-2)] md:h-[calc(100vh-var(--header-stack)-var(--space-6))]"
              />
            </div>
          </div>
        </nav>
        <div aria-live="polite" className="md:col-span-4 lg:col-span-8">
          {!active ? (
            <ReviewPanel
              className={cn(
                panelClass,
                "flex flex-col items-center justify-center gap-[var(--space-2)] py-[var(--space-8)] text-ui text-muted-foreground",
              )}
            >
              <Ghost className="h-6 w-6 opacity-60" />
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
  );
}
