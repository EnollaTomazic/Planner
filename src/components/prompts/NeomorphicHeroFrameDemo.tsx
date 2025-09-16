import * as React from "react";
import {
  NeomorphicHeroFrame,
  TabBar,
  SearchBar,
  Button,
  ThemeToggle,
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
    <div className="space-y-6">
      <NeomorphicHeroFrame
        as="header"
        actionArea={{
          tabs: (
            <TabBar
              items={missionTabs}
              value={activeView}
              onValueChange={(key) => setActiveView(key as MissionView)}
              ariaLabel="Switch mission focus"
              right={
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-2 text-label font-semibold uppercase tracking-[0.08em]"
                >
                  View all
                </Button>
              }
              showBaseline
              variant="neo"
            />
          ),
          search: (
            <SearchBar
              value={query}
              onValueChange={setQuery}
              placeholder="Search mission intel…"
              aria-label="Search mission intel"
              loading={activeView === "archive"}
            />
          ),
          actions: (
            <div className="flex items-center gap-2">
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
          "aria-label": "Mission controls",
        }}
      >
        <div className="grid gap-4 md:grid-cols-12 md:gap-6">
          <div className="md:col-span-7 space-y-3">
            <h3 className="text-title font-semibold tracking-[-0.01em] text-foreground">
              Default neomorphic frame
            </h3>
            <p className="text-ui text-muted-foreground">
              The default variant applies the <code>r-card-lg</code> radius, border tint
              from <code>border-border/40</code>, and responsive padding tokens
              (<code>px-6</code>, <code>md:px-7</code>, <code>lg:px-8</code>) to stay aligned with the 12-column grid.
            </p>
            <p className="text-ui text-muted-foreground">
              Tabs, search, and button actions all inherit hover, focus, active,
              disabled, and loading states from the design system tokens—interact with
              each control to preview the full range of feedback.
            </p>
          </div>
          <dl className="md:col-span-5 grid gap-2 text-label uppercase tracking-[0.08em] text-muted-foreground">
            <div className="flex items-center justify-between rounded-card r-card-md border border-border/30 bg-card/60 px-3 py-2">
              <dt className="font-semibold text-foreground">Layer tokens</dt>
              <dd className="text-label">bg-card/70 · ring-border/55</dd>
            </div>
            <div className="flex items-center justify-between rounded-card r-card-md border border-border/30 bg-card/60 px-3 py-2">
              <dt className="font-semibold text-foreground">Spacing</dt>
              <dd className="text-label">gap-4 · md:gap-6</dd>
            </div>
            <div className="flex items-center justify-between rounded-card r-card-md border border-border/30 bg-card/60 px-3 py-2">
              <dt className="font-semibold text-foreground">Action grid</dt>
              <dd className="text-label">md:col-span-5 / 4 / 3</dd>
            </div>
          </dl>
        </div>
      </NeomorphicHeroFrame>

      <NeomorphicHeroFrame
        as="nav"
        variant="compact"
        actionArea={{
          tabs: (
            <TabBar
              items={statusTabs}
              value={status}
              onValueChange={(key) => setStatus(key as MissionStatus)}
              ariaLabel="Filter mission status"
              size="sm"
              variant="neo"
            />
          ),
          search: (
            <SearchBar
              value={compactQuery}
              onValueChange={setCompactQuery}
              placeholder="Quick search…"
              aria-label="Search mission status"
              loading={status === "queued"}
            />
          ),
          actions: (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary">
                Pin view
              </Button>
              <Button size="sm" variant="ghost">
                More
              </Button>
            </div>
          ),
          align: "between",
          "aria-label": "Mission filters",
        }}
      >
        <div className="grid gap-3 md:grid-cols-12 md:gap-4">
          <div className="md:col-span-6 space-y-2">
            <h3 className="text-ui font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Compact layout
            </h3>
            <p className="text-ui text-muted-foreground">
              Compact frames tighten the padding to <code>px-4</code>/<code>md:px-5</code>/<code>lg:px-6</code>
              with the <code>r-card-md</code> radius, ideal for utility nav or filter rails.
            </p>
            <p className="text-ui text-muted-foreground">
              The action row mirrors the grid: tabs span <code>md:col-span-7</code>, search spans
              <code>md:col-span-3</code>, and button actions anchor on <code>md:col-span-2</code> for
              consistent alignment.
            </p>
          </div>
          <div className="md:col-span-6 space-y-2 text-label text-muted-foreground">
            <p className="font-semibold text-foreground">Interaction checklist</p>
            <ul className="grid grid-cols-2 gap-2">
              <li className="rounded-card r-card-md border border-border/25 bg-card/60 px-3 py-2">
                Hover or focus the tabs to see accent glows.
              </li>
              <li className="rounded-card r-card-md border border-border/25 bg-card/60 px-3 py-2">
                Toggle statuses—the queued tab marks the search as loading.
              </li>
              <li className="rounded-card r-card-md border border-border/25 bg-card/60 px-3 py-2">
                Buttons surface pressed and disabled states from tokenized styles.
              </li>
              <li className="rounded-card r-card-md border border-border/25 bg-card/60 px-3 py-2">
                Keyboard focus rings respect the global focus token.
              </li>
            </ul>
          </div>
        </div>
      </NeomorphicHeroFrame>
    </div>
  );
}
