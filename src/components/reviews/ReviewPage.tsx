"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Review } from "@/lib/types";
import { uid } from "@/lib/db";
import { ReviewsPage } from "./ReviewsPage";
import { primeReviewSearch } from "./reviewSearchCache";
import { useReviews } from "./useReviews";

/**
 * ReviewPage — container with local-first persistence.
 * Hydration-safe: usePersistentState returns initial value on first render, then loads.
*/
export function ReviewPage() {
  const { reviews, setReviews, isHydrated } = useReviews();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // After local DB hydration, select the first review if none is chosen
  useEffect(() => {
    if (!selectedId && reviews.length > 0) {
      setSelectedId(reviews[0].id);
    }
  }, [reviews, selectedId]);

  // Auto-heal selection if the selected review gets deleted or doesn't exist yet
  useEffect(() => {
    if (selectedId && !reviews.some(r => r.id === selectedId)) {
      setSelectedId(reviews[0]?.id ?? null);
    }
  }, [reviews, selectedId]);

  const onCreate = useCallback(() => {
    const now = Date.now();
    const fresh: Review = {
      id: uid("rev"),
      title: "Untitled Review",
      opponent: "",
      lane: "",
      side: "Blue",
      patch: "",
      duration: "",
      matchup: "",
      tags: [],
      pillars: [],
      markers: [],        // required by type
      notes: "",
      createdAt: now,
    };
    primeReviewSearch(fresh);
    setReviews(prev => [fresh, ...prev]);
    setSelectedId(fresh.id);
  }, [setReviews]);

  const onSelect = useCallback((id: string) => setSelectedId(id), []);

  const patchById = useCallback((id: string, patch: Partial<Review>) => {
    setReviews(prev =>
      prev.map(r => (r.id === id ? primeReviewSearch({ ...r, ...patch }) : r)),
    );
  }, [setReviews]);

  const onRename = useCallback((id: string, nextTitle: string) => {
    patchById(id, { title: (nextTitle || "").trim() || "Untitled Review" });
  }, [patchById]);

  const onDelete = useCallback((id: string) => {
    setReviews(prev => prev.filter(r => r.id !== id));
    setSelectedId(prev => (prev === id ? null : prev));
  }, [setReviews]);

  const onChangeNotes = useCallback((id: string, nextNotes: string) => {
    patchById(id, { notes: nextNotes });
  }, [patchById]);

  const onChangeTags = useCallback((id: string, nextTags: string[]) => {
    patchById(id, { tags: nextTags });
  }, [patchById]);

  const onChangeMeta = useCallback((id: string, patch: Partial<Review>) => {
    patchById(id, patch);
  }, [patchById]);

  const safeSelectedId = useMemo(
    () => (reviews.some(r => r.id === selectedId) ? selectedId : null),
    [reviews, selectedId]
  );

  return (
    <ReviewsPage
      reviews={reviews}
      loading={!isHydrated}
      selectedId={safeSelectedId}
      onSelect={onSelect}
      onCreate={onCreate}
      onRename={onRename}
      onDelete={onDelete}
      onChangeNotes={onChangeNotes}
      onChangeTags={onChangeTags}
      onChangeMeta={onChangeMeta}
    />
  );
}
