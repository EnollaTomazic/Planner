// src/components/reviews/ReviewList.tsx
"use client";

import React from "react";
import type { Review } from "@/lib/types";
import { cn } from "@/lib/utils";
import ReviewListItem from "./ReviewListItem";
import { Button, Card } from "@/components/ui";
import { Tv } from "lucide-react";

export type ReviewListProps = {
  reviews: Review[];
  selectedId: string | null;
  onSelect?: (id: string) => void;
  onCreate?: () => void;
  className?: string;
};

export default function ReviewList({
  reviews,
  selectedId,
  onSelect,
  onCreate,
  className,
}: ReviewListProps) {
  const count = reviews.length;

  // Allow the list to grow with the sidebar instead of capping at 520px
  const containerClass = cn("w-full mx-auto backdrop-blur-sm", className);

  if (count === 0) {
    return (
      <Card className={containerClass}>
        <div className="ds-card-pad flex flex-col items-center justify-center gap-[var(--space-3)] text-center text-ui text-muted-foreground">
          <Tv className="size-[var(--space-5)] opacity-60" />
          <p>No reviews yet</p>
          <Button variant="primary" onClick={onCreate}>
            New Review
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={containerClass}>
      <ul className="flex flex-col gap-[var(--space-3)]">
        {reviews.map((r) => (
          <li key={r.id}>
            <ReviewListItem
              review={r}
              selected={r.id === selectedId}
              onClick={onSelect ? () => onSelect(r.id) : undefined}
            />
          </li>
        ))}
      </ul>
    </Card>
  );
}
