import type { Review } from "@/lib/types";

const SEARCH_CACHE_KEY = Symbol.for("planner.reviews.searchCache");

type SearchCacheMetadata =
  Pick<
    Review,
    | "title"
    | "tags"
    | "opponent"
    | "lane"
    | "side"
    | "result"
    | "patch"
    | "duration"
    | "notes"
  > & {
    tagsLength: number;
  };

type SearchCache = {
  raw: string;
  blob: string;
  meta: SearchCacheMetadata;
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

function captureMetadata(review: Review): SearchCacheMetadata {
  return {
    title: review.title,
    tags: review.tags,
    tagsLength: review.tags.length,
    opponent: review.opponent,
    lane: review.lane,
    side: review.side,
    result: review.result,
    patch: review.patch,
    duration: review.duration,
    notes: review.notes,
  };
}

function isCacheFresh(
  review: Review,
  metadata: SearchCacheMetadata,
): boolean {
  return (
    metadata.title === review.title &&
    metadata.tags === review.tags &&
    metadata.tagsLength === review.tags.length &&
    metadata.opponent === review.opponent &&
    metadata.lane === review.lane &&
    metadata.side === review.side &&
    metadata.result === review.result &&
    metadata.patch === review.patch &&
    metadata.duration === review.duration &&
    metadata.notes === review.notes
  );
}

export function getSearchBlob(review: Review): string {
  const searchable = review as SearchableReview;
  const cached = searchable[SEARCH_CACHE_KEY];
  if (cached && isCacheFresh(review, cached.meta)) return cached.blob;
  const raw = buildSearchSource(review);
  const blob = raw.toLowerCase();
  setCache(searchable, { raw, blob, meta: captureMetadata(review) });
  return blob;
}

export function primeReviewSearch(review: Review): Review {
  getSearchBlob(review);
  return review;
}
