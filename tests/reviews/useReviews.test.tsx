import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type { Review } from "@/lib/types";

const sampleReviews: Review[] = [
  {
    id: "alpha",
    title: "Alpha Review",
    tags: ["macro"],
    pillars: [],
    createdAt: 1_000,
  },
  {
    id: "beta",
    title: "Beta Insight",
    tags: ["tempo"],
    pillars: ["Wave"],
    focusOn: true,
    createdAt: 2_000,
  },
  {
    id: "gamma",
    title: "Gamma Notes",
    tags: ["macro"],
    pillars: ["Tempo"],
    createdAt: 1_500,
  },
  {
    id: "delta",
    title: "Delta Review",
    tags: ["vision"],
    pillars: ["Comms"],
    focusOn: true,
    createdAt: 2_500,
  },
];

const setReviews = vi.fn();

vi.mock("@/lib/db", async () => {
  const actual = await vi.importActual<typeof import("@/lib/db")>("@/lib/db");
  return {
    ...actual,
    usePersistentState: vi
      .fn(() => [sampleReviews, setReviews] as const)
      .mockName("usePersistentState") as unknown as typeof actual.usePersistentState,
  };
});

import { useReviews } from "@/components/reviews";

describe("useReviews", () => {
  it("derives flagged counts and keeps recent sorting stable", () => {
    const originalOrder = sampleReviews.map((review) => review.id);

    const { result } = renderHook(() => useReviews());

    expect(result.current.totalCount).toBe(sampleReviews.length);
    expect(result.current.reviews).toBe(sampleReviews);
    expect(result.current.reviews.map((review) => review.id)).toEqual(
      originalOrder,
    );

    const flaggedIds = result.current.flaggedReviews.map((review) => review.id);
    expect(flaggedIds).toEqual(["beta", "delta"]);
    expect(result.current.flaggedReviewCount).toBe(flaggedIds.length);

    expect(result.current.recentReviews.map((review) => review.id)).toEqual([
      "delta",
      "beta",
      "gamma",
    ]);

    expect(sampleReviews.map((review) => review.id)).toEqual(originalOrder);
  });
});
