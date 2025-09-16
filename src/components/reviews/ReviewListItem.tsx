// src/components/reviews/ReviewListItem.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { Review } from "@/lib/types";
import Badge from "@/components/ui/primitives/Badge";

const shellBase = cn(
  "relative w-full text-left rounded-card r-card-lg p-3 bg-card/90 border border-border/35 transition-all duration-200 focus-visible:outline-none disabled:opacity-60 disabled:pointer-events-none disabled:bg-muted/20",
  "hover:bg-accent/10 hover:ring-2 hover:ring-theme",
  "focus-visible:bg-accent/15 focus-visible:ring-2 focus-visible:ring-theme",
  "active:bg-accent/20 active:ring-2 active:ring-theme",
  "data-[selected=true]:bg-accent/20 data-[selected=true]:ring-2 data-[selected=true]:ring-accent",
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
const scoreBadge = cn(
  "px-2 py-1 rounded-full text-label leading-none font-medium",
  "text-background ring-1 ring-accent bg-gradient-to-br from-accent to-accent-2",
  "hover:from-accent-foreground hover:to-accent-foreground hover:ring-accent-foreground",
  "focus-visible:from-accent-foreground focus-visible:to-accent-foreground focus-visible:ring-accent-foreground",
  "active:from-accent-foreground active:to-accent-foreground active:ring-accent-foreground",
);

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
              "truncate font-medium text-body",
              untitled && "text-muted-foreground/70",
            )}
            aria-label={untitled ? "Untitled Review" : undefined}
          >
            {title}
          </div>
          {matchup ? (
            <div className="truncate text-ui text-muted-foreground">
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
              <Badge size="xs" tone="neutral" className="px-1 py-0">
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
