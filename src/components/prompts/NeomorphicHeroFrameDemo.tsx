"use client";

import * as React from "react";
import {
  NeomorphicHeroFrame,
  TabBar,
  SearchBar,
  Button,
  ThemeToggle,
  HeroGrid,
  HeroCol,
  type TabItem,
} from "@/components/ui";

type MissionView = "missions" | "briefings" | "archive";

type MissionStatus = "active" | "queued" | "paused" | "completed";

const missionTabs: TabItem<MissionView>[] = [
  { key: "missions", label: "Missions" },
  { key: "briefings", label: "Briefings" },
  { key: "archive", label: "Archive", disabled: true },
];

const statusTabs: TabItem<MissionStatus>[] = [
  { key: "active", label: "Active" },
  { key: "queued", label: "Queued" },
  { key: "paused", label: "Paused" },
  { key: "completed", label: "Completed" },
];

export default function NeomorphicHeroFrameDemo() {
  const [activeView, setActiveView] = React.useState<MissionView>("missions");
  const [status, setStatus] = React.useState<MissionStatus>("active");
  const [query, setQuery] = React.useState("");
  const [compactQuery, setCompactQuery] = React.useState("");

  return (
    <div className="space-y-[var(--space-6)]">
      <NeomorphicHeroFrame
        as="header"
        label="Mission controls"
        slots={{
          tabs: {
            node: (
              <TabBar
                items={missionTabs}
                value={activeView}
                onValueChange={(key) => setActiveView(key as MissionView)}
                ariaLabel="Switch mission focus"
                right={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-[var(--space-2)] text-label font-semibold uppercase tracking-[0.08em]"
                  >
                    View all
                  </Button>
                }
                showBaseline
                variant="neo"
              />
            ),
            label: "Switch mission focus",
          },
          search: {
            node: (
              <SearchBar
                value={query}
                onValueChange={setQuery}
                placeholder="Search mission intel…"
                aria-label="Search mission intel"
                loading={activeView === "archive"}
              />
            ),
            label: "Search mission intel",
          },
          actions: {
            node: (
              <div className="flex items-center gap-[var(--space-2)]">
                <ThemeToggle ariaLabel="Toggle theme" className="shrink-0" />
                <Button size="sm" variant="secondary">
                  Draft
                </Button>
                <Button size="sm" variant="primary" loading>
                  Deploy
                </Button>
                <Button size="sm" variant="ghost" disabled>
                  Disabled
                </Button>
              </div>
            ),
            label: "Mission quick actions",
          },
        }}
      >
        <HeroGrid variant="default">
          <HeroCol span={7} className="space-y-[var(--space-3)]">
            <h3 className="text-title font-semibold tracking-[-0.01em] text-foreground">
              Default neomorphic frame
            </h3>
            <p className="text-ui text-muted-foreground">
              The default variant applies the <code>r-card-lg</code> radius, border tint
              from <code>border-border/40</code>, and responsive padding tokens
              (<code>px-6</code>, <code>md:px-7</code>, <code>lg:px-8</code>) while the <code>HeroGrid</code>
              keeps content aligned to the 12-column layout.
            </p>
            <p className="text-ui text-muted-foreground">
              Tabs, search, and button actions all inherit hover, focus, active,
              disabled, and loading states from the design system tokens—interact with
              each control to preview the full range of feedback.
            </p>
          </HeroCol>
          <HeroCol span={5} className="grid gap-[var(--space-2)] text-label uppercase tracking-[0.08em] text-muted-foreground">
            <div className="flex items-center justify-between rounded-card r-card-md border border-border/30 bg-card/60 px-[var(--space-3)] py-[var(--space-2)] shadow-neo">
              <dt className="font-semibold text-foreground">Layer tokens</dt>
              <dd className="text-label">bg-card/70 · ring-border/55</dd>
            </div>
            <div className="flex items-center justify-between rounded-card r-card-md border border-border/30 bg-card/60 px-[var(--space-3)] py-[var(--space-2)] shadow-neo">
              <dt className="font-semibold text-foreground">Grid rhythm</dt>
              <dd className="text-label">HeroGrid gap-4 · md:gap-6</dd>
            </div>
            <div className="flex items-center justify-between rounded-card r-card-md border border-border/30 bg-card/60 px-[var(--space-3)] py-[var(--space-2)] shadow-neo">
              <dt className="font-semibold text-foreground">Slot spans</dt>
              <dd className="text-label">HeroCol 7 / 5 alignment</dd>
            </div>
          </HeroCol>
        </HeroGrid>
      </NeomorphicHeroFrame>

      <NeomorphicHeroFrame
        as="nav"
        variant="compact"
        align="between"
        label="Mission filters"
        slots={{
          tabs: {
            node: (
              <TabBar
                items={statusTabs}
                value={status}
                onValueChange={(key) => setStatus(key as MissionStatus)}
                ariaLabel="Filter mission status"
                size="sm"
                variant="neo"
              />
            ),
            label: "Filter mission status",
          },
          search: {
            node: (
              <SearchBar
                value={compactQuery}
                onValueChange={setCompactQuery}
                placeholder="Quick search…"
                aria-label="Search mission status"
                loading={status === "queued"}
              />
            ),
            label: "Search mission status",
          },
          actions: {
            node: (
              <div className="flex items-center gap-[var(--space-2)]">
                <Button size="sm" variant="secondary">
                  Pin view
                </Button>
                <Button size="sm" variant="ghost">
                  More
                </Button>
              </div>
            ),
            label: "Mission frame actions",
          },
        }}
      >
        <HeroGrid variant="compact">
          <HeroCol span={6} className="space-y-[var(--space-2)]">
            <h3 className="text-ui font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Compact layout
            </h3>
            <p className="text-ui text-muted-foreground">
              Compact frames tighten the padding to <code>px-4</code>/<code>md:px-5</code>/<code>lg:px-6</code>
              with the <code>r-card-md</code> radius, ideal for utility nav or filter rails.
            </p>
            <p className="text-ui text-muted-foreground">
              Slots span <code>HeroCol 7 / 3 / 2</code> at the medium breakpoint so tabs, search,
              and quick actions stay aligned with adjacent content.
            </p>
          </HeroCol>
          <HeroCol span={6} className="space-y-[var(--space-2)] text-label text-muted-foreground">
            <p className="font-semibold text-foreground">Interaction checklist</p>
            <ul className="grid grid-cols-2 gap-[var(--space-2)]">
              <li className="rounded-card r-card-md border border-border/30 bg-card/60 px-[var(--space-3)] py-[var(--space-2)] shadow-neo">
                Hover or focus the tabs to see accent glows.
              </li>
              <li className="rounded-card r-card-md border border-border/30 bg-card/60 px-[var(--space-3)] py-[var(--space-2)] shadow-neo">
                Toggle statuses—the queued tab marks the search as loading.
              </li>
              <li className="rounded-card r-card-md border border-border/30 bg-card/60 px-[var(--space-3)] py-[var(--space-2)] shadow-neo">
                Buttons surface pressed and disabled states from tokenized styles.
              </li>
              <li className="rounded-card r-card-md border border-border/30 bg-card/60 px-[var(--space-3)] py-[var(--space-2)] shadow-neo">
                Keyboard focus rings respect the global focus token.
              </li>
            </ul>
          </HeroCol>
        </HeroGrid>
      </NeomorphicHeroFrame>
    </div>
  );
}
