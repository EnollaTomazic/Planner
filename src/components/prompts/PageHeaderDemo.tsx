import * as React from "react";
import {
  PageHeader,
  Header,
  Hero,
  Button,
  ThemeToggle,
  type HeaderTab,
} from "@/components/ui";

type MinimalTab = "overview" | "schedule" | "insights";

type HeroFilter = "all" | "flagged" | "reviewed";

const minimalTabs: HeaderTab<MinimalTab>[] = [
  { key: "overview", label: "Overview" },
  { key: "schedule", label: "Schedule" },
  { key: "insights", label: "Insights" },
];

const heroFilters: HeaderTab<HeroFilter>[] = [
  { key: "all", label: "All" },
  { key: "flagged", label: "Flagged" },
  { key: "reviewed", label: "Reviewed" },
];

const tabCopy: Record<MinimalTab, string> = {
  overview: "Track meetings, reviews, and highlights in one streamlined view.",
  schedule:
    "Preview your agenda and slot new scrim blocks without leaving the dashboard.",
  insights: "Surface trends and callouts tailored to your current sprint focus.",
};

const heroFilterCopy: Record<HeroFilter, string> = {
  all: "Monitor every scrim log and draft update with real-time filters.",
  flagged:
    "Follow up on clips that analysts flagged for fast review and follow-through.",
  reviewed:
    "Archive of plays already reviewed—perfect for pattern spotting and sharing.",
};

export default function PageHeaderDemo() {
  const [activeTab, setActiveTab] = React.useState<MinimalTab>("overview");
  const [activeFilter, setActiveFilter] = React.useState<HeroFilter>("all");
  const [query, setQuery] = React.useState("");

  return (
    <div className="space-y-6">
      <Header
        variant="minimal"
        eyebrow="Planner"
        heading="Minimal Header"
        subtitle="Lean chrome with neon focus"
        sticky={false}
        topClassName="top-0"
        rail={false}
        right={<ThemeToggle ariaLabel="Toggle theme" className="shrink-0" />}
        tabs={{
          items: minimalTabs,
          value: activeTab,
          onChange: setActiveTab,
          ariaLabel: "Switch dashboard view",
        }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground">{tabCopy[activeTab]}</p>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary">
              Invite teammate
            </Button>
            <Button size="sm" variant="primary">
              Create objective
            </Button>
          </div>
        </div>
      </Header>

      <Hero
        as="header"
        eyebrow="Scouting Hub"
        heading="Draft Intel"
        subtitle="Live scrim insights"
        sticky={false}
        topClassName="top-0"
        subTabs={{
          items: heroFilters,
          value: activeFilter,
          onChange: (key) => setActiveFilter(key as HeroFilter),
          ariaLabel: "Filter scouting intel",
        }}
        search={{
          id: "hero-demo-search",
          value: query,
          onValueChange: setQuery,
          debounceMs: 150,
          placeholder: "Search champions, comps, or notes…",
          "aria-label": "Search scouting intel",
        }}
        actions={
          <div className="flex items-center gap-2">
            <ThemeToggle ariaLabel="Toggle theme" className="shrink-0" />
            <Button
              size="sm"
              variant="primary"
              className="px-4 whitespace-nowrap"
            >
              New report
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">
          {heroFilterCopy[activeFilter]}
        </p>
      </Hero>

      <PageHeader
        id="page-header-demo"
        aria-labelledby="page-header-demo-heading"
        subTabs={{
          items: heroFilters,
          value: activeFilter,
          onChange: (key) => setActiveFilter(key as HeroFilter),
          ariaLabel: "Filter planner highlights",
        }}
        search={{
          id: "page-header-demo-search",
          value: query,
          onValueChange: setQuery,
          debounceMs: 200,
          placeholder: "Search upcoming scrims…",
          "aria-label": "Search planner highlights",
        }}
        header={{
          heading: (
            <span id="page-header-demo-heading">Welcome to Planner</span>
          ),
          subtitle: "Plan your day, track goals, and review games.",
          icon: (
            <img
              src="https://chatgpt.com/backend-api/estuary/content?id=file-PYBH1vD28Bzi3KruKxaiXa&ts=488268&p=fs&cid=1&sig=1e357c5433df95c196bb9530996ae68bb6ef1b29fde1a5dc741cdc1fce727ecb&v=0"
              alt=""
              className="h-12 w-auto object-contain"
            />
          ),
          sticky: false,
          rail: false,
          barClassName: "p-0",
        }}
        hero={{
          eyebrow: "Daily briefing",
          heading: "Your day at a glance",
          subtitle: "Stay synced with the squad",
          children: (
            <p className="text-sm text-muted-foreground">
              {heroFilterCopy[activeFilter]}
            </p>
          ),
          actions: (
            <>
              <ThemeToggle ariaLabel="Toggle theme" className="shrink-0" />
              <Button
                variant="primary"
                size="sm"
                className="px-4 whitespace-nowrap"
              >
                Plan Week
              </Button>
            </>
          ),
          sticky: false,
          topClassName: "top-0",
          barClassName: "p-0",
        }}
      />
    </div>
  );
}
