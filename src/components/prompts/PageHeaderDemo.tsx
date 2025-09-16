import * as React from "react";
import Image from "next/image";
import {
  PageHeader,
  Header,
  Hero,
  Button,
  ThemeToggle,
  IconButton,
  type HeaderTab,
} from "@/components/ui";
import { Bell, CircleUser } from "lucide-react";

type CompactNav = "summary" | "timeline" | "reports";

const compactNavItems: Array<{ key: CompactNav; label: string }> = [
  { key: "summary", label: "Summary" },
  { key: "timeline", label: "Timeline" },
  { key: "reports", label: "Reports" },
];

const compactNavCopy: Record<CompactNav, string> = {
  summary: "Monitor your squad's prep work and alignment at a glance.",
  timeline: "Track scrims and reviews across the day with zero context loss.",
  reports: "Spin up shareable insights from the latest competitive sessions.",
};

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
  const [activePrimaryNav, setActivePrimaryNav] =
    React.useState<CompactNav>("summary");
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<MinimalTab>("overview");
  const [activeFilter, setActiveFilter] = React.useState<HeroFilter>("all");
  const [query, setQuery] = React.useState("");

  const primaryNav = (
    <nav aria-label="Planner views" className="w-full">
      <ul className="flex items-center gap-1 list-none">
        {compactNavItems.map((item) => {
          const isActive = activePrimaryNav === item.key;
          return (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => setActivePrimaryNav(item.key)}
                data-state={isActive ? "active" : "inactive"}
                aria-current={isActive ? "page" : undefined}
                className="inline-flex items-center rounded-full border border-transparent px-3 py-1.5 text-label font-semibold uppercase tracking-[0.08em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=inactive]:hover:bg-[--hover] data-[state=inactive]:hover:text-foreground data-[state=active]:bg-[hsl(var(--card)/0.85)] data-[state=active]:text-foreground data-[state=active]:shadow-[0_0_0_1px_hsl(var(--ring)/0.35)]"
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  const utilityControls = (
    <>
      <ThemeToggle ariaLabel="Toggle theme" className="shrink-0" />
      <IconButton
        size="sm"
        aria-label="Show notifications"
        className="text-muted-foreground data-[state=active]:text-foreground"
        data-state="active"
      >
        <Bell className="h-4 w-4" />
      </IconButton>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={profileOpen}
        onClick={() => setProfileOpen((prev) => !prev)}
        onBlur={() => setProfileOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setProfileOpen(false);
            event.currentTarget.blur();
          }
        }}
        data-state={profileOpen ? "open" : "inactive"}
        className="inline-flex items-center gap-2 rounded-full border border-transparent bg-[hsl(var(--card)/0.55)] px-3 py-1.5 text-ui font-medium transition-colors hover:bg-[--hover] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-[hsl(var(--card)/0.85)]"
      >
        <CircleUser className="h-4 w-4" />
        <span className="hidden sm:inline">Profile</span>
      </button>
    </>
  );

  return (
    <div className="space-y-6">
      <Header
        eyebrow="Planner"
        heading="Compact Header"
        subtitle="Navigation & utilities"
        compact
        sticky={false}
        topClassName="top-0"
        nav={primaryNav}
        utilities={utilityControls}
        right={
          <Button
            size="sm"
            variant="primary"
            className="whitespace-nowrap"
          >
            Start session
          </Button>
        }
      >
        <p className="text-ui text-muted-foreground">
          {compactNavCopy[activePrimaryNav]}
        </p>
      </Header>

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
          <p className="text-ui text-muted-foreground">{tabCopy[activeTab]}</p>
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
        <p className="text-ui text-muted-foreground">
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
            <Image
              src="/planner-logo.svg"
              alt="Planner logo"
              width={48}
              height={48}
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
            <p className="text-ui text-muted-foreground">
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
