// src/components/reviews/ReviewList.tsx
"use client";
import "../reviews/style.css";

import * as React from "react";
import type { Review } from "@/lib/types";
import { cn, LOCALE } from "@/lib/utils";
import { Ghost, Trash2 } from "lucide-react";
import { IconButton } from "@/components/ui";

type Props = {
  reviews: Review[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRename?: (id: string, nextTitle: string) => void; // kept for API stability; not used
  onDelete?: (id: string) => void;
  className?: string;
};

/**
 * ReviewList
 * - No inline edit
 * - Title + tiny date on same line
 * - Result-colored dot to the LEFT of the title
 * - Hover: only glow (no translate/scale/border-width change => no jump)
 */
export default function ReviewList({
  reviews,
  selectedId,
  onSelect,
  onDelete,
  className,
}: Props) {
  if (reviews.length === 0) {
    return (
      <div className={cn("reviews-scope", className)}>
        <div className="flex flex-col items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
          <Ghost className="h-6 w-6 opacity-60" />
          <p>No reviews yet. Create your first one.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("reviews-scope space-y-3", className)}>
      {reviews.map((r) => {
        const active = r.id === selectedId;

        // Typed, no "any"
        const res: "Win" | "Loss" | undefined = r.result;
        const scoreNum = typeof r.score === "number" ? r.score : NaN;
        const scoreTxt = Number.isFinite(scoreNum) ? `${scoreNum}/10` : "";

        const dateStr =
          typeof r.createdAt === "number"
            ? new Date(r.createdAt).toLocaleDateString(LOCALE)
            : "";

        const dotColor =
          res === "Win"
            ? "bg-emerald-400"
            : res === "Loss"
            ? "bg-rose-400"
            : "bg-slate-400";

        const onTileKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Enter" || e.key === " ") onSelect(r.id);
        };

        return (
          <div
            key={r.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(r.id)}
            onKeyDown={onTileKeyDown}
            className={cn(
              "group/review review-tile relative w-full h-20 p-2",
              active && "review-tile--active"
            )}
            aria-current={active ? "true" : undefined}
          >
            <div className="grid h-full grid-cols-[1fr_auto] items-center gap-3">
              {/* Left info */}
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  {/* Status dot — blinks only when selected */}
                  <span
                    aria-hidden
                    className={cn(
                      "inline-block h-2.5 w-2.5 rounded-full",
                      active && "animate-pulse",
                      dotColor
                    )}
                  />
                  <div className="truncate text-sm font-semibold leading-6">
                    {r.title?.trim() ? (
                      r.title
                    ) : (
                      <span className="italic text-muted-foreground">No Title</span>
                    )}
                  </div>
                  {dateStr ? (
                    <div className="shrink-0 text-[10px] leading-none text-muted-foreground">
                      {dateStr}
                    </div>
                  ) : null}
                </div>
                <div className="mt-1 flex flex-wrap gap-1 text-xs">
                  {r.opponent ? (
                    <span className="rounded-full bg-[hsl(var(--muted)/.6)] px-2 py-0.5 text-[11px] text-muted-foreground">
                      {r.opponent}
                    </span>
                  ) : null}
                  {r.lane ? (
                    <span className="rounded-full bg-[hsl(var(--muted)/.6)] px-2 py-0.5 text-[11px] text-muted-foreground">
                      {r.lane}
                    </span>
                  ) : null}
                  {res ? (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px]",
                        res === "Win"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-rose-500/20 text-rose-300"
                      )}
                    >
                      {res === "Win" ? "W" : "L"}
                    </span>
                  ) : r.side ? (
                    <span className="rounded-full bg-[hsl(var(--muted)/.6)] px-2 py-0.5 text-[11px] text-muted-foreground">
                      {r.side}
                    </span>
                  ) : null}
                  {scoreTxt ? (
                    <span className="rounded-full bg-[hsl(var(--muted)/.6)] px-2 py-0.5 text-[11px] text-muted-foreground">
                      {scoreTxt}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Right controls — fixed width; circular icon button */}
              <div className="flex h-full w-10 items-center justify-end">
                {onDelete ? (
                  <IconButton
                    aria-label="Delete review"
                    circleSize="sm"
                    iconSize="sm"
                    tone="danger"
                    className="opacity-0 group-hover/review:opacity-100 group-focus-within/review:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(r.id);
                    }}
                  >
                    <Trash2 />
                  </IconButton>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
