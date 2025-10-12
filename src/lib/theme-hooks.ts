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

export function useThemeQuerySync(): void {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramsKey = searchParams.toString();
  const params = React.useMemo(
    () => new URLSearchParams(paramsKey),
    [paramsKey],
  );
  const [theme, setTheme] = useTheme();

  React.useEffect(() => {
    if (typeof window === "undefined") return;
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
  }, [params, setTheme]);

  React.useEffect(() => {
    const currentTheme = params.get("theme");
    const currentBg = params.get("bg");
    if (currentTheme === theme.variant && currentBg === String(theme.bg)) {
      return;
    }
    const nextParams = new URLSearchParams(params);
    nextParams.set("theme", theme.variant);
    nextParams.set("bg", String(theme.bg));
    const queryString = nextParams.toString();
    const hashFragment =
      typeof window !== "undefined" ? window.location.hash ?? "" : "";
    const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(`${nextUrl}${hashFragment}`, { scroll: false });
  }, [theme, router, pathname, params]);
}
