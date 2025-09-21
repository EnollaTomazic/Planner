"use client";

import type { Review } from "@/lib/types";
import { cn } from "@/lib/utils";
import { shortDate } from "@/lib/date";
import { IconButton } from "@/components/ui";
import Badge from "@/components/ui/primitives/Badge";
import { Pencil } from "lucide-react";

type ReviewCardState = "default" | "active" | "disabled" | "loading";

type ReviewCardProps = {
  review: Review;
  active: boolean;
  onRenameStart: () => void;
  state?: ReviewCardState;
};

export default function ReviewCard({
  review,
  active,
  onRenameStart,
  state,
}: ReviewCardProps) {
  const cardState: ReviewCardState = state ?? (active ? "active" : "default");
  const isDisabled = cardState === "disabled";
  const isLoading = cardState === "loading";
  const created = review.createdAt ? new Date(review.createdAt) : null;

  return (
    <div
      data-state={cardState}
      aria-disabled={isDisabled ? true : undefined}
      aria-busy={isLoading ? true : undefined}
      className={cn(
        "group rounded-card r-card-lg border border-border bg-card/85 p-[var(--space-3)]",
        "transition-colors transition-shadow duration-200 focus-visible:outline-none",
        "shadow-neoSoft",
        "hover:border-ring/60 hover:bg-card hover:shadow-ring",
        "focus-visible:border-ring focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:shadow-ring",
        "active:border-ring/70 active:bg-card/95 active:shadow-neo-strong active:ring-2 active:ring-ring/70",
        "data-[state=active]:border-ring data-[state=active]:shadow-ring",
        "data-[state=disabled]:pointer-events-none data-[state=disabled]:opacity-55 data-[state=disabled]:shadow-none data-[state=disabled]:ring-0 data-[state=disabled]:border-border/60 data-[state=disabled]:bg-muted/20 data-[state=disabled]:cursor-not-allowed",
        "data-[state=loading]:pointer-events-none data-[state=loading]:opacity-80 data-[state=loading]:shadow-outline-faint data-[state=loading]:cursor-progress",
      )}
    >
      <div className="flex items-start gap-[var(--space-2)]">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-[var(--space-2)]">
            <h3
              className={cn(
                "truncate font-semibold transition-colors",
                cardState === "active" && "title-glow",
              )}
            >
              {review.title || "Untitled Review"}
            </h3>
            <IconButton
              aria-label="Rename"
              size="sm"
              iconSize="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRenameStart();
              }}
            >
              <Pencil />
            </IconButton>
          </div>

          <div className="mt-[var(--space-1)] text-ui text-muted-foreground grid grid-cols-2 gap-[var(--space-2)]">
            <span>Opponent: {review.opponent || "—"}</span>
            <span>Lane: {review.lane || "—"}</span>
            <span>Side: {review.side || "—"}</span>
            <span>Patch: {review.patch || "—"}</span>
            <span>Duration: {review.duration || "—"}</span>
            <span>{created ? shortDate.format(created) : "—"}</span>
          </div>

          {Array.isArray(review.tags) && review.tags.length > 0 && (
            <div className="mt-[var(--space-2)] flex flex-wrap gap-[var(--space-2)]">
              {review.tags.slice(0, 6).map((t) => (
                <Badge key={t} size="sm" tone="accent">
                  {t}
                </Badge>
              ))}
              {review.tags.length > 6 && (
                <Badge size="sm" tone="accent">
                  +{review.tags.length - 6}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
