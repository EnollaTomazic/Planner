import type { Review } from "@/lib/types";

const SEARCH_CACHE_KEY = Symbol.for("planner.reviews.searchCache");

type SearchCache = {
  raw: string;
  blob: string;
};

type SearchableReview = Review & {
  [SEARCH_CACHE_KEY]?: SearchCache;
};

function collectSearchParts(review: Review): string[] {
  const parts: string[] = [];
  if (review.title) parts.push(review.title);
  if (Array.isArray(review.tags) && review.tags.length)
    parts.push(review.tags.join(" "));
  if (review.opponent) parts.push(review.opponent);
  if (review.lane) parts.push(review.lane);
  if (review.side) parts.push(review.side);
  if (review.result) parts.push(review.result);
  if (review.patch) parts.push(review.patch);
  if (review.duration) parts.push(review.duration);
  if (review.notes) parts.push(review.notes);
  return parts;
}

function buildSearchSource(review: Review): string {
  return collectSearchParts(review).join(" ");
}

function setCache(review: SearchableReview, cache: SearchCache) {
  Object.defineProperty(review, SEARCH_CACHE_KEY, {
    value: cache,
    configurable: true,
    enumerable: false,
    writable: true,
  });
}

export function getSearchBlob(review: Review): string {
  const searchable = review as SearchableReview;
  const raw = buildSearchSource(review);
  const cached = searchable[SEARCH_CACHE_KEY];
  if (cached && cached.raw === raw) return cached.blob;
  const blob = raw.toLowerCase();
  setCache(searchable, { raw, blob });
  return blob;
}

export function primeReviewSearch(review: Review): Review {
  getSearchBlob(review);
  return review;
}
