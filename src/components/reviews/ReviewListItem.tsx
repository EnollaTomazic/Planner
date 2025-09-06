// src/components/reviews/ReviewListItem.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { Review } from "@/lib/types";
import { Badge } from "@/components/ui";

const itemBase =
  "relative w-full text-left h-auto min-h-[76px] p-4 rounded-[16px] border shadow-[0_0_0_1px_hsl(var(--border)/0.12)] bg-[hsl(var(--card)/0.60)] scanlines noise jitter transition-all duration-200 hover:ring-1 hover:ring-[hsl(var(--accent))/0.18] hover:shadow-[0_0_24px_0_hsl(var(--accent)/0.10)] hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))] focus-visible:ring-[hsl(var(--accent))] disabled:opacity-60 disabled:pointer-events-none";
const itemSelected =
  "ring-2 ring-[hsl(var(--accent))] shadow-[0_0_32px_0_hsl(var(--accent)/0.18)]";
const statusDotBase = "self-center justify-self-center h-2 w-2 rounded-full";
const statusDotWin = "bg-[hsl(var(--success))]";
const statusDotDefault = "bg-[hsl(var(--muted-foreground))]";
const statusDotPulse = "animate-[pulse_2s_ease-in-out_infinite]";

function formatDate(value: number | Date): string {
  const d = typeof value === "number" ? new Date(value) : value;
  return d.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

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
      <div className="min-h-[76px] p-4 rounded-[16px] border bg-[hsl(var(--card)/0.60)] shadow-[0_0_0_1px_hsl(var(--border)/0.12)] animate-pulse">
        <div className="h-3 w-3/5 rounded bg-[hsl(var(--muted))] mb-3" />
        <div className="h-3 w-2/5 rounded bg-[hsl(var(--muted))]" />
      </div>
    );
  }

  const title = review?.title?.trim() || "Untitled Review";
  const untitled = !review?.title?.trim();
  const subline = review?.notes?.trim() || "";
  const score = review?.score;
  const resultTag = review?.result ? review.result[0] : undefined;
  const dateStr = review?.createdAt ? formatDate(review.createdAt) : "";

  return (
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
            review?.result === "Win" ? statusDotWin : statusDotDefault,
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
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            {typeof score === "number" ? (
              <Badge variant="accent" aria-label={`Rating ${score} out of 10`}>
                {score}/10
              </Badge>
            ) : null}
            {resultTag ? (
              <Badge
                variant="neutral"
                className="px-1.5 py-0.5 text-[10px] tracking-wide rounded-md"
              >
                {resultTag}
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
  );
}
