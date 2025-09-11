"use client";

import * as React from "react";
import { Suspense } from "react";
import {
  QuickActions,
  TodayCard,
  GoalsCard,
  ReviewsCard,
  TeamPromptsCard,
  BottomNav,
} from "@/components/home";
import Hero from "@/components/ui/layout/Hero";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTheme } from "@/lib/theme-context";
import {
  VARIANTS,
  BG_CLASSES,
  type Variant,
  type Background,
} from "@/lib/theme";

function HomePageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [theme, setTheme] = useTheme();

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const themeParam = searchParams.get("theme");
    const bgParam = searchParams.get("bg");
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
  }, [searchParams, setTheme]);

  React.useEffect(() => {
    const currentTheme = searchParams.get("theme");
    const currentBg = searchParams.get("bg");
    if (currentTheme === theme.variant && currentBg === String(theme.bg)) {
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("theme", theme.variant);
    params.set("bg", String(theme.bg));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [theme, router, pathname, searchParams]);

  return (
    <main
      aria-labelledby="home-header"
      className="page-shell py-6 space-y-6 md:space-y-8"
    >
      <header id="home-header" className="space-y-1">
        <h1 className="text-2xl font-semibold">Welcome to Planner</h1>
        <p className="text-sm text-muted-foreground">
          Plan your day, track goals, and review games.
        </p>
      </header>
      <Hero heading="Hero" />
      <QuickActions theme={theme} setTheme={setTheme} />
      <section className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="md:col-span-4">
          <TodayCard />
        </div>
        <div className="md:col-span-4">
          <GoalsCard />
        </div>
        <div className="md:col-span-4">
          <ReviewsCard />
        </div>
        <div className="md:col-span-12">
          <TeamPromptsCard />
        </div>
      </section>
      <BottomNav />
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <HomePageContent />
    </Suspense>
  );
}
