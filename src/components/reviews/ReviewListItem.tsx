// src/components/reviews/ReviewListItem.tsx
"use client";

import * as React from "react";
import { Button, Card } from "@/components/ui";
import { Badge } from "@/components/ui/primitives/Badge";
import type { Review } from "@/lib/types";
import { LOCALE, cn } from "@/lib/utils";

const statusDotBase =
  "h-[var(--space-2)] w-[var(--space-2)] rounded-full ring-2";
const statusDotWin = "bg-success ring-success";
const statusDotLoss = "bg-danger ring-danger";
const statusDotDefault = "bg-muted-foreground ring-muted-foreground";
const statusDotPulse =
  "motion-safe:animate-[pulse_2s_ease-in-out_infinite] motion-reduce:animate-none";
const statusDotBlink =
  "motion-safe:animate-[blink_1s_steps(2)_infinite] motion-reduce:animate-none";

const itemLoading = cn(
  "flex flex-col gap-[var(--space-3)] rounded-card r-card-lg border border-border/35 bg-card/70 p-[var(--space-4)]",
  "motion-safe:animate-pulse motion-reduce:animate-none",
);

const loadingLine = "h-[var(--space-3)] rounded-card bg-muted";

const scoreBadge = cn(
  "px-[var(--space-2)] py-[var(--space-1)] rounded-full text-ui leading-none font-medium",
  "text-accent-2-foreground ring-1 ring-[theme('colors.interaction.info.surfaceActive')] bg-accent-2",
  "hover:ring-[theme('colors.interaction.info.surfaceHover')]",
  "focus-visible:ring-[theme('colors.interaction.info.surfaceHover')]",
  "active:ring-[theme('colors.interaction.info.surfaceActive')]",
);

type ReviewListItemBaseProps = {
  review?: Review;
  selected?: boolean;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  onSelect?: () => void;
  onRename?: (nextTitle: string) => void;
  onDelete?: () => void;
};

export type ReviewListItemProps = ReviewListItemBaseProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, keyof ReviewListItemBaseProps>;

const MAX_SUMMARY_LENGTH = 160;

