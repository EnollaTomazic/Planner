"use client";

import * as React from "react";
import { reportFeatureFlagAnalytics } from "@/lib/feature-flags";

type DepthThemeContextValue = {
  enabled: boolean;
  organicDepthEnabled: boolean;
};

const defaultContext: DepthThemeContextValue = Object.freeze({
  enabled: false,
  organicDepthEnabled: false,
});

const DepthThemeContext = React.createContext<DepthThemeContextValue>(defaultContext);

type DepthThemeProviderProps = {
  enabled: boolean;
  organicDepthEnabled?: boolean;
  children: React.ReactNode;
};

export function DepthThemeProvider({
  enabled,
  organicDepthEnabled = false,
  children,
}: DepthThemeProviderProps): JSX.Element {
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
    reportFeatureFlagAnalytics({
      flag: "depth-theme",
      enabled,
      state: enabled ? "enabled" : "legacy",
    });
  }, [enabled]);

  React.useEffect(() => {
    reportFeatureFlagAnalytics({
      flag: "depth-theme-organic",
      enabled: organicDepthEnabled,
      state: organicDepthEnabled ? "organic" : "legacy",
    });
  }, [organicDepthEnabled]);

  const value = React.useMemo<DepthThemeContextValue>(
    () => ({ enabled, organicDepthEnabled }),
    [enabled, organicDepthEnabled],
  );

  return <DepthThemeContext.Provider value={value}>{children}</DepthThemeContext.Provider>;
}

export function useDepthTheme(): DepthThemeContextValue {
  return React.useContext(DepthThemeContext);
}

export function useOrganicDepthEnabled(): boolean {
  return useDepthTheme().organicDepthEnabled;
}

export default DepthThemeProvider;
