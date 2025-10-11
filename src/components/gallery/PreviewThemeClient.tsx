"use client";

import * as React from "react";
import { useTheme } from "@/lib/theme-context";
import { useThemeQuerySync } from "@/lib/theme-hooks";
import type { Background, Variant } from "@/lib/theme";

interface PreviewThemeClientProps {
  readonly variant: Variant;
  readonly background: Background;
}

export function PreviewThemeClient({
  variant,
  background,
}: PreviewThemeClientProps) {
  const [, setTheme] = useTheme();
  useThemeQuerySync();

  React.useEffect(() => {
    setTheme((current) => {
      if (current.variant === variant && current.bg === background) {
        return current;
      }
      return { variant, bg: background };
    });
  }, [variant, background, setTheme]);

  return null;
}