const ReviewListItemInner = (
  {
    review,
    selected = false,
    loading = false,
    className,
    disabled = false,
    onSelect,
    onRename,
    onDelete,
    ...rest
  }: ReviewListItemProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) => {
  const title = review?.title?.trim() || "Untitled Review";
  const untitled = !review?.title?.trim();
  const matchup = review?.matchup?.trim() || "";
  const score = review?.score;
  const role = review?.role;
  const result = review?.result;

  const side = review?.side ? `${review.side} side` : null;
  const opponent = review?.opponent?.trim()
    ? `vs ${review.opponent.trim()}`
    : null;
  const lane = review?.lane?.trim() || null;
  const contextParts = [side, opponent, lane].filter(Boolean);
  const contextLabel = contextParts.join(" • ");

  const createdAtLabel = React.useMemo(() => {
    if (!review?.createdAt) return "";
    const date = new Date(review.createdAt);
    if (Number.isNaN(date.getTime())) return "";
    try {
      return date.toLocaleDateString(LOCALE, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return date.toLocaleDateString();
    }
  }, [review?.createdAt]);

  const summary = React.useMemo(() => {
    const raw = review?.notes?.trim();
    if (!raw) return "";
    const normalized = raw.replace(/\s+/g, " ").trim();
    if (normalized.length <= MAX_SUMMARY_LENGTH) {
      return normalized;
    }
    return `${normalized.slice(0, MAX_SUMMARY_LENGTH).trimEnd()}…`;
  }, [review?.notes]);

  const handleSelect = React.useCallback<React.MouseEventHandler<HTMLDivElement>>(
    (event) => {
      if (disabled) return;
      if (event.defaultPrevented) return;
      if (event.target instanceof HTMLElement) {
        if (event.target.closest("[data-review-item-action='true']")) {
          return;
        }
      }
      onSelect?.();
    },
    [disabled, onSelect],
  );

  const handleKeyDown = React.useCallback<React.KeyboardEventHandler<HTMLDivElement>>(
    (event) => {
      if (disabled) return;
      if (event.defaultPrevented) return;
      if (event.currentTarget !== event.target) return;
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        onSelect?.();
      }
    },
    [disabled, onSelect],
  );

  const handleRename = React.useCallback(() => {
    if (disabled) return;
    if (!onRename || !review) return;
    const nextTitle = window.prompt("Rename review", title);
    if (nextTitle === null) return;
    onRename(nextTitle);
  }, [disabled, onRename, review, title]);

  if (loading) {
    return (
      <div data-scope="reviews" className={itemLoading}>
        <div
          className={cn(loadingLine, "w-3/5 mb-[var(--space-3)]")}
        />
        <div className={cn(loadingLine, "w-2/5")} />
      </div>
    );
  }

  const cardClassName = cn(
    "group relative flex flex-col gap-[var(--space-3)] transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
    !disabled &&
      "cursor-pointer hover:bg-card/75 active:bg-card/85 focus-visible:bg-card/80",
    disabled && "opacity-disabled",
    selected &&
      "bg-[theme('colors.interaction.accent.tintActive')] ring-2 ring-[theme('colors.interaction.accent.surfaceActive')]",
    className,
  );

  return (
    <Card
      ref={ref}
      data-scope="reviews"
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label={`Open review: ${title}`}
      aria-current={selected ? "true" : undefined}
      aria-disabled={disabled || undefined}
      data-disabled={disabled ? "true" : undefined}
      data-selected={selected ? "true" : undefined}
      depth={selected ? "raised" : "base"}
      className={cardClassName}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      <div className="flex items-start justify-between gap-[var(--space-3)]">
        <div className="flex flex-col gap-[var(--space-1)]">
          <span
            className={cn(
              "text-body font-medium text-card-foreground",
              untitled && "text-muted-foreground/80",
            )}
            aria-label={untitled ? "Untitled Review" : undefined}
          >
            {title}
          </span>
          <div className="flex flex-wrap items-center gap-x-[var(--space-2)] gap-y-[var(--space-1)] text-label text-muted-foreground">
            {createdAtLabel ? <span>{createdAtLabel}</span> : null}
            {contextLabel ? <span>{contextLabel}</span> : null}
            {matchup ? <span>{matchup}</span> : null}
          </div>
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

      <div className="flex flex-wrap items-center gap-[var(--space-2)] text-label text-muted-foreground">
        <span
          aria-hidden
          className={cn(
            statusDotBase,
            statusDotBlink,
            result === "Win"
              ? statusDotWin
              : result === "Loss"
                ? statusDotLoss
                : statusDotDefault,
            review?.status === "new" && statusDotPulse,
          )}
        />
        {result ? (
          <span className="font-medium text-card-foreground">{result}</span>
        ) : null}
        {role ? (
          <Badge
            size="sm"
            tone="neutral"
            className="px-[var(--space-1)]"
          >
            {role}
          </Badge>
        ) : null}
      </div>

      {summary ? (
        <p className="line-clamp-3 text-ui text-muted-foreground">{summary}</p>
      ) : null}

      {(onRename || onDelete) && (
        <div className="flex items-center justify-end gap-[var(--space-2)]" data-review-item-action="true">
          {onRename ? (
            <Button
              type="button"
              size="sm"
              variant="quiet"
              disabled={disabled}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                event.stopPropagation();
                handleRename();
              }}
            >
              Edit
            </Button>
          ) : null}
          {onDelete ? (
            <Button
              type="button"
              size="sm"
              variant="quiet"
              tone="danger"
              disabled={disabled}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                event.stopPropagation();
                onDelete();
              }}
            >
              Delete
            </Button>
          ) : null}
        </div>
      )}
    </Card>
  );
};

export const ReviewListItem = React.forwardRef<HTMLDivElement, ReviewListItemProps>(
  ReviewListItemInner,
);

ReviewListItem.displayName = "ReviewListItem";
