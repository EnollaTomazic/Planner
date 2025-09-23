"use client";

import * as React from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

type MediaQuery = Pick<MediaQueryList, "matches"> & {
  addEventListener?: MediaQueryList["addEventListener"];
  removeEventListener?: MediaQueryList["removeEventListener"];
  addListener?: MediaQueryList["addListener"];
  removeListener?: MediaQueryList["removeListener"];
};

function getMediaQuery(): MediaQuery | null {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return null;
  }

  return window.matchMedia(QUERY);
}

export function prefersReducedMotion(): boolean {
  return getMediaQuery()?.matches ?? false;
}

export function usePrefersReducedMotion(): boolean {
  const [reduceMotion, setReduceMotion] = React.useState(() =>
    prefersReducedMotion()
  );

  React.useEffect(() => {
    const mediaQuery = getMediaQuery();
    if (!mediaQuery) {
      return;
    }

    const handleChange = (event: MediaQueryListEvent) => {
      setReduceMotion(event.matches);
    };
    const handleLegacyChange = () => {
      setReduceMotion(mediaQuery.matches);
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
    } else if (typeof mediaQuery.addListener === "function") {
      mediaQuery.addListener(handleLegacyChange);
    }

    setReduceMotion(mediaQuery.matches);

    return () => {
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", handleChange);
      } else if (typeof mediaQuery.removeListener === "function") {
        mediaQuery.removeListener(handleLegacyChange);
      }
    };
  }, []);

  return reduceMotion;
}
