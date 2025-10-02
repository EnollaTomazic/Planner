"use client";

import * as React from "react";
import { usePersistentState } from "@/lib/db";
import {
  isPillar,
  isRole,
  isSide,
  type Pillar,
  type Review,
  type ReviewMarker,
} from "@/lib/types";

const REVIEWS_STORAGE_KEY = "reviews.v1" as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function decodeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const result: string[] = [];
  for (const entry of value) {
    if (typeof entry === "string") {
      result.push(entry);
    }
  }
  return result;
}

function decodePillarArray(value: unknown): Pillar[] {
  if (!Array.isArray(value)) return [];
  const result: Pillar[] = [];
  for (const entry of value) {
    if (isPillar(entry)) {
      result.push(entry);
    }
  }
  return result;
}

function decodeReviewMarker(value: unknown): ReviewMarker | null {
  if (!isRecord(value)) return null;
  const id = value["id"];
  const time = value["time"];
  const seconds = value["seconds"];
  const note = value["note"];
  if (typeof id !== "string") return null;
  if (typeof time !== "string") return null;
  if (typeof seconds !== "number" || !Number.isFinite(seconds)) return null;
  if (typeof note !== "string") return null;
  const marker: ReviewMarker = { id, time, seconds, note };
  if (typeof value["noteOnly"] === "boolean") {
    marker.noteOnly = value["noteOnly"];
  }
  return marker;
}

function decodeReview(value: unknown): Review | null {
  if (!isRecord(value)) return null;
  const id = value["id"];
  const title = value["title"];
  const createdAt = value["createdAt"];
  if (typeof id !== "string") return null;
  if (typeof title !== "string") return null;
  if (typeof createdAt !== "number" || !Number.isFinite(createdAt)) return null;
  const review: Review = {
    id,
    title,
    createdAt,
    tags: decodeStringArray(value["tags"]),
    pillars: decodePillarArray(value["pillars"]),
  };
  const opponent = value["opponent"];
  if (typeof opponent === "string") {
    review.opponent = opponent;
  }
  const lane = value["lane"];
  if (typeof lane === "string") {
    review.lane = lane;
  }
  const side = value["side"];
  if (isSide(side)) {
    review.side = side;
  }
  const patch = value["patch"];
  if (typeof patch === "string") {
    review.patch = patch;
  }
  const duration = value["duration"];
  if (typeof duration === "string") {
    review.duration = duration;
  }
  const matchup = value["matchup"];
  if (typeof matchup === "string") {
    review.matchup = matchup;
  }
  const notes = value["notes"];
  if (typeof notes === "string") {
    review.notes = notes;
  }
  const resultValue = value["result"];
  if (resultValue === "Win" || resultValue === "Loss") {
    review.result = resultValue;
  }
  const score = value["score"];
  if (typeof score === "number" && Number.isFinite(score)) {
    review.score = score;
  }
  const role = value["role"];
  if (isRole(role)) {
    review.role = role;
  }
  const focusOn = value["focusOn"];
  if (typeof focusOn === "boolean") {
    review.focusOn = focusOn;
  }
  const focus = value["focus"];
  if (typeof focus === "number" && Number.isFinite(focus)) {
    review.focus = focus;
  }
  const markersRaw = value["markers"];
  if (Array.isArray(markersRaw)) {
    const markers = markersRaw
      .map(decodeReviewMarker)
      .filter((marker): marker is ReviewMarker => marker !== null);
    if (markers.length > 0 || markersRaw.length === 0) {
      review.markers = markers;
    }
  }
  const status = value["status"];
  if (status === "new") {
    review.status = status;
  }
  return review;
}

export function decodeReviews(value: unknown): Review[] | null {
  if (!Array.isArray(value)) return null;
  const result: Review[] = [];
  for (const entry of value) {
    const review = decodeReview(entry);
    if (review) result.push(review);
  }
  return result;
}

export function useReviews() {
  const [reviews, setReviews] = usePersistentState<Review[]>(
    REVIEWS_STORAGE_KEY,
    [],
    { decode: decodeReviews },
  );
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

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
    isHydrated,
    totalCount,
    flaggedReviews,
    flaggedReviewCount,
    recentReviews,
  } as const;
}
