"use client";

import * as React from "react";

export function useGlitchLandingSplash(
  glitchLandingEnabled: boolean,
  hydrated: boolean,
) {
  const initialSplashState = glitchLandingEnabled && !hydrated;
  const [isSplashVisible, setSplashVisible] = React.useState(
    () => initialSplashState,
  );
  const [isSplashMounted, setSplashMounted] = React.useState(
    () => initialSplashState,
  );

  const beginHideSplash = React.useCallback(() => {
    setSplashVisible((prev) => {
      if (!prev) {
        return prev;
      }
      return false;
    });
  }, []);

  React.useEffect(() => {
    if (!glitchLandingEnabled) {
      setSplashVisible(false);
      setSplashMounted(false);
      return;
    }
    if (!hydrated) {
      setSplashMounted(true);
      setSplashVisible(true);
      return;
    }
    beginHideSplash();
  }, [beginHideSplash, glitchLandingEnabled, hydrated]);

  const handleClientReady = React.useCallback(() => {
    beginHideSplash();
  }, [beginHideSplash]);

  const handleSplashExit = React.useCallback(() => {
    setSplashMounted(false);
  }, []);

  return {
    isSplashVisible,
    isSplashMounted,
    handleClientReady,
    handleSplashExit,
  } as const;
}

export function useHydratedCallback(hydrated: boolean, onReady?: () => void) {
  const hasAnnouncedReadyRef = React.useRef(false);

  React.useEffect(() => {
    if (!hydrated) {
      hasAnnouncedReadyRef.current = false;
      return;
    }
    if (!onReady || hasAnnouncedReadyRef.current) {
      return;
    }
    onReady();
    hasAnnouncedReadyRef.current = true;
  }, [hydrated, onReady]);
}
