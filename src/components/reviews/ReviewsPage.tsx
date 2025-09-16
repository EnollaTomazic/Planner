"use client";

import React, { useMemo, useState } from "react";
import { ts } from "@/lib/date";
import type { Review } from "@/lib/types";
import { cn } from "@/lib/utils";
import ReviewList from "./ReviewList";
import ReviewEditor from "./ReviewEditor";
import ReviewSummary from "./ReviewSummary";
import ReviewPanel from "./ReviewPanel";
import { getSearchBlob } from "./reviewSearch";
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
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [detailMode, setDetailMode] = useState<DetailMode>("summary");

  const base = useMemo<Review[]>(
    () => (Array.isArray(reviews) ? reviews : []),
    [reviews],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list =
      needle.length === 0
        ? [...base]
        : base.filter((r) => getSearchBlob(r).includes(needle));

    if (sort === "newest")
      list.sort((a, b) => ts(b?.createdAt) - ts(a?.createdAt));
    if (sort === "oldest")
      list.sort((a, b) => ts(a?.createdAt) - ts(b?.createdAt));
    if (sort === "title")
      list.sort((a, b) =>
        (a?.title || "").localeCompare(b?.title || "", undefined, {
          sensitivity: "base",
        }),
      );

    return list;
  }, [base, q, sort]);

  const active = base.find((r) => r.id === selectedId) || null;
  const panelClass = "mx-auto";
  const detailBaseId = active ? `review-${active.id}` : "review-detail";

  return (
    <PageShell
      as="main"
      className="py-6 space-y-6"
      aria-labelledby="reviews-header"
    >
      <PageHeader
        className="sticky top-0 rounded-card r-card-lg px-4 py-4"
        contentClassName="space-y-2"
        header={{
          id: "reviews-header",
          heading: "Reviews",
          icon: <BookOpen className="opacity-80" />,
          topClassName: "top-[var(--header-stack)]",
          underline: true,
        }}
        hero={{
          frame: false,
          topClassName: "top-[var(--header-stack)]",
          heading: "Browse Reviews",
          subtitle: <span className="pill">Total {base.length}</span>,
          search: {
            round: true,
            value: q,
            onValueChange: setQ,
            placeholder: "Search title, tags, opponent, patch…",
            className: "flex-1",
          },
          actions: (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-label text-muted-foreground">
                <span>Sort</span>
                <Select
                  variant="animated"
                  value={sort}
                  onChange={(v) => setSort(v as SortKey)}
                  items={[
                    { value: "newest", label: "Newest" },
                    { value: "oldest", label: "Oldest" },
                    { value: "title", label: "Title" },
                  ]}
                  buttonClassName="h-10 px-4"
                />
              </div>
              <Button
                type="button"
                variant="primary"
                size="md"
                className="px-4 whitespace-nowrap"
                onClick={() => {
                  setQ("");
                  setSort("newest");
                  setDetailMode("edit");
                  onCreate();
                }}
              >
                <Plus />
                <span>New Review</span>
              </Button>
            </div>
          ),
        }}
      />

      <div className={cn("grid grid-cols-1 items-start gap-6 md:grid-cols-12")}>
        <nav aria-label="Review list" className="md:col-span-4">
          <div className="card-neo-soft rounded-card r-card-lg overflow-hidden bg-card/50 shadow-neo-strong">
            <div className="section-b">
              <div className="mb-2 text-ui text-muted-foreground">
                {filtered.length} shown
              </div>
              <ReviewList
                reviews={filtered}
                selectedId={selectedId}
                onSelect={(id) => {
                  setDetailMode("summary");
                  onSelect(id);
                }}
                onCreate={onCreate}
                className="max-h-screen overflow-auto p-2"
              />
            </div>
          </div>
        </nav>
        <div aria-live="polite" className="md:col-span-8">
          {!active ? (
            <ReviewPanel
              className={cn(
                panelClass,
                "flex flex-col items-center justify-center gap-2 py-7 text-ui text-muted-foreground",
              )}
            >
              <Ghost className="h-6 w-6 opacity-60" />
              <p>Select a review from the list or create a new one.</p>
            </ReviewPanel>
          ) : (
            <div className="space-y-4">
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
