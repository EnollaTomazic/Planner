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
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { usePersistentState } from "@/lib/db";
import {
  applyTheme,
  defaultTheme,
  THEME_STORAGE_KEY,
  VARIANTS,
  BG_CLASSES,
  type ThemeState,
  type Variant,
  type Background,
} from "@/lib/theme";

function HomePageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [theme, setTheme] = usePersistentState<ThemeState>(
    THEME_STORAGE_KEY,
    defaultTheme(),
  );

  React.useEffect(() => {
    const t = setTimeout(() => {
      const themeParam = searchParams.get("theme");
      const bgParam = searchParams.get("bg");
      setTheme(prev => {
        const next = { ...prev };
        if (themeParam && VARIANTS.some(v => v.id === themeParam)) {
          next.variant = themeParam as Variant;
        }
        if (bgParam) {
          const idx = Number(bgParam);
          if (!Number.isNaN(idx) && idx >= 0 && idx < BG_CLASSES.length) {
            next.bg = idx as Background;
          }
        }
        return next;
      });
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("theme", theme.variant);
    params.set("bg", String(theme.bg));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [theme, router, pathname, searchParams]);

  return (
    <main className="page-shell py-6 space-y-6 md:space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Welcome to Planner</h1>
        <p className="text-sm text-muted-foreground">
          Plan your day, track goals, and review games.
        </p>
      </header>
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
