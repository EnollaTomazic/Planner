"use client";

import * as React from "react";
import { usePersistentState } from "@/lib/db";
import {
  applyTheme,
  defaultTheme,
  THEME_STORAGE_KEY,
  type ThemeState,
} from "@/lib/theme";

const ThemeContext = React.createContext<
  [ThemeState, React.Dispatch<React.SetStateAction<ThemeState>>] | undefined
>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeState = usePersistentState<ThemeState>(
    THEME_STORAGE_KEY,
    defaultTheme(),
  );
  const [theme] = themeState;

  React.useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={themeState}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

export default ThemeProvider;
