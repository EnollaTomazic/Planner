"use client";
import "../reviews/style.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Review } from "@/lib/types";
import { useLocalDB, uid } from "@/lib/db";
import ReviewsPage from "./ReviewsPage";

/**
 * ReviewPage — container with local-first persistence.
 * Hydration-safe: useLocalDB returns initial value on first render, then loads.
 */
export default function ReviewPage() {
  const [reviews, setReviews] = useLocalDB<Review[]>("reviews.v1", []);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
      tags: [],
      pillars: [],
      markers: [],        // required by type
      notes: "",
      createdAt: now,
    };
    setReviews(prev => [fresh, ...prev]);
    setSelectedId(fresh.id);
  }, [setReviews]);

  const onSelect = useCallback((id: string) => setSelectedId(id), []);

  const patchById = useCallback((id: string, patch: Partial<Review>) => {
    setReviews(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));
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