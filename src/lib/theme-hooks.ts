"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTheme } from "@/lib/theme-context";
import {
  VARIANTS,
  BG_CLASSES,
  type Variant,
  type Background,
} from "@/lib/theme";

export function useThemeQuerySync() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramsKey = searchParams.toString();
  const [theme, setTheme] = useTheme();

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(paramsKey);
    const themeParam = params.get("theme");
    const bgParam = params.get("bg");
    setTheme((prev) => {
      const next = { ...prev };
      if (themeParam && VARIANTS.some((v) => v.id === themeParam)) {
        next.variant = themeParam as Variant;
      }
      if (bgParam) {
        const idx = Number(bgParam);
        if (!Number.isNaN(idx) && idx >= 0 && idx < BG_CLASSES.length) {
          next.bg = idx as Background;
        }
      }
      if (next.variant === prev.variant && next.bg === prev.bg) {
        return prev;
      }
      return next;
    });
  }, [paramsKey, setTheme]);

  React.useEffect(() => {
    const params = new URLSearchParams(paramsKey);
    const currentTheme = params.get("theme");
    const currentBg = params.get("bg");
    if (currentTheme === theme.variant && currentBg === String(theme.bg)) {
      return;
    }
    params.set("theme", theme.variant);
    params.set("bg", String(theme.bg));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [theme, router, pathname, paramsKey]);
}
