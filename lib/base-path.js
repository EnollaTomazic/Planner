/**
 * Collect normalized path segments from a string value.
 * @param {string | null | undefined} value
 * @returns {string[]}
 */
export const collectPathSegments = (value) => {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === "/") {
    return [];
  }

  return trimmed
    .split("/")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
};

/**
 * Normalize a base path so it can be consumed by Next.js and runtime helpers.
 * @param {string | null | undefined} value
 * @returns {string}
 */
export const normalizeBasePath = (value) => {
  const segments = collectPathSegments(value);
  return segments.length > 0 ? `/${segments.join("/")}` : "";
};
