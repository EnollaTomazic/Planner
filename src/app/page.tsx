"use client";

import * as React from "react";
import { Suspense } from "react";
import { Home } from "lucide-react";
import Link from "next/link";
import {
  DashboardCard,
  QuickActions,
  TodayCard,
  GoalsCard,
  ReviewsCard,
  TeamPromptsCard,
  IsometricRoom,
  DashboardList,
  WelcomeHeroFigure,
  HeroSummaryList,
  FocusDayCard,
  GoalMomentumCard,
  WeeklyCalendarCard,
  useHeroSummaryItems,
  useFocusDayCard,
  useGoalMomentumCard,
  useWeeklyCalendarCard,
} from "@/components/home";
import {
  PageHeader,
  PageShell,
  Button,
  ThemeToggle,
  Spinner,
} from "@/components/ui";
import { PlannerProvider } from "@/components/planner";
import { useTheme } from "@/lib/theme-context";
import { useThemeQuerySync } from "@/lib/theme-hooks";
import { cn } from "@/lib/utils";

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

function HeroPlannerSection() {
  const heroSummaryItems = useHeroSummaryItems();
  const focusDayCard = useFocusDayCard();
  const goalMomentumCard = useGoalMomentumCard();
  const weeklyCalendarCard = useWeeklyCalendarCard();

  return (
    <div className="pt-[var(--space-4)]">
      <div className="grid grid-cols-12 gap-[var(--space-4)]">
        <HeroSummaryList
          className="col-span-12 md:col-span-6 lg:col-span-4"
          items={heroSummaryItems}
        />
        <FocusDayCard
          className="col-span-12 md:col-span-6 lg:col-span-4"
          {...focusDayCard}
        />
        <GoalMomentumCard
          className="col-span-12 md:col-span-6 lg:col-span-4"
          {...goalMomentumCard}
        />
        <WeeklyCalendarCard
          className="col-span-12 md:col-span-12 lg:col-span-4"
          {...weeklyCalendarCard}
        />
      </div>
    </div>
  );
}

function HomePageContent() {
  const [theme] = useTheme();
  useThemeQuerySync();

  const floatingSurfaceClass =
    "relative z-10 isolate rounded-[var(--radius-2xl)] border border-border/50 bg-card/30 shadow-neoSoft backdrop-blur-lg";
  const floatingPaddingClass =
    "p-[var(--space-4)] md:p-[var(--space-5)]";

  return (
    <PlannerProvider>
      <PageShell
        as="main"
        aria-labelledby="home-header"
        className="py-[var(--space-6)] md:pb-[var(--space-8)]"
      >
        <div className="relative isolate rounded-[var(--radius-2xl)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] border border-border/40 bg-panel/70 shadow-neo-inset"
          />
          <div className="relative space-y-[var(--space-6)] p-[var(--space-4)] md:space-y-[var(--space-8)] md:p-[var(--space-5)]">
            <section
              id="landing-hero"
              role="region"
              aria-label="Intro"
              className="grid grid-cols-12 gap-[var(--space-4)] pb-[var(--space-2)] md:pb-[var(--space-3)]"
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
                      barVariant: "raised",
                      topClassName: "top-0",
                      actions: (
                        <div className="grid w-full grid-cols-12 gap-[var(--space-3)] sm:items-center">
                          <div className="col-span-12 flex w-full flex-wrap items-center justify-end gap-[var(--space-2)] sm:flex-nowrap md:col-span-8 lg:col-span-7">
                            <ThemeToggle className="shrink-0" />
                            <Button
                              asChild
                              variant="primary"
                              size="sm"
                              tactile
                              className="whitespace-nowrap px-4"
                            >
                              <Link href="/planner">Plan Week</Link>
                            </Button>
                          </div>
                          <WelcomeHeroFigure className="col-span-12 md:col-span-4 lg:col-span-5" />
                        </div>
                      ),
                      children: (
                        <HeroPlannerSection />
                    ),
                  }}
                />
              </div>
            </section>
            <div
              className={cn(
                "space-y-[var(--space-6)]",
                floatingSurfaceClass,
                floatingPaddingClass,
              )}
            >
              <div className="grid items-start gap-[var(--space-4)] md:grid-cols-12">
                <div className="md:col-span-6">
                  <QuickActions />
                </div>
                <div className="md:col-span-6">
                  <IsometricRoom variant={theme.variant} />
                </div>
              </div>
              <section className="grid grid-cols-1 gap-[var(--space-6)] md:grid-cols-12">
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
                      itemClassName="py-[var(--space-2)]"
                      empty="No highlights scheduled"
                      renderItem={(highlight) => (
                        <div className="flex flex-col gap-[var(--space-2)]">
                          <div className="flex items-baseline justify-between gap-[var(--space-3)]">
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
            </div>
          </div>
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
      <React.Fragment>
        <HomePageContent />
      </React.Fragment>
    </Suspense>
  );
}
