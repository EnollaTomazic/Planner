"use client";

import * as React from "react";

import { observeMediaQuery } from "@/lib/react";

function detectCoarsePointer() {
  if (typeof window === "undefined") {
    return false;
  }

  const nav = window.navigator as Navigator & {
    maxTouchPoints?: number;
    msMaxTouchPoints?: number;
  };

  if (typeof nav.maxTouchPoints === "number" && nav.maxTouchPoints > 0) {
    return true;
  }

  if (typeof nav.msMaxTouchPoints === "number" && nav.msMaxTouchPoints > 0) {
    return true;
  }

  if (typeof window.matchMedia !== "function") {
    return false;
  }

  try {
    return ["(pointer: coarse)", "(hover: none)"].some((query) =>
      window.matchMedia(query).matches,
    );
  } catch {
    return false;
  }
}

/**
 * Detects whether the current pointer prefers coarse interactions (e.g. touch).
 * Falls back to hover heuristics when matchMedia isn't available.
 */
export function useCoarsePointer() {
  const [isCoarse, setIsCoarse] = React.useState(() => detectCoarsePointer());

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    setIsCoarse(detectCoarsePointer());

    return observeMediaQuery("(hover: none)", (matches) => {
      setIsCoarse(matches || detectCoarsePointer());
    });
  }, []);

  return isCoarse;
}
