import { describe, expect, it } from "vitest";
import type { Review } from "@/lib/types";
import { getSearchBlob, primeReviewSearch } from "@/components/reviews/reviewSearch";

const cacheKey = Symbol.for("planner.reviews.searchCache");

type CachedSearch = {
  raw: string;
  blob: string;
  meta: {
    title: string;
    tags: string[];
    tagsLength: number;
    opponent?: string;
    lane?: string;
    side?: string;
    result?: string;
    patch?: string;
    duration?: string;
    notes?: string;
  };
};

function readCache(review: Review): CachedSearch | undefined {
  return (review as Record<PropertyKey, unknown>)[cacheKey] as
    | CachedSearch
    | undefined;
}

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
    const cached = readCache(review);
    expect(cached?.blob).toBe(firstBlob);
    expect(cached?.raw).toContain("Vision Drill");
    expect(cached?.raw).toContain("Macro Spacing");
    expect(cached?.raw).toContain("Ahri");
    expect(cached?.meta.title).toBe("Vision Drill");
    expect(cached?.meta.tagsLength).toBe(2);

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

    const cached = readCache(review);
    expect(cached).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(review, cacheKey)?.enumerable).toBe(
      false,
    );

    const blobAfterPrime = getSearchBlob(review);
    expect(blobAfterPrime).toBe(cached?.blob);
    expect((review as Record<PropertyKey, unknown>)[cacheKey]).toBe(cached);
  });

  it("refreshes cached metadata when search fields change", () => {
    const review: Review = {
      id: "r3",
      title: "Spacing Review",
      tags: ["Macro", "Spacing"],
      pillars: ["Tempo"],
      notes: "Track the jungler.",
      createdAt: 300,
    };

    const initialBlob = getSearchBlob(review);
    const initialCache = readCache(review);
    expect(initialCache?.meta.notes).toBe("Track the jungler.");
    expect(initialCache?.meta.tagsLength).toBe(2);

    review.notes = "Control vision before objectives.";
    const updatedBlob = getSearchBlob(review);
    expect(updatedBlob).not.toBe(initialBlob);
    expect(updatedBlob).toContain("control vision before objectives.");
    const updatedCache = readCache(review);
    expect(updatedCache).not.toBe(initialCache);
    expect(updatedCache?.meta.notes).toBe("Control vision before objectives.");

    review.tags.push("Tempo");
    const expandedBlob = getSearchBlob(review);
    expect(expandedBlob).toContain("tempo");
    const expandedCache = readCache(review);
    expect(expandedCache).not.toBe(updatedCache);
    expect(expandedCache?.meta.tagsLength).toBe(3);
    expect(expandedCache?.meta.tags).toBe(review.tags);
  });
});
