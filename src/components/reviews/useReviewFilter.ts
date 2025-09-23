"use client";

import { useMemo } from "react";
import type { Review } from "@/lib/types";
import { ts } from "@/lib/date";
import { getSearchBlob } from "./reviewSearch";

export type SortKey = "newest" | "oldest" | "title";

export function useReviewFilter(
  base: Review[],
  q: string,
  sort: SortKey,
): Review[] {
  return useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list =
      needle.length === 0
        ? [...base]
        : base.filter((r) => getSearchBlob(r).includes(needle));

    if (sort === "newest")
      list.sort((a, b) => ts(b?.createdAt) - ts(a?.createdAt));
    if (sort === "oldest")
      list.sort((a, b) => ts(a?.createdAt) - ts(b?.createdAt));
    if (sort === "title")
      list.sort((a, b) =>
        (a?.title || "").localeCompare(b?.title || "", undefined, {
          sensitivity: "base",
        }),
      );

    return list;
  }, [base, q, sort]);
}
