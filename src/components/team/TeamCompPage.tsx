// src/components/team/TeamCompPage.tsx
"use client";

/**
 * TeamCompPage — top-level shell with tabs:
 * - Cheat Sheet (archetypes + sub-tabs: Cheat Sheet | My Comps)
 * - Builder (ally vs enemy)
 * - Jungle Clears (speed buckets)
 *
 * Header hosts the main tabs; a top-level Hero summarizes the active tab.
 */
import "./style.css";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  Users2,
  BookOpenText,
  BookOpen,
  Hammer,
  Timer,
  Shuffle,
  Clipboard,
  Plus,
} from "lucide-react";
import {
  type BuilderHandle,
  type LaneKey,
  useTeamBuilderState,
  LANES as BUILDER_LANES, Builder } from "./Builder";
import { type JungleClearsHandle, JungleClears } from "./JungleClears";
import { CheatSheet } from "./CheatSheet";
import { MyComps } from "./MyComps";
import { usePersistentState } from "@/lib/db";
import { IconButton } from "@/components/ui/primitives/IconButton";
import { Button } from "@/components/ui/primitives/Button";
import { Hero, PageShell, Badge, TabBar } from "@/components/ui";
import type { BadgeProps } from "@/components/ui";
import type { ClearSpeed } from "./data";

type Tab = "cheat" | "builder" | "clears";
type SubTab = "sheet" | "comps";

type LaneTone = Extract<BadgeProps["tone"], LaneKey>;

type TabConfig = {
  key: Tab;
  label: string;
  hint?: string;
  icon: React.ReactNode;
  render: () => React.ReactNode;
  ref: React.RefObject<HTMLDivElement | null>;
};

const TAB_KEY = "team:page:activeTab.v1";
const SUB_TAB_KEY = "team:cheatsheet:activeSubTab.v1";
const QUERY_KEY = "team:cheatsheet:query.v1";

const decodeTab = (value: unknown): Tab | null => {
  if (value === "cheat" || value === "builder" || value === "clears") {
    return value;
  }
  return null;
};

const decodeSubTab = (value: unknown): SubTab | null => {
  if (value === "sheet" || value === "comps") {
    return value;
  }
  return null;
};

