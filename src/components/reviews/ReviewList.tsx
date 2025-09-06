// src/components/reviews/ReviewList.tsx
"use client";

import React from "react";
import type { Review } from "@/lib/types";
import { cn } from "@/lib/utils";
import ReviewListItem from "./ReviewListItem";
import { Button } from "@/components/ui";
import { Tv } from "lucide-react";

export type ReviewListProps = {
  reviews: Review[];
  selectedId: string | null;
  onSelect?: (id: string) => void;
  className?: string;
};

export default function ReviewList({
  reviews,
  selectedId,
  onSelect,
  className,
}: ReviewListProps) {
  const count = reviews.length;

  if (count === 0) {
    return (
      <div
        className={cn(
          "max-w-[520px] mx-auto p-4 rounded-2xl border bg-card/60 backdrop-blur-sm",
          className
        )}
      >
        <div className="flex justify-end mb-3">
          <span className="text-sm text-muted-foreground">0 shown</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 p-6 text-sm text-muted-foreground">
          <Tv className="h-6 w-6 opacity-60" />
          <p>No reviews yet</p>
          <Button variant="primary">New Review</Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "max-w-[520px] mx-auto p-4 rounded-2xl border bg-card/60 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex justify-end mb-3">
        <span className="text-sm text-muted-foreground">{count} shown</span>
      </div>
      <div className="flex flex-col gap-3">
        {reviews.map((r) => (
          <ReviewListItem
            key={r.id}
            review={r}
            selected={r.id === selectedId}
            onClick={onSelect ? () => onSelect(r.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
