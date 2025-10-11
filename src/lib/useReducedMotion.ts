"use client";

import { useMatchMedia } from "@/lib/react";

const QUERY = "(prefers-reduced-motion: reduce)";

function getReducedMotionPreference(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  try {
    return window.matchMedia(QUERY).matches;
  } catch {
    return false;
  }
}

export function prefersReducedMotion(): boolean {
  return getReducedMotionPreference();
}

export function usePrefersReducedMotion(): boolean {
  return useMatchMedia(QUERY, prefersReducedMotion);
}
