"use client";

import * as React from "react";
import { usePersistentState } from "@/lib/db";
import type { Review } from "@/lib/types";

const REVIEWS_STORAGE_KEY = "reviews.v1" as const;

export function useReviews() {
  const [reviews, setReviews] = usePersistentState<Review[]>(
    REVIEWS_STORAGE_KEY,
    [],
  );

  const totalCount = reviews.length;

  const flaggedReviews = React.useMemo(
    () => reviews.filter((review) => review.focusOn),
    [reviews],
  );

  const flaggedReviewCount = flaggedReviews.length;

  const recentReviews = React.useMemo(
    () =>
      [...reviews]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 3),
    [reviews],
  );

  return {
    reviews,
    setReviews,
    totalCount,
    flaggedReviews,
    flaggedReviewCount,
    recentReviews,
  } as const;
}
