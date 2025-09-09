// src/components/reviews/ReviewListItem.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { Review } from "@/lib/types";
import { Badge } from "@/components/ui";
import { shortDate } from "@/lib/date";

const itemBase =
  "review-tile relative w-full text-left h-auto min-h-[76px] p-4 rounded-lg border border-border/50 bg-card/60 scanlines noise jitter transition-all duration-200 hover:-translate-y-[1px] focus-visible:outline-none disabled:opacity-60 disabled:pointer-events-none";
const itemSelected = "review-tile--active";
const statusDotBase = "self-center justify-self-center h-2 w-2 rounded-full";
const statusDotWin = "bg-success";
const statusDotLoss = "bg-danger";
const statusDotDefault = "bg-muted-foreground";
const statusDotPulse = "animate-[pulse_2s_ease-in-out_infinite]";
const statusDotBlink = "animate-[blink_1s_steps(2)_infinite]";
const itemLoading = cn(itemBase, "animate-pulse");
const loadingLine = "h-3 rounded bg-muted";

export type ReviewListItemProps = {
  review?: Review;
  selected?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
};

export default function ReviewListItem({
  review,
  selected = false,
  disabled = false,
  loading = false,
  onClick,
}: ReviewListItemProps) {
  if (loading) {
    return (
      <div data-scope="reviews" className={itemLoading}>
        <div className={cn(loadingLine, "w-3/5 mb-3")} />
        <div className={cn(loadingLine, "w-2/5")} />
      </div>
    );
  }

  const title = review?.title?.trim() || "Untitled Review";
  const untitled = !review?.title?.trim();
  const subline = review?.notes?.trim() || "";
  const score = review?.score;
  const dateStr = review?.createdAt
    ? shortDate.format(new Date(review.createdAt))
    : "";

  return (
    <div data-scope="reviews">
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        aria-label={`Open review: ${title}`}
        data-selected={selected ? "true" : undefined}
        className={cn(itemBase, selected && itemSelected)}
      >
        <div className="grid grid-cols-[20px_1fr_auto] gap-3">
          <span
            aria-hidden
            className={cn(
              statusDotBase,
              statusDotBlink,
              review?.result === "Win"
                ? statusDotWin
                : review?.result === "Loss"
                ? statusDotLoss
                : statusDotDefault,
              review?.status === "new" && statusDotPulse
            )}
          />
          <div className="min-w-0 flex flex-col gap-1">
            <div
              className={cn(
                "truncate font-medium text-base",
                untitled && "text-muted-foreground/70"
              )}
              aria-label={untitled ? "Untitled Review" : undefined}
            >
              {title}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {typeof score === "number" ? (
                <Badge variant="accent" aria-label={`Rating ${score} out of 10`}>
                  {score}/10
                </Badge>
              ) : null}
              {subline ? (
                <span className="line-clamp-1 truncate">{subline}</span>
              ) : null}
            </div>
          </div>
          <span className="self-start text-xs text-muted-foreground whitespace-nowrap">
            {dateStr}
          </span>
        </div>
      </button>
    </div>
  );
}
