"use client";

import * as React from "react";

const NO_ANIMATIONS_CLASS = "no-animations";

function isAnimationsDisabled(): boolean {
  if (typeof document === "undefined") {
    return false;
  }

  return document.documentElement.classList.contains(NO_ANIMATIONS_CLASS);
}

/**
 * Returns `true` when the global `no-animations` class is applied to the
 * `<html>` element. This mirrors the reduced motion toggle that we expose in
 * Storybook and the runtime animation toggle, ensuring components can opt out
 * of motion treatments.
 */
export function useAnimationsDisabled(): boolean {
  const [disabled, setDisabled] = React.useState(isAnimationsDisabled);

  React.useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;

    const sync = () => {
      setDisabled(root.classList.contains(NO_ANIMATIONS_CLASS));
    };

    sync();

    if (typeof MutationObserver === "undefined") {
      return;
    }

    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => {
      observer.disconnect();
    };
  }, []);

  return disabled;
}

