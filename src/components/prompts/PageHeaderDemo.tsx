"use client";

import * as React from "react";
import {
  PageHeader,
  Header,
  Hero,
  NeomorphicHeroFrame,
  Button,
  ThemeToggle,
  IconButton,
  SearchBar,
  type HeaderTab,
} from "@/components/ui";
import Image from "next/image";
import { withBasePath } from "@/lib/utils";
import { Bell, CircleUser } from "lucide-react";

const ICON_BUTTON_SIZE = "size-[var(--icon-size-sm)]";

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

const plannerLogoSrc = withBasePath("/planner-logo.svg");

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

export function PageHeaderDemo() {
  const [activePrimaryNav, setActivePrimaryNav] =
    React.useState<CompactNav>("summary");
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<MinimalTab>("overview");
  const [activeFilter, setActiveFilter] = React.useState<HeroFilter>("all");
  const [query, setQuery] = React.useState("");

  const primaryNav = (
    <nav aria-label="Planner views" className="w-full">
      <ul className="flex items-center gap-[var(--space-1)] list-none">
        {compactNavItems.map((item) => {
          const isActive = activePrimaryNav === item.key;
          return (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => setActivePrimaryNav(item.key)}
                data-state={isActive ? "active" : "inactive"}
                aria-current={isActive ? "page" : undefined}
                className="inline-flex items-center rounded-full border border-transparent px-[var(--space-3)] py-[var(--spacing-0-75)] text-label font-semibold uppercase tracking-[0.02em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=inactive]:hover:bg-[--hover] data-[state=inactive]:hover:text-foreground data-[state=active]:bg-[hsl(var(--card)/0.85)] data-[state=active]:text-foreground data-[state=active]:shadow-[0_0_0_var(--hairline-w)_hsl(var(--ring)/0.35)]"
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
        <Bell aria-hidden="true" className={ICON_BUTTON_SIZE} />
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
        className="inline-flex items-center gap-[var(--space-2)] rounded-full border border-transparent bg-[hsl(var(--card)/0.55)] px-[var(--space-3)] py-[var(--spacing-0-75)] text-ui font-medium transition-colors hover:bg-[--hover] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-[hsl(var(--card)/0.85)]"
      >
        <CircleUser aria-hidden="true" className={ICON_BUTTON_SIZE} />
        <span className="hidden sm:inline">Profile</span>
      </button>
    </>
  );

  return (
    <div className="space-y-[var(--space-6)]">
      <Header
        eyebrow="Planner"
        heading="Compact Header Layout with Balanced Wrapping"
        subtitle="Navigation & utilities stay aligned"
        compact
        sticky={false}
        topClassName="top-0"
        nav={primaryNav}
        utilities={utilityControls}
        right={
          <Button
            size="sm"
            variant="default"
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
        variant="quiet"
        eyebrow="Planner"
        heading="Minimal Header Layout for Extended Multi-line Titles"
        subtitle="Lean chrome with neon focus even when headlines wrap"
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
        <div className="flex flex-wrap items-center gap-[var(--space-3)]">
          <p className="text-ui text-muted-foreground">{tabCopy[activeTab]}</p>
          <div className="flex items-center gap-[var(--space-2)]">
            <Button size="sm" variant="neo">
              Invite teammate
            </Button>
            <Button size="sm" variant="default">
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
          <div className="flex items-center gap-[var(--space-2)]">
            <ThemeToggle ariaLabel="Toggle theme" className="shrink-0" />
            <Button
              size="sm"
              variant="default"
              className="px-[var(--space-4)] whitespace-nowrap"
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

      <NeomorphicHeroFrame
        as="section"
        variant="dense"
        align="end"
        label="Frame-ready hero"
        slots={{
          search: {
            node: (
              <SearchBar
                id="hero-flush-search"
                value={query}
                onValueChange={setQuery}
                debounceMs={150}
                placeholder="Search frame highlights…"
                aria-label="Search frame highlights"
              />
            ),
            label: "Search frame highlights",
          },
          actions: {
            node: (
              <Button size="sm" variant="neo" className="whitespace-nowrap">
                Assign scout
              </Button>
            ),
            label: "Frame quick actions",
          },
        }}
      >
        <div className="space-y-[var(--space-4)]">
          <Hero
            as="section"
            eyebrow="Frame-ready hero"
            heading="Flush supportive layout"
            subtitle="Let the outer frame handle breathing room."
            sticky={false}
            topClassName="top-0"
            tone="supportive"
            frame={false}
            rail={false}
            padding="none"
          >
            <p className="text-ui text-muted-foreground">
              When the hero sits inside another shell, drop its padding so the
              divider and actions align perfectly with the parent grid.
            </p>
          </Hero>
        </div>
      </NeomorphicHeroFrame>

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
            <span id="page-header-demo-heading">
              Welcome to Planner — plan smarter with multi-line titles
            </span>
          ),
          subtitle:
            "Plan your day, track goals, and review games with a calm single-frame hero.",
          icon: (
            <Image
              src={plannerLogoSrc}
              alt="Planner logo"
              width={48}
              height={48}
              className="h-[var(--control-h-lg)] w-auto object-contain"
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
            <div className="space-y-[var(--space-2)]">
              <p className="text-ui text-muted-foreground">
                {heroFilterCopy[activeFilter]}
              </p>
              <p className="text-ui text-muted-foreground">
                Filters, search, and quick actions now snap to the frame’s
                12-column grid so the controls stay aligned with the story
                content below.
              </p>
            </div>
          ),
          actions: (
            <>
              <ThemeToggle ariaLabel="Toggle theme" className="shrink-0" />
              <Button
                variant="default"
                size="sm"
                className="px-[var(--space-4)] whitespace-nowrap"
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
      <PageHeader
        id="page-header-elevated"
        aria-labelledby="page-header-elevated-heading"
        subTabs={{
          items: heroFilters,
          value: activeFilter,
          onChange: (key) => setActiveFilter(key as HeroFilter),
          ariaLabel: "Filter spotlight content",
        }}
        search={{
          id: "page-header-elevated-search",
          value: query,
          onValueChange: setQuery,
          debounceMs: 200,
          placeholder: "Search highlight reels…",
          "aria-label": "Search highlight reels",
        }}
        header={{
          heading: (
            <span id="page-header-elevated-heading">Planner Spotlight</span>
          ),
          subtitle: "Stage a high-energy announcement right in the app.",
          icon: (
            <Image
              src={plannerLogoSrc}
              alt="Planner logo"
              width={48}
              height={48}
              className="h-[var(--control-h-lg)] w-auto object-contain"
            />
          ),
          sticky: false,
          rail: false,
          barClassName: "p-0",
        }}
        hero={{
          eyebrow: "Launch highlight",
          heading: "Rally the squad",
          subtitle: "Pull focus for milestone beats",
          tone: "heroic",
          frame: true,
          children: (
            <p className="text-ui text-muted-foreground">
              Spotlight a major update with the neon treatment while keeping
              navigation close at hand.
            </p>
          ),
          actions: (
            <div className="flex items-center gap-[var(--space-2)]">
              <ThemeToggle ariaLabel="Toggle theme" className="shrink-0" />
              <Button
                variant="default"
                size="sm"
                className="px-[var(--space-4)] whitespace-nowrap"
              >
                Launch Event
              </Button>
            </div>
          ),
          sticky: false,
          topClassName: "top-0",
          barClassName: "p-0",
        }}
      />
      <p className="text-ui text-muted-foreground">
        PageHeader now routes shared sub-tabs, search, and quick actions into
        the frame’s action grid so controls align with the 12-column layout
        while the inner hero stays calm, single-framed, and flush. It forwards
        <code className="ml-[var(--space-1)] rounded bg-[hsl(var(--card)/0.6)] px-[var(--spacing-0-75)] py-[var(--spacing-0-5)] font-mono text-label text-foreground/80">
          {"hero.padding = \"none\""}
        </code>{" "}
        so the content hugs the frame. Want the Hero divider row instead? Pass
        {" "}
        <code className="ml-[var(--space-1)] rounded bg-[hsl(var(--card)/0.6)] px-[var(--spacing-0-75)] py-[var(--spacing-0-5)] font-mono text-label text-foreground/80">
          {"frameProps={{ slots: null }}"}
        </code>{" "}
        to hand control back to Hero while keeping tone overrides intact.
      </p>
    </div>
  );
}
