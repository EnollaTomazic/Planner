import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { HomeHeroSection } from "@/components/home/home-landing/HomeHeroSection";
import { HeroPlannerCards } from "@/components/home/HeroPlannerCards";
import type { PlannerOverviewProps } from "@/components/home";
import { Button } from "@/components/ui";

const meta: Meta<typeof HomeHeroSection> = {
  title: "Home/LavenderGlitch",
  component: HomeHeroSection,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof HomeHeroSection>;

const mockPlannerOverview: PlannerOverviewProps = {
  hydrating: false,
  hydrated: true,
  summary: {
    label: "Weekly summary",
    title: "Highlights",
    items: [
      {
        key: "focus",
        label: "Focus days",
        value: "Tue & Thu",
        href: "#focus",
        cta: "Adjust",
      },
      {
        key: "reviews",
        label: "Reviews logged",
        value: "5 of 7",
        href: "#reviews",
        cta: "Open",
      },
      {
        key: "prompts",
        label: "AI prompts",
        value: "3 drafts",
        href: "#prompts",
        cta: "Review",
      },
    ],
  },
  focus: {
    label: "Today's focus",
    title: "Match review backlog",
    doneCount: 2,
    totalCount: 4,
    tasks: [
      {
        id: "task-1",
        title: "Pull top lane clips",
        projectName: "VOD Library",
        done: true,
        toggleLabel: "Toggle task",
      },
      {
        id: "task-2",
        title: "Draft retro prompts",
        projectName: "Team ritual",
        done: false,
        toggleLabel: "Toggle task",
      },
      {
        id: "task-3",
        title: "Confirm sparring slots",
        projectName: "Scrim prep",
        done: false,
        toggleLabel: "Toggle task",
      },
    ],
    remainingTasks: 2,
    onToggleTask: () => {},
  },
  goals: {
    label: "Goals",
    title: "Mission milestones",
    completed: 1,
    total: 3,
    percentage: 33,
    active: [
      { id: "goal-1", title: "Experiment with level-one invades", detail: "Run two scrim blocks" },
      { id: "goal-2", title: "Improve macro calls", detail: "Shadow review after each match" },
    ],
    emptyMessage: "No goals logged yet",
    allCompleteMessage: "All weekly goals complete",
  },
  calendar: {
    label: "Calendar",
    title: "Week timeline",
    summary: "Scrims Tue/Thu · Off-day Wed",
    doneCount: 4,
    totalCount: 6,
    hasPlannedTasks: true,
    days: Array.from({ length: 7 }, (_, index) => {
      const iso = new Date(Date.UTC(2024, 6, 8 + index)).toISOString().slice(0, 10);
      return {
        iso,
        weekday: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index],
        dayNumber: `${8 + index}`,
        done: index % 3,
        total: 4,
        disabled: false,
        loading: false,
        selected: index === 1,
        today: index === 2,
      };
    }),
    onSelectDay: () => {},
  },
  activity: {
    loading: false,
    hasData: true,
    totalCompleted: 12,
    totalScheduled: 18,
    points: Array.from({ length: 6 }, (_, index) => ({
      iso: `2024-07-0${index + 8}`,
      label: `Day ${index + 1}`,
      completed: Math.floor(Math.random() * 4) + 1,
      total: 4,
    })),
  },
};

const mockHighlights = [
  {
    id: "sync",
    title: "Strategy sync",
    schedule: "Today · 3:00 PM",
    summary: "Re-align on early jungle pathing & lane priorities.",
  },
  {
    id: "retro",
    title: "Sprint retro",
    schedule: "Wed · 11:00 AM",
    summary: "Collect insights before locking the next sprint.",
  },
  {
    id: "review",
    title: "Review window",
    schedule: "Fri · All day",
    summary: "Encourage highlights before the weekend cooldown.",
  },
];

const actions = (
  <div className="flex flex-wrap items-center gap-[var(--space-2)]">
    <Button size="sm" variant="secondary">
      Theme
    </Button>
    <Button size="sm" variant="default">
      Plan week
    </Button>
  </div>
);

const Template: React.FC = () => (
  <div className="flex flex-col gap-[var(--space-8)] bg-background p-[var(--space-6)]">
    <HomeHeroSection variant="lg" actions={actions} headingId="home-story-hero" />
    <HeroPlannerCards
      variant="lg"
      plannerOverviewProps={mockPlannerOverview}
      highlights={mockHighlights}
    />
  </div>
);

export const LavenderGlitch: Story = {
  render: () => <Template />,
};
