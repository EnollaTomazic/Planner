"use client";

import * as React from "react";

type DepthThemeContextValue = {
  enabled: boolean;
  organicDepthEnabled: boolean;
};

const defaultContext: DepthThemeContextValue = Object.freeze({
  enabled: false,
  organicDepthEnabled: false,
});

const DepthThemeContext = React.createContext<DepthThemeContextValue>(defaultContext);

function reportDepthThemeAnalytics(enabled: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  const detail = {
    flag: "depth-theme",
    enabled,
    state: enabled ? "enabled" : "legacy",
  } as const;

  window.dispatchEvent(
    new CustomEvent("planner:feature-flag", {
      detail,
    }),
  );

  const plausible = (window as typeof window & {
    plausible?: (event: string, options?: { props?: Record<string, unknown> }) => void;
  }).plausible;

  if (typeof plausible === "function") {
    plausible("feature_flag", { props: detail });
  }

  const analytics = (window as typeof window & {
    analytics?: { track?: (event: string, properties?: Record<string, unknown>) => void };
  }).analytics;

  analytics?.track?.("feature_flag", detail);

  const dataLayer = (window as typeof window & {
    dataLayer?: unknown[];
  }).dataLayer;

  if (Array.isArray(dataLayer)) {
    dataLayer.push({
      event: "feature_flag",
      feature_flag: detail.flag,
      feature_flag_enabled: detail.enabled,
      feature_flag_state: detail.state,
    });
  }
}

type DepthThemeProviderProps = {
  enabled: boolean;
  organicDepthEnabled?: boolean;
  children: React.ReactNode;
};

export function DepthThemeProvider({
  enabled,
  organicDepthEnabled = false,
  children,
}: DepthThemeProviderProps) {
  React.useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const themeState = enabled ? "enabled" : "legacy";
    const organicState = organicDepthEnabled ? "organic" : "legacy";

    document.documentElement.dataset.depthTheme = themeState;
    document.documentElement.dataset.organicDepth = organicState;

    if (document.body) {
      document.body.dataset.depthTheme = themeState;
      document.body.dataset.organicDepth = organicState;
    }
  }, [enabled, organicDepthEnabled]);

  React.useEffect(() => {
    reportDepthThemeAnalytics(enabled);
  }, [enabled]);

  const value = React.useMemo<DepthThemeContextValue>(
    () => ({ enabled, organicDepthEnabled }),
    [enabled, organicDepthEnabled],
  );

  return <DepthThemeContext.Provider value={value}>{children}</DepthThemeContext.Provider>;
}

export function useDepthTheme(): DepthThemeContextValue {
  return React.useContext(DepthThemeContext);
}

export function useDepthThemeEnabled(): boolean {
  return useDepthTheme().enabled;
}

export function useOrganicDepthEnabled(): boolean {
  return useDepthTheme().organicDepthEnabled;
}

export default DepthThemeProvider;
