"use client";

import * as React from "react";
import { Suspense } from "react";
import { Home } from "lucide-react";
import {
  QuickActions,
  TodayCard,
  GoalsCard,
  ReviewsCard,
  TeamPromptsCard,
  BottomNav,
  IsometricRoom,
} from "@/components/home";
import Hero from "@/components/ui/layout/Hero";
import Header from "@/components/ui/layout/Header";
import { Spinner } from "@/components/ui";
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
      <Header
        id="home-header"
        heading="Welcome to Planner"
        subtitle="Plan your day, track goals, and review games."
        icon={<Home className="opacity-80" />}
      />
      <Hero
        topClassName="top-[var(--header-stack)]"
        heading="Your day at a glance"
      />
      <div className="grid gap-4 md:grid-cols-2 items-start">
        <QuickActions theme={theme} setTheme={setTheme} />
        <IsometricRoom variant={theme.variant} />
      </div>
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
    <Suspense
      fallback={
        <div className="flex justify-center p-6">
          <Spinner />
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