export function TeamCompPage() {
  const searchParams = useSearchParams();
  const [tab, setTab] = usePersistentState<Tab>(TAB_KEY, "cheat", {
    decode: decodeTab,
  });
  const [subTab, setSubTab] = usePersistentState<SubTab>(SUB_TAB_KEY, "sheet", {
    decode: decodeSubTab,
  });
  const [query, setQuery] = usePersistentState<string>(QUERY_KEY, "");
  const tabParam = searchParams?.get("tab") ?? null;
  const subParam = searchParams?.get("sub") ?? null;
  React.useEffect(() => {
    const next = decodeTab(tabParam);
    if (next && next !== tab) {
      setTab(next);
    }
  }, [tabParam, tab, setTab]);
  React.useEffect(() => {
    const next = decodeSubTab(subParam);
    if (next && next !== subTab) {
      setSubTab(next);
    }
  }, [subParam, subTab, setSubTab]);
  const tabBaseId = React.useId();
  const subTabBaseId = React.useId();
  const cheatRef = React.useRef<HTMLDivElement>(null);
  const builderRef = React.useRef<HTMLDivElement>(null);
  const builderApi = React.useRef<BuilderHandle>(null);
  const clearsRef = React.useRef<HTMLDivElement>(null);
  const clearsApi = React.useRef<JungleClearsHandle>(null);
  const subPanelRefs = React.useRef<Record<SubTab, HTMLDivElement | null>>({
    sheet: null,
    comps: null,
  });
  const tabIds = React.useMemo(
    () =>
      ({
        cheat: {
          tab: `${tabBaseId}-cheat-tab`,
          panel: `${tabBaseId}-cheat-panel`,
        },
        builder: {
          tab: `${tabBaseId}-builder-tab`,
          panel: `${tabBaseId}-builder-panel`,
        },
        clears: {
          tab: `${tabBaseId}-clears-tab`,
          panel: `${tabBaseId}-clears-panel`,
        },
      }) satisfies Record<Tab, { tab: string; panel: string }>,
    [tabBaseId],
  );
  const subTabItems = React.useMemo(
    () =>
      [
        {
          key: "sheet" as const,
          label: "Cheat Sheet",
          icon: <BookOpen />,
          id: "sheet-tab",
          controls: "sheet-panel",
        },
        {
          key: "comps" as const,
          label: "My Comps",
          icon: <Users2 />,
          id: "comps-tab",
          controls: "comps-panel",
        },
      ] satisfies Array<{
        key: SubTab;
        label: string;
        icon: React.ReactNode;
        id: string;
        controls: string;
      }>,
    [],
  );
  const subTabIds = React.useMemo(
    () =>
      subTabItems.reduce((acc, item) => {
        const key = item.key;
        acc[key] = {
          tab: `${subTabBaseId}-${item.id ?? `${item.key}-tab`}`,
          panel: `${subTabBaseId}-${item.controls ?? `${item.key}-panel`}`,
        };
        return acc;
      }, {} as Record<SubTab, { tab: string; panel: string }>),
    [subTabBaseId, subTabItems],
  );
  const [editing, setEditing] = React.useState({
    cheatSheet: false,
    myComps: false,
    builder: false,
    clears: false,
  });
  const [clearsQuery, setClearsQuery] = React.useState("");
  const [clearsCount, setClearsCount] = React.useState(0);
  const [builderState, setBuilderState] = useTeamBuilderState();
  const [targetBucket, setTargetBucket] = React.useState<ClearSpeed>("Medium");
  const handleTargetBucketChange = React.useCallback(
    (bucket: ClearSpeed) => setTargetBucket(bucket),
    [],
  );
  const toggleEditing = React.useCallback((key: keyof typeof editing) => {
    setEditing((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);
  React.useEffect(() => {
    subPanelRefs.current[subTab]?.focus();
  }, [subTab]);
  const renderCheat = React.useCallback(
    () => (
      <div>
        <div
          id={subTabIds.sheet.panel}
          role="tabpanel"
          aria-labelledby={subTabIds.sheet.tab}
          hidden={subTab !== "sheet"}
          tabIndex={subTab === "sheet" ? 0 : -1}
          ref={(el) => {
            subPanelRefs.current.sheet = el;
          }}
        >
          {subTab === "sheet" && (
            <CheatSheet dense query={query} editing={editing.cheatSheet} />
          )}
        </div>
        <div
          id={subTabIds.comps.panel}
          role="tabpanel"
          aria-labelledby={subTabIds.comps.tab}
          hidden={subTab !== "comps"}
          tabIndex={subTab === "comps" ? 0 : -1}
          ref={(el) => {
            subPanelRefs.current.comps = el;
          }}
        >
          {subTab === "comps" && (
            <MyComps query={query} editing={editing.myComps} />
          )}
        </div>
      </div>
    ),
    [subTabIds, subTab, query, editing],
  );
  const TABS = React.useMemo<TabConfig[]>(
    () => [
      {
        key: "cheat",
        label: "Cheat Sheet",
        hint: "Archetypes, counters, examples",
        icon: <BookOpenText />,
        render: renderCheat,
        ref: cheatRef,
      },
      {
        key: "builder",
        label: "Builder",
        hint: "Fill allies vs enemies",
        icon: <Hammer />,
        render: () => (
          <Builder
            ref={builderApi}
            editing={editing.builder}
            state={builderState}
            onStateChange={setBuilderState}
          />
        ),
        ref: builderRef,
      },
      {
        key: "clears",
        label: "Jungle Clears",
        hint: "Relative buckets by speed",
        icon: <Timer />,
        render: () => (
          <JungleClears
            ref={clearsApi}
            editing={editing.clears}
            query={clearsQuery}
            onTargetBucketChange={handleTargetBucketChange}
            onCountChange={setClearsCount}
          />
        ),
        ref: clearsRef,
      },
    ],
    [
      renderCheat,
      editing,
      clearsQuery,
      builderState,
      setBuilderState,
      handleTargetBucketChange,
    ],
  );
  const active = TABS.find((t) => t.key === tab);
  React.useEffect(() => {
    if (tab === "cheat") {
      cheatRef.current?.focus();
      return;
    }
    if (tab === "builder") {
      builderRef.current?.focus();
      return;
    }
    clearsRef.current?.focus();
  }, [tab]);

  const heroSearchBar = React.useMemo(() => {
    if (tab === "cheat") {
      return {
        value: query,
        onValueChange: setQuery,
        placeholder: "Search…",
        round: true,
        debounceMs: 300,
        "aria-label":
          subTab === "sheet"
            ? "Search cheat sheet entries"
            : "Search saved comps",
      } as const;
    }
    if (tab === "clears") {
      return {
        value: clearsQuery,
        onValueChange: setClearsQuery,
        placeholder: "Filter by champion, type, or note...",
        round: true,
        debounceMs: 300,
        "aria-label": "Search jungle clear buckets",
        right: <span className="text-label opacity-80">{clearsCount} shown</span>,
      } as const;
    }
    return null;
  }, [tab, query, subTab, setQuery, clearsQuery, clearsCount, setClearsQuery]);

  const heroContent = React.useMemo(() => {
    if (tab === "cheat") {
      const editingKey: keyof typeof editing =
        subTab === "sheet" ? "cheatSheet" : "myComps";
      return (
        <div className="flex flex-col gap-[var(--space-4)]">
          <div className="flex w-full flex-wrap items-center gap-[var(--space-3)]">
            <TabBar<SubTab>
              items={subTabItems}
              value={subTab}
              onValueChange={(next) => setSubTab(next as SubTab)}
              ariaLabel="Cheat sheet sections"
              showBaseline
              align="start"
              className="min-w-0 flex-1"
              tablistClassName="w-full"
              variant="neo"
              idBase={subTabBaseId}
            />
            <Button
              size="md"
              variant="quiet"
              onClick={() => toggleEditing(editingKey)}
              aria-pressed={editing[editingKey]}
            >
              {editing[editingKey] ? "Done" : "Edit"}
            </Button>
          </div>
          <p className="text-ui text-muted-foreground">
            {subTab === "sheet"
              ? "Archetypes, counters, and sample lanes at a glance."
              : "Organize, edit, and export your saved team compositions."}
          </p>
        </div>
      );
    }

    if (tab === "builder") {
      const laneSummaries = BUILDER_LANES.map((lane) => {
        const ally = (builderState.allies[lane.key] ?? "").trim();
        const enemy = (builderState.enemies[lane.key] ?? "").trim();
        return {
          ...lane,
          ally,
          enemy,
          isOpen: ally.length === 0 && enemy.length === 0,
          isContested: ally.length > 0 && enemy.length > 0,
        };
      });
      const alliesFilled = laneSummaries.filter((lane) => lane.ally.length > 0).length;
      const enemiesFilled = laneSummaries.filter((lane) => lane.enemy.length > 0).length;
      const openLanes = laneSummaries.filter((lane) => lane.isOpen);
      const contestedLanes = laneSummaries.filter((lane) => lane.isContested);
      const openLabel =
        openLanes.length === 0
          ? "No lane gaps"
          : `Gaps: ${openLanes.map((lane) => lane.label).join(", ")}`;
      const clashLabel =
        contestedLanes.length === 0
          ? "No direct clashes"
          : `Clashes: ${contestedLanes.map((lane) => lane.label).join(", ")}`;
      const gapTone: BadgeProps["tone"] = openLanes.length ? "accent" : "neutral";
      const clashTone: BadgeProps["tone"] = contestedLanes.length ? "primary" : "neutral";

      return (
        <div className="flex flex-col gap-[var(--space-4)]">
          <div className="flex flex-wrap items-center gap-[var(--space-3)]">
            <IconButton
              title="Swap Allies ↔ Enemies"
              aria-label="Swap Allies and Enemies"
              onClick={() => builderApi.current?.swapSides()}
              size="md"
            >
              <Shuffle />
            </IconButton>
            <IconButton
              title="Copy both sides"
              aria-label="Copy both sides"
              onClick={() => builderApi.current?.copyAll()}
              size="md"
            >
              <Clipboard />
            </IconButton>
            <Button
              size="md"
              variant="quiet"
              onClick={() => toggleEditing("builder")}
              aria-pressed={editing.builder}
            >
              {editing.builder ? "Done" : "Edit"}
            </Button>
            {active?.hint ? (
              <Badge
                size="sm"
                tone="accent"
                className="whitespace-normal text-left text-balance"
              >
                {active.hint}
              </Badge>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-[var(--space-2)] text-ui text-muted-foreground">
            <span>{`Allies ${alliesFilled}/5 locked`}</span>
            <span aria-hidden>•</span>
            <span>{`Enemies ${enemiesFilled}/5 scouted`}</span>
          </div>

          <div className="flex flex-col gap-[var(--space-2)]">
            <span className="text-label font-semibold uppercase tracking-[0.02em] text-muted-foreground">
              Lane coverage
            </span>
            <div className="flex flex-wrap gap-[var(--space-2)]">
              {laneSummaries.map((lane) => (
                <Badge
                  key={lane.key}
                  size="sm"
                  tone={lane.key as LaneTone}
                  className="min-w-[calc(var(--space-8)+var(--space-3))] whitespace-normal text-left text-balance"
                >
                  {`${lane.label}: ${lane.ally || "Open"} / ${lane.enemy || "Open"}`}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-[var(--space-2)]">
            <Badge
              size="sm"
              tone={gapTone}
              className="whitespace-normal text-left text-balance"
            >
              {openLabel}
            </Badge>
            <Badge
              size="sm"
              tone={clashTone}
              className="whitespace-normal text-left text-balance"
            >
              {clashLabel}
            </Badge>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-[var(--space-4)]">
        <div className="flex flex-wrap items-center gap-[var(--space-3)]">
          <Button
            variant="default"
            size="md"
            className="whitespace-nowrap"
            title={`Add row to ${targetBucket} bucket`}
            aria-label={`Add row to ${targetBucket} bucket`}
            onClick={() => clearsApi.current?.addRow(targetBucket)}
          >
            <Plus />
            <span>New Row</span>
          </Button>
          <div className="flex items-center gap-[var(--space-1)] text-label text-muted-foreground">
            <span>Sends to</span>
            <Badge
              size="sm"
              tone="accent"
              className="whitespace-normal text-left text-balance"
            >
              {targetBucket}
            </Badge>
          </div>
          <Button
            size="md"
            variant="quiet"
            onClick={() => toggleEditing("clears")}
            aria-pressed={editing.clears}
          >
            {editing.clears ? "Done" : "Edit"}
          </Button>
        </div>
        <p className="text-ui text-muted-foreground">
          If you’re on a <em>Medium</em> champ, don’t race farm vs <em>Very Fast</em>. Path for fights,
          ganks, or cross-map trades.
        </p>
      </div>
    );
  }, [
    tab,
    subTab,
    subTabItems,
    setSubTab,
    subTabBaseId,
    toggleEditing,
    editing,
    builderState,
    active,
    targetBucket,
    builderApi,
    clearsApi,
  ]);

  const handleOpenMyComps = React.useCallback(() => {
    setTab("cheat");
    setSubTab("comps");
  }, [setTab, setSubTab]);

  return (
    <>
      <PageShell
        as="header"
        grid
        className="py-[var(--space-6)]"
        contentClassName="gap-y-[var(--space-6)]"
        aria-labelledby="teamcomp-header"
      >
        <Hero<SubTab>
          id="teamcomp-header"
          icon={<Users2 className="opacity-80" />}
          eyebrow="Comps"
          title="Team Compositions"
          subtitle="Explore archetypes, build your comp, and master jungle clears."
          glitch="subtle"
          className="col-span-full md:col-span-12"
          sticky
          topClassName="top-[var(--header-stack)]"
          searchBar={heroSearchBar ?? undefined}
          actions={
            <>
              <span id={`${tabBaseId}-tabs-label`} className="sr-only">
                Team comps mode
              </span>
              <TabBar<Tab>
                ariaLabelledBy={`${tabBaseId}-tabs-label`}
                value={tab}
                onValueChange={(next) => setTab(next as Tab)}
                className="min-w-0 flex-1"
                tablistClassName="w-full"
                variant="neo"
                align="start"
                items={[
                  {
                    key: "cheat" as const,
                    label: "Cheat Sheet",
                    icon: <BookOpenText />,
                    id: "cheat-tab",
                    controls: "cheat-panel",
                  },
                  {
                    key: "builder" as const,
                    label: "Builder",
                    icon: <Hammer />,
                    id: "builder-tab",
                    controls: "builder-panel",
                  },
                  {
                    key: "clears" as const,
                    label: "Jungle Clears",
                    icon: <Timer />,
                    id: "clears-tab",
                    controls: "clears-panel",
                  },
                ]}
                idBase={tabBaseId}
              />
              <Button
                variant="default"
                size="md"
                className="whitespace-nowrap"
                onClick={handleOpenMyComps}
              >
                <Users2 className="mr-[var(--space-2)] h-[var(--space-4)] w-[var(--space-4)]" />
                <span>My Comps</span>
              </Button>
            </>
          }
        >
          {heroContent}
        </Hero>
      </PageShell>

      <PageShell
        as="main"
        id="page-main"
        tabIndex={-1}
        grid
        className="py-[var(--space-6)]"
        contentClassName="gap-y-[var(--space-6)]"
        aria-labelledby="teamcomp-header"
      >
        <section className="col-span-full grid gap-[var(--space-4)] md:grid-cols-12">
          {TABS.map((t) => {
            const ids = tabIds[t.key];
            return (
              <div
                key={t.key}
                id={ids.panel}
                role="tabpanel"
                aria-labelledby={ids.tab}
                hidden={tab !== t.key}
                tabIndex={tab === t.key ? 0 : -1}
                ref={t.ref}
                className="col-span-full"
              >
                {tab === t.key && t.render()}
              </div>
            );
          })}
        </section>
      </PageShell>
    </>
  );
}
