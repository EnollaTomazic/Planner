"use client";

import * as React from "react";
import { usePersistentState } from "@/lib/db";
import {
  applyTheme,
  defaultTheme,
  BG_CLASSES,
  THEME_STORAGE_KEY,
  type ThemeState,
} from "@/lib/theme";

const ThemeContext = React.createContext<
  | readonly [ThemeState, React.Dispatch<React.SetStateAction<ThemeState>>]
  | undefined
>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = React.useState(false);
  const [theme, setTheme] = usePersistentState<ThemeState>(
    THEME_STORAGE_KEY,
    defaultTheme(),
  );
  const defaultThemeRef = React.useRef(defaultTheme());
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

    if (
      pendingPersistedSyncRef.current &&
      documentElement.dataset.themePref === "persisted" &&
      (themeClassMismatch || backgroundMismatch)
    ) {
      return;
    }

    pendingPersistedSyncRef.current = false;

    const defaultState = defaultThemeRef.current;
    const isDefaultSelection =
      theme.variant === defaultState.variant && theme.bg === defaultState.bg;
    const shouldPersistPreference =
      documentElement.dataset.themePref === "persisted" || !isDefaultSelection;

    if (shouldPersistPreference) {
      documentElement.dataset.themePref = "persisted";
    }

    applyTheme(theme);
  }, [theme, hydrated]);

  const value = React.useMemo(() => [theme, setTheme] as const, [theme, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
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

export default ThemeProvider;
