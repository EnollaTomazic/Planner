import { describe, expect, it } from "vitest";
import type { Review } from "@/lib/types";
import { getSearchBlob, primeReviewSearch } from "@/components/reviews/reviewSearch";

const cacheKey = Symbol.for("planner.reviews.searchCache");

describe("reviewSearch", () => {
  it("reuses cached blobs when the review content is unchanged", () => {
    const review: Review = {
      id: "r1",
      title: "Vision Drill",
      tags: ["Macro", "Spacing"],
      pillars: ["Tempo"],
      opponent: "Ahri",
      lane: "Mid",
      side: "Blue",
      result: "Win",
      patch: "14.1",
      duration: "32:10",
      notes: "Set up wards before objectives.",
      createdAt: 100,
    };

    const firstBlob = getSearchBlob(review);
    const cached = (review as Record<PropertyKey, unknown>)[cacheKey] as
      | { raw: string; blob: string }
      | undefined;
    expect(cached?.blob).toBe(firstBlob);
    expect(cached?.raw).toContain("Vision Drill");
    expect(cached?.raw).toContain("Macro Spacing");
    expect(cached?.raw).toContain("Ahri");

    const secondBlob = getSearchBlob(review);
    expect(secondBlob).toBe(firstBlob);
    expect((review as Record<PropertyKey, unknown>)[cacheKey]).toBe(cached);
  });

  it("primes the cache without changing the review reference", () => {
    const review: Review = {
      id: "r2",
      title: "Lane Control",
      tags: ["Wave"],
      pillars: ["Wave"],
      opponent: "Zed",
      notes: "Track jungle pressure.",
      createdAt: 200,
    };

    const primed = primeReviewSearch(review);
    expect(primed).toBe(review);

    const cached = (review as Record<PropertyKey, unknown>)[cacheKey] as
      | { raw: string; blob: string }
      | undefined;
    expect(cached).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(review, cacheKey)?.enumerable).toBe(
      false,
    );

    const blobAfterPrime = getSearchBlob(review);
    expect(blobAfterPrime).toBe(cached?.blob);
    expect((review as Record<PropertyKey, unknown>)[cacheKey]).toBe(cached);
  });
});
