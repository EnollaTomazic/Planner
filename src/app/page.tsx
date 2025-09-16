"use client";

import * as React from "react";
import { Suspense } from "react";
import { Home } from "lucide-react";
import Link from "next/link";
import {
  QuickActions,
  TodayCard,
  GoalsCard,
  ReviewsCard,
  TeamPromptsCard,
  BottomNav,
  IsometricRoom,
} from "@/components/home";
import { PageHeader, PageShell, Button, ThemeToggle, Spinner } from "@/components/ui";
import { useTheme } from "@/lib/theme-context";
import { useThemeQuerySync } from "@/lib/theme-hooks";

function HomePageContent() {
  const [theme] = useTheme();
  useThemeQuerySync();

  return (
    <PageShell
      as="main"
      aria-labelledby="home-header"
      className="py-6 space-y-6 md:space-y-8 md:pb-8"
    >
      <section
        id="landing-hero"
        role="region"
        aria-label="Intro"
        className="relative grid grid-cols-12 gap-4"
      >
        <div className="col-span-12">
          <PageHeader
            className="sticky top-0"
            header={{
              id: "home-header",
              heading: "Welcome to Planner",
              subtitle: "Plan your day, track goals, and review games.",
              icon: <Home className="opacity-80" />,
            }}
            hero={{
              heading: "Your day at a glance",
              actions: (
                <>
                  <ThemeToggle className="shrink-0" />
                  <Link href="/planner">
                    <Button
                      variant="primary"
                      size="sm"
                      className="px-4 whitespace-nowrap"
                    >
                      Plan Week
                    </Button>
                  </Link>
                </>
              ),
            }}
          />
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-12 items-start">
        <div className="md:col-span-6">
          <QuickActions />
        </div>
        <div className="md:col-span-6">
          <IsometricRoom variant={theme.variant} />
        </div>
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
    </PageShell>
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
