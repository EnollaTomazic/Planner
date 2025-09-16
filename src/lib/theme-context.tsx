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
  | readonly [ThemeState, React.Dispatch<React.SetStateAction<ThemeState>>]
  | undefined
>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = usePersistentState<ThemeState>(
    THEME_STORAGE_KEY,
    defaultTheme(),
  );

  React.useEffect(() => {
    applyTheme(theme);
  }, [theme]);

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
