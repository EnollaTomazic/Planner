import * as React from "react";

import { slugify } from "./utils";

export type FieldNamingOptions = {
  /** Optional id override */
  id?: string;
  /** Optional name override */
  name?: string;
  /** Optional aria-label used to derive the name */
  ariaLabel?: string;
  /**
   * Controls when the aria-label should be used to derive the field name.
   * - "always": always attempt to use the aria-label slug.
   * - "custom-id": only use the aria-label when an explicit id is provided.
   * - "never": never use the aria-label slug.
   */
  ariaLabelStrategy?: "always" | "custom-id" | "never";
  /** When true, slugify the fallback name derived from the id. */
  slugifyFallback?: boolean;
};

export type FieldNamingResult = {
  id: string;
  name: string;
};

function normalizeGeneratedId(id: string): string {
  if (typeof id !== "string" || id.length === 0) {
    return id;
  }

  const replacedColons = id.replace(/:/g, "_");

  return replacedColons.replace(/([a-zA-Z])(\d)/g, "$1_$2");
}

export default function useFieldNaming(
  options: FieldNamingOptions = {},
): FieldNamingResult {
  const {
    id,
    name,
    ariaLabel,
    ariaLabelStrategy = "always",
    slugifyFallback = false,
  } = options;

  const generatedId = normalizeGeneratedId(React.useId());
  const finalId = id ?? generatedId;

  const fromAria = slugify(ariaLabel);
  const shouldUseAria =
    ariaLabelStrategy === "always"
      ? true
      : ariaLabelStrategy === "custom-id"
        ? Boolean(id)
        : false;

  const fallbackName = slugifyFallback ? slugify(finalId) : finalId;

  const finalName =
    name ||
    (shouldUseAria ? fromAria || undefined : undefined) ||
    fallbackName;

  return { id: finalId, name: finalName };
}
