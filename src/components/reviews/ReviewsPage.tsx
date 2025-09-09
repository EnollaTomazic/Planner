"use client";
import "./style.css";

import React, { useMemo, useState } from "react";
import type { Review } from "@/lib/types";
import { cn } from "@/lib/utils";
import ReviewList from "./ReviewList";
import ReviewEditor from "./ReviewEditor";
import ReviewSummary from "./ReviewSummary";
import ReviewPanel from "./ReviewPanel";
import { Ghost, Plus } from "lucide-react";

import Button from "@/components/ui/primitives/Button";
// ⬇️ use the new AnimatedSelect location
import AnimatedSelect from "@/components/ui/selects/AnimatedSelect";
import Header from "@/components/ui/layout/Header";
import Hero, { HeroSearchBar } from "@/components/ui/layout/Hero";

type SortKey = "newest" | "oldest" | "title";

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
  const [panelMode, setPanelMode] = useState<"summary" | "edit">("summary");

  const base = useMemo<Review[]>(() => (Array.isArray(reviews) ? reviews : []), [reviews]);

  const filtered = useMemo(() => {
    const ts = (v: unknown): number => {
      if (typeof v === "number") return v;
      if (v instanceof Date) return +v;
      if (typeof v === "string") {
        const n = Date.parse(v);
        return Number.isNaN(n) ? 0 : n;
      }
      return 0;
    };

    const needle = q.trim().toLowerCase();
    const list =
      needle.length === 0
        ? [...base]
        : base.filter((r) => {
            const blob = [
              r?.title,
              Array.isArray(r?.tags) ? r.tags.join(" ") : "",
              r?.opponent,
              r?.lane,
              r?.side,
              r?.result,
              r?.patch,
              r?.duration,
              r?.notes,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();
            return blob.includes(needle);
          });

    if (sort === "newest") list.sort((a, b) => ts(b?.createdAt) - ts(a?.createdAt));
    if (sort === "oldest") list.sort((a, b) => ts(a?.createdAt) - ts(b?.createdAt));
    if (sort === "title")
      list.sort((a, b) =>
        (a?.title || "").localeCompare(b?.title || "", undefined, { sensitivity: "base" })
      );

    return list;
  }, [base, q, sort]);

  const active = base.find((r) => r.id === selectedId) || null;

  return (
    <main className="page-shell py-6 space-y-6">
      <Header heading="Reviews" />
      <Hero
        topClassName="top-20"
        heading={
          <div className="flex items-center gap-2">
            <h2 className="title-glow">Reviews</h2>
            <span className="pill">Total {base.length}</span>
          </div>
        }
        right={null}
        bottom={
          <>
            <HeroSearchBar
              value={q}
              onValueChange={setQ}
              placeholder="Search title, tags, opponent, patch…"
              className="flex-1"
            />
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                <span>Sort</span>
                <AnimatedSelect
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
                  setPanelMode("edit");
                  onCreate();
                }}
              >
                <Plus className="size-4" />
                <span>New Review</span>
              </Button>
            </div>
          </>
        }
      />

      <div className={cn("grid items-start gap-6 md:grid-cols-12")}>
        <aside className="md:col-span-5 md:w-72 lg:col-span-4 lg:w-80">
          <div
            className="card-neo-soft overflow-hidden bg-card/50 shadow-neo-strong"
          >
            <div className="section-b">
              <div className="mb-2 text-sm text-muted-foreground">
                {filtered.length} shown
              </div>
              <ReviewList
                reviews={filtered}
                selectedId={selectedId}
                onSelect={(id) => {
                  setPanelMode("summary");
                  onSelect(id);
                }}
                onCreate={onCreate}
                className="max-h-screen overflow-auto p-2"
              />
            </div>
            </div>
          </aside>

          <div className="md:col-span-7 lg:col-span-8 flex justify-center">
            {!active ? (
              <ReviewPanel className="flex flex-col items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                <Ghost className="h-6 w-6 opacity-60" />
                <p>Select a review from the list or create a new one.</p>
              </ReviewPanel>
            ) : panelMode === "summary" ? (
              <ReviewPanel>
                <ReviewSummary
                  key={`summary-${active.id}`}
                  review={active}
                  onEdit={() => setPanelMode("edit")}
                />
              </ReviewPanel>
            ) : (
              <ReviewPanel>
                <ReviewEditor
                  key={`editor-${active.id}`}
                  review={active}
                  onChangeNotes={(value: string) => onChangeNotes?.(active.id, value)}
                  onChangeTags={(values: string[]) => onChangeTags?.(active.id, values)}
                  onRename={(title: string) => onRename(active.id, title)}
                  onChangeMeta={(partial: Partial<Review>) =>
                    onChangeMeta?.(active.id, partial)
                  }
                  onDone={() => setPanelMode("summary")}
                  onDelete={onDelete ? () => onDelete(active.id) : undefined}
                />
              </ReviewPanel>
            )}
          </div>
      </div>
    </main>
  );
}
