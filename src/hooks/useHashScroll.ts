"use client";

import * as React from "react";

import scrollToHash, { type ScrollToHashOptions } from "../lib/scrollToHash";

type UseHashScrollOptions = ScrollToHashOptions & {
  /**
   * Specific hash value to scroll to. Defaults to `window.location.hash`.
   */
  hash?: string | null;
  /**
   * When false, the hook only scrolls on mount and ignores future hash changes.
   */
  observeHashChange?: boolean;
};

const getHashFromUrl = (url: string): string => {
  try {
    return new URL(url).hash;
  } catch {
    return "";
  }
};

/**
 * React hook that scrolls to a hash target on mount and whenever the browser hash changes.
 *
 * @param options Hash scrolling configuration forwarded to {@link scrollToHash}.
 */
const useHashScroll = ({
  hash,
  observeHashChange = true,
  container,
  behavior,
  block,
  inline,
  focus,
}: UseHashScrollOptions = {}): void => {
  React.useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const scrollOptions: ScrollToHashOptions = {
      container,
      behavior,
      block,
      inline,
      focus,
    };

    const initialHash = hash ?? window.location.hash;
    let animationFrame: number | undefined;

    if (initialHash) {
      animationFrame = window.requestAnimationFrame(() => {
        scrollToHash(initialHash, scrollOptions);
      });
    }

    if (!observeHashChange) {
      return () => {
        if (animationFrame !== undefined) {
          window.cancelAnimationFrame(animationFrame);
        }
      };
    }

    const handleHashChange = (event: HashChangeEvent) => {
      const nextHash = getHashFromUrl(event.newURL) || window.location.hash;
      scrollToHash(nextHash, scrollOptions);
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      if (animationFrame !== undefined) {
        window.cancelAnimationFrame(animationFrame);
      }

      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [hash, observeHashChange, container, behavior, block, inline, focus]);
};

export type { UseHashScrollOptions };
export default useHashScroll;
