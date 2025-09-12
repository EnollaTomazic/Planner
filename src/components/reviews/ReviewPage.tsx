"use client";

import * as React from "react";
import type { Review } from "@/lib/types";
import { usePersistentState, uid } from "@/lib/db";
import ReviewsPage from "./ReviewsPage";

/**
 * ReviewPage — container with local-first persistence.
 * Hydration-safe: usePersistentState returns initial value on first render, then loads.
*/
export default function ReviewPage() {
  const [reviews, setReviews] = usePersistentState<Review[]>("reviews.v1", []);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  // After local DB hydration, select the first review if none is chosen
  React.useEffect(() => {
    if (!selectedId && reviews.length > 0) {
      setSelectedId(reviews[0].id);
    }
  }, [reviews, selectedId]);

  // Auto-heal selection if the selected review gets deleted or doesn't exist yet
  React.useEffect(() => {
    if (selectedId && !reviews.some(r => r.id === selectedId)) {
      setSelectedId(reviews[0]?.id ?? null);
    }
  }, [reviews, selectedId]);

  const onCreate = React.useCallback(() => {
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
    setReviews(prev => [fresh, ...prev]);
    setSelectedId(fresh.id);
  }, [setReviews]);

  const onSelect = React.useCallback((id: string) => setSelectedId(id), []);

  const patchById = React.useCallback((id: string, patch: Partial<Review>) => {
    setReviews(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));
  }, [setReviews]);

  const onRename = React.useCallback((id: string, nextTitle: string) => {
    patchById(id, { title: (nextTitle || "").trim() || "Untitled Review" });
  }, [patchById]);

  const onDelete = React.useCallback((id: string) => {
    setReviews(prev => prev.filter(r => r.id !== id));
    setSelectedId(prev => (prev === id ? null : prev));
  }, [setReviews]);

  const onChangeNotes = React.useCallback((id: string, nextNotes: string) => {
    patchById(id, { notes: nextNotes });
  }, [patchById]);

  const onChangeTags = React.useCallback((id: string, nextTags: string[]) => {
    patchById(id, { tags: nextTags });
  }, [patchById]);

  const onChangeMeta = React.useCallback((id: string, patch: Partial<Review>) => {
    patchById(id, patch);
  }, [patchById]);

  const safeSelectedId = React.useMemo(
    () => (reviews.some(r => r.id === selectedId) ? selectedId : null),
    [reviews, selectedId]
  );

  return (
    <ReviewsPage
      reviews={reviews}                 
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
