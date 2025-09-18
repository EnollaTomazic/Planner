"use client";

import * as React from "react";
import { Suspense } from "react";
import { Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  DashboardCard,
  QuickActions,
  TodayCard,
  GoalsCard,
  ReviewsCard,
  TeamPromptsCard,
  BottomNav,
  IsometricRoom,
  DashboardList,
} from "@/components/home";
import { PageHeader, PageShell, Button, ThemeToggle, Spinner } from "@/components/ui";
import { PlannerProvider } from "@/components/planner";
import { useTheme } from "@/lib/theme-context";
import { useThemeQuerySync } from "@/lib/theme-hooks";
import heroImage from "../../public/ChatGPT Image Sep 17, 2025, 05_45_34 AM.png";

type WeeklyHighlight = {
  id: string;
  title: string;
  schedule: string;
  summary: string;
};

const weeklyHighlights = [
  {
    id: "strategy-sync",
    title: "Strategy sync",
    schedule: "Today · 3:00 PM",
    summary: "Align backlog for the Q2 milestone and confirm owners.",
  },
  {
    id: "retro",
    title: "Sprint retro",
    schedule: "Wed · 11:00 AM",
    summary: "Collect insights to finalize review prompts and next sprint goals.",
  },
  {
    id: "review-window",
    title: "Review window",
    schedule: "Fri · All day",
    summary: "Encourage the team to log highlights before the week wraps.",
  },
] as const satisfies readonly WeeklyHighlight[];

function HomePageContent() {
  const [theme] = useTheme();
  useThemeQuerySync();

  return (
    <PlannerProvider>
      <PageShell as="main" aria-labelledby="home-header" className="relative isolate">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div
            className="h-full w-full rounded-card r-card-lg border border-border/40 bg-[hsl(var(--panel)/0.88)] shadow-neo-inset"
          />
        </div>
        <div className="relative z-10 py-6 space-y-6 md:space-y-8 md:pb-8">
          <section
            id="landing-hero"
            role="region"
            aria-label="Intro"
            className="relative grid grid-cols-12 gap-[var(--space-4)] rounded-card r-card-lg border border-border/40 bg-[hsl(var(--surface)/0.78)] p-[var(--space-4)] shadow-neoSoft backdrop-blur-md md:p-[var(--space-6)]"
          >
            <div className="col-span-12">
              <PageHeader
                header={{
                  id: "home-header",
                  heading: "Welcome to Planner",
                  subtitle: "Plan your day, track goals, and review games.",
                  icon: <Home className="opacity-80" />,
                  sticky: false,
                }}
                hero={{
                  heading: "Your day at a glance",
                  sticky: false,
                  topClassName: "top-0",
                  actions: (
                    <>
                      <ThemeToggle className="shrink-0" />
                      <Button
                        asChild
                        variant="primary"
                        size="sm"
                        className="px-4 whitespace-nowrap"
                      >
                        <Link href="/planner">Plan Week</Link>
                      </Button>
                    </>
                  ),
                  children: (
                    <div className="grid grid-cols-12 gap-[var(--space-4)] pt-[var(--space-4)]">
                      <figure className="col-span-12 md:col-start-7 md:col-span-6 lg:col-start-8 lg:col-span-5">
                        <div className="mx-auto w-full max-w-xl">
                          <Image
                            src={heroImage}
                            alt="Planner dashboard illustration showing widgets for today's focus, goals, and reviews"
                            className="w-full rounded-[var(--radius-2xl)] border border-[hsl(var(--border))] shadow-neoSoft"
                            sizes="(min-width: 1280px) 28vw, (min-width: 1024px) 32vw, (min-width: 768px) 45vw, 92vw"
                            width={1024}
                            height={1024}
                            priority
                          />
                        </div>
                      </figure>
                    </div>
                  ),
                }}
              />
            </div>
          </section>
          <div className="relative grid items-start gap-[var(--space-4)] md:grid-cols-12">
            <div className="md:col-span-6">
              <QuickActions />
            </div>
            <div className="md:col-span-6">
              <IsometricRoom variant={theme.variant} />
            </div>
          </div>
          <section className="relative grid grid-cols-1 gap-[var(--space-6)] md:grid-cols-12">
            <div className="md:col-span-4">
              <TodayCard />
            </div>
            <div className="md:col-span-4">
              <GoalsCard />
            </div>
            <div className="md:col-span-4">
              <ReviewsCard />
            </div>
            <div className="md:col-span-4">
              <DashboardCard
                title="Weekly focus"
                cta={{ label: "Open planner", href: "/planner" }}
              >
                <DashboardList
                  items={weeklyHighlights}
                  getKey={(highlight) => highlight.id}
                  itemClassName="py-3"
                  empty="No highlights scheduled"
                  renderItem={(highlight) => (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-ui font-medium">{highlight.title}</p>
                        <span className="text-label text-muted-foreground">
                          {highlight.schedule}
                        </span>
                      </div>
                      <p className="text-body text-muted-foreground">
                        {highlight.summary}
                      </p>
                    </div>
                  )}
                />
              </DashboardCard>
            </div>
            <div className="md:col-span-12">
              <TeamPromptsCard />
            </div>
          </section>
          <BottomNav />
        </div>
      </PageShell>
    </PlannerProvider>
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
