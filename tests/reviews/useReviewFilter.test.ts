import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import type { Review } from "@/lib/types";
import { useReviewFilter, type SortKey } from "@/components/reviews/useReviewFilter";

const baseReviews: Review[] = [
  {
    id: "alpha",
    title: "Macro Check",
    tags: ["macro"],
    pillars: [],
    createdAt: 100,
  },
  {
    id: "beta-early",
    title: "Vision Drill",
    tags: ["vision"],
    pillars: ["Vision"],
    createdAt: 200,
  },
  {
    id: "beta-late",
    title: "Vision Drill",
    tags: ["vision"],
    pillars: ["Vision"],
    createdAt: 150,
  },
  {
    id: "gamma",
    title: "Rotation Study",
    tags: ["macro"],
    pillars: ["Tempo"],
    opponent: "Ahri",
    createdAt: 50,
  },
];

describe("useReviewFilter", () => {
  it("filters by query and respects each sort option", () => {
    type HookProps = { q: string; sort: SortKey };
    const { result, rerender } = renderHook(
      ({ q, sort }: HookProps) =>
        useReviewFilter(baseReviews, q, sort),
      { initialProps: { q: "  vision  ", sort: "newest" as SortKey } },
    );

    expect(result.current.map((review) => review.id)).toEqual([
      "beta-early",
      "beta-late",
    ]);

    rerender({ q: "", sort: "oldest" });
    expect(result.current.map((review) => review.id)).toEqual([
      "gamma",
      "alpha",
      "beta-late",
      "beta-early",
    ]);

    rerender({ q: "", sort: "title" });
    expect(result.current.map((review) => review.id)).toEqual([
      "alpha",
      "gamma",
      "beta-early",
      "beta-late",
    ]);

    expect(baseReviews.map((review) => review.id)).toEqual([
      "alpha",
      "beta-early",
      "beta-late",
      "gamma",
    ]);
  });
});
