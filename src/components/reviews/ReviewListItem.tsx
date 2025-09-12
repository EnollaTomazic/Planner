// src/components/reviews/ReviewListItem.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { Review } from "@/lib/types";
import { Badge } from "@/components/ui";

const shellBase = cn(
  "relative w-full text-left rounded-card r-card-lg p-3 bg-[hsl(var(--card)/0.9)] border border-[hsl(var(--border)/0.35)] transition-all duration-200 focus-visible:outline-none disabled:opacity-60 disabled:pointer-events-none",
  "hover:ring-2 hover:ring-[--theme-ring]",
  "data-[selected=true]:ring-2 data-[selected=true]:ring-[--theme-accent]",
);

const statusDotBase = "h-2 w-2 rounded-full ring-2";
const statusDotWin = "bg-success ring-success";
const statusDotLoss = "bg-danger ring-danger";
const statusDotDefault = "bg-muted-foreground ring-muted-foreground";
const statusDotPulse =
  "motion-safe:animate-[pulse_2s_ease-in-out_infinite] motion-reduce:animate-none";
const statusDotBlink =
  "motion-safe:animate-[blink_1s_steps(2)_infinite] motion-reduce:animate-none";
const itemLoading = cn(
  shellBase,
  "motion-safe:animate-pulse motion-reduce:animate-none",
);
const loadingLine = "h-3 rounded-md bg-muted";
const scoreBadge =
  "px-2 py-0.5 rounded-full text-xs leading-none font-medium text-background bg-gradient-to-br from-[--theme-accent] to-[--theme-accent2] ring-1 ring-[--theme-accent] [--ring:var(--theme-accent)]";

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
  const matchup = review?.matchup?.trim() || "";
  const score = review?.score;
  const role = review?.role;

  return (
    <button
      data-scope="reviews"
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={`Open review: ${title}`}
      data-selected={selected ? "true" : undefined}
      className={shellBase}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div
            className={cn(
              "truncate font-medium text-base",
              untitled && "text-muted-foreground/70",
            )}
            aria-label={untitled ? "Untitled Review" : undefined}
          >
            {title}
          </div>
          {matchup ? (
            <div className="truncate text-sm text-muted-foreground">
              {matchup}
            </div>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
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
                review?.status === "new" && statusDotPulse,
              )}
            />
            {role ? (
              <Badge
                variant="neutral"
                className="px-1 py-0 text-xs leading-none"
              >
                {role}
              </Badge>
            ) : null}
          </div>
          {typeof score === "number" ? (
            <span
              className={scoreBadge}
              aria-label={`Rating ${score} out of 10`}
            >
              {score}/10
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}
