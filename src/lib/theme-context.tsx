"use client";

import * as React from "react";
import { usePersistentState } from "@/lib/db";
import { glitchLandingEnabled as glitchLandingDefault } from "@/lib/features";
import { reportFeatureFlagAnalytics } from "@/lib/feature-flags";
import {
  BG_CLASSES,
  THEME_STORAGE_KEY,
  VARIANTS,
  applyTheme,
  defaultTheme,
  decodeThemeState,
  type Background,
  type ThemeState,
  type Variant,
} from "@/lib/theme";

const ThemeContext = React.createContext<
  | readonly [ThemeState, React.Dispatch<React.SetStateAction<ThemeState>>]
  | undefined
>(undefined);

type ThemeFeatureFlags = {
  glitchLandingEnabled: boolean;
};

const ThemeFeatureFlagsContext = React.createContext<ThemeFeatureFlags>({
  glitchLandingEnabled: false,
});

type ThemeProviderProps = {
  children: React.ReactNode;
  glitchLandingEnabled?: boolean;
};

export function ThemeProvider({
  children,
  glitchLandingEnabled = glitchLandingDefault,
}: ThemeProviderProps): JSX.Element {
  const [hydrated, setHydrated] = React.useState(false);
  const defaultThemeValue = React.useMemo<ThemeState>(() => defaultTheme(), []);
  const initialThemeState = React.useMemo<ThemeState>(() => {
    if (typeof document === "undefined") {
      return defaultThemeValue;
    }

    const { documentElement } = document;
    if (!documentElement) {
      return defaultThemeValue;
    }

    const classList = documentElement.classList;
    const themeClass = Array.from(classList).find((className) =>
      className.startsWith("theme-"),
    );
    const rawVariant =
      typeof themeClass === "string"
        ? themeClass.slice("theme-".length)
        : null;
    const variantEntry = VARIANTS.find(({ id }) => id === rawVariant);
    const resolvedVariant: Variant = variantEntry
      ? variantEntry.id
      : defaultThemeValue.variant;

    const backgroundIndex = BG_CLASSES.findIndex(
      (className) =>
        className.length > 0 && classList.contains(className),
    );
    const resolvedBackground =
      backgroundIndex > 0
        ? (backgroundIndex as Background)
        : defaultThemeValue.bg;

    return { variant: resolvedVariant, bg: resolvedBackground };
  }, [defaultThemeValue]);

  const [theme, setTheme] = usePersistentState<ThemeState>(
    THEME_STORAGE_KEY,
    initialThemeState,
    { decode: decodeThemeState },
  );
  const defaultThemeRef = React.useRef(defaultThemeValue);
  const pendingPersistedSyncRef = React.useRef(true);

  React.useEffect(() => {
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (typeof document === "undefined") {
      return;
    }

    const { documentElement } = document;
    const expectedThemeClass = `theme-${theme.variant}`;
    const currentThemeClass = Array.from(documentElement.classList).find((className) =>
      className.startsWith("theme-"),
    );
    const currentBackgroundClass = BG_CLASSES.find(
      (className) => className && documentElement.classList.contains(className),
    );
    const expectedBackgroundClass =
      theme.bg > 0 && theme.bg < BG_CLASSES.length ? BG_CLASSES[theme.bg] : "";
    const themeClassMismatch =
      typeof currentThemeClass === "string" && currentThemeClass !== expectedThemeClass;
    const backgroundMismatch =
      typeof currentBackgroundClass === "string"
        ? currentBackgroundClass !== expectedBackgroundClass
        : expectedBackgroundClass !== "";

    const defaultState = defaultThemeRef.current;
    const isDefaultSelection =
      theme.variant === defaultState.variant && theme.bg === defaultState.bg;

    if (
      pendingPersistedSyncRef.current &&
      documentElement.dataset.themePref === "persisted" &&
      (themeClassMismatch || backgroundMismatch) &&
      !isDefaultSelection
    ) {
      return;
    }

    pendingPersistedSyncRef.current = false;

    const shouldPersistPreference =
      documentElement.dataset.themePref === "persisted" || !isDefaultSelection;

    if (shouldPersistPreference) {
      documentElement.dataset.themePref = "persisted";
    }

    applyTheme(theme);
  }, [theme, hydrated]);

  React.useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const state = glitchLandingEnabled ? "enabled" : "legacy";
    document.documentElement.dataset.glitchLanding = state;

    if (document.body) {
      document.body.dataset.glitchLanding = state;
    }
  }, [glitchLandingEnabled]);

  React.useEffect(() => {
    reportFeatureFlagAnalytics({
      flag: "ui-glitch-landing",
      enabled: glitchLandingEnabled,
      state: glitchLandingEnabled ? "enabled" : "legacy",
    });
  }, [glitchLandingEnabled]);

  const value = React.useMemo(() => [theme, setTheme] as const, [theme, setTheme]);
  const featureValue = React.useMemo<ThemeFeatureFlags>(
    () => ({ glitchLandingEnabled }),
    [glitchLandingEnabled],
  );

  return (
    <ThemeFeatureFlagsContext.Provider value={featureValue}>
      <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    </ThemeFeatureFlagsContext.Provider>
  );
}

export function useTheme(): readonly [
  ThemeState,
  React.Dispatch<React.SetStateAction<ThemeState>>,
] {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

export function useOptionalTheme():
  | readonly [ThemeState, React.Dispatch<React.SetStateAction<ThemeState>>]
  | undefined {
  return React.useContext(ThemeContext);
}

export function useUiFeatureFlags(): ThemeFeatureFlags {
  return React.useContext(ThemeFeatureFlagsContext);
}

export default ThemeProvider;
