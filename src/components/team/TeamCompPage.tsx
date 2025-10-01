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
import { type HeaderTab } from "@/components/ui/layout/Header";
import type { HeroProps } from "@/components/ui/layout/Hero";
import Builder, {
  type BuilderHandle,
  type LaneKey,
  useTeamBuilderState,
  LANES as BUILDER_LANES,
} from "./Builder";
import JungleClears, { type JungleClearsHandle } from "./JungleClears";
import CheatSheet from "./CheatSheet";
import MyComps from "./MyComps";
import { usePersistentState } from "@/lib/db";
import IconButton from "@/components/ui/primitives/IconButton";
import Button from "@/components/ui/primitives/Button";
import { PageHeader, PageShell, Badge } from "@/components/ui";
import type { BadgeProps } from "@/components/ui";
import type { ClearSpeed } from "./data";

type Tab = "cheat" | "builder" | "clears";
type SubTab = "sheet" | "comps";

type LaneTone = Extract<BadgeProps["tone"], LaneKey>;

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

export default function TeamCompPage() {
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
  const subTabs = React.useMemo<HeaderTab<SubTab>[]>(
    () => [
      {
        key: "sheet",
        label: "Cheat Sheet",
        icon: <BookOpen />,
        id: "sheet-tab",
        controls: "sheet-panel",
      },
      {
        key: "comps",
        label: "My Comps",
        icon: <Users2 />,
        id: "comps-tab",
        controls: "comps-panel",
      },
    ],
    [],
  );
  const subTabIds = React.useMemo(
    () =>
      subTabs.reduce((acc, item) => {
        const key = item.key as SubTab;
        acc[key] = {
          tab: `${subTabBaseId}-${item.id ?? `${item.key}-tab`}`,
          panel: `${subTabBaseId}-${item.controls ?? `${item.key}-panel`}`,
        };
        return acc;
      }, {} as Record<SubTab, { tab: string; panel: string }>),
    [subTabBaseId, subTabs],
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
  const TABS = React.useMemo(
    (): Array<
      HeaderTab<Tab> & {
        render: () => React.ReactNode;
        ref: React.RefObject<HTMLDivElement | null>;
      }
    > => [
      {
        key: "cheat",
        label: "Cheat Sheet",
        hint: "Archetypes, counters, examples",
        icon: <BookOpenText />,
        render: renderCheat,
        ref: cheatRef,
        id: tabIds.cheat.tab,
        controls: tabIds.cheat.panel,
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
        id: tabIds.builder.tab,
        controls: tabIds.builder.panel,
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
        id: tabIds.clears.tab,
        controls: tabIds.clears.panel,
      },
    ],
    [
      renderCheat,
      editing,
      clearsQuery,
      tabIds,
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

  const hero = React.useMemo<HeroProps<SubTab>>(() => {
    if (tab === "cheat") {
      const editingKey: keyof typeof editing =
        subTab === "sheet" ? "cheatSheet" : "myComps";
      return {
        as: "section",
        sticky: true,
        topClassName: "top-[var(--header-stack)]",
        eyebrow: active?.label,
        heading: "Comps",
        subtitle:
          subTab === "sheet"
            ? "Archetypes & tips"
            : "Your saved compositions",
        subTabs: {
          items: subTabs,
          value: subTab,
          onChange: (next: SubTab) => setSubTab(next),
          ariaLabel: "Cheat sheet sections",
          showBaseline: true,
          idBase: subTabBaseId,
        },
        search: {
          value: query,
          onValueChange: setQuery,
          placeholder: "Search…",
          round: true,
          debounceMs: 300,
          "aria-label":
            subTab === "sheet"
              ? "Search cheat sheet entries"
              : "Search saved comps",
        },
        actions: (
          <Button
            size="md"
            variant="quiet"
            onClick={() => toggleEditing(editingKey)}
            aria-pressed={editing[editingKey]}
          >
            {editing[editingKey] ? "Done" : "Edit"}
          </Button>
        ),
      };
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
      const subtitleParts = [
        `Allies ${alliesFilled}/5 locked`,
        `Enemies ${enemiesFilled}/5 scouted`,
      ];
      subtitleParts.push(
        openLanes.length === 0
          ? "All lanes accounted"
          : `${openLanes.length} lane${openLanes.length > 1 ? "s" : ""} open`,
      );
      const subtitle = subtitleParts.join(" • ");
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

      return {
        as: "section",
        frame: true,
        sticky: true,
        topClassName: "top-[var(--header-stack)]",
        eyebrow: active?.label ?? "Comps",
        heading: "Builder",
        subtitle,
        children: (
          <div className="flex flex-col gap-[var(--space-4)]">
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
          </div>
        ),
        actions: (
          <div className="flex flex-wrap items-center gap-[var(--space-3)] md:gap-[var(--space-4)]">
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
          </div>
        ),
      };
    }
    return {
      as: "section",
      sticky: false,
      topClassName: "top-[var(--header-stack)]",
      rail: true,
      heading: "Clear Speed Buckets",
      dividerTint: "primary",
      search: {
        value: clearsQuery,
        onValueChange: setClearsQuery,
        placeholder: "Filter by champion, type, or note...",
        round: true,
        debounceMs: 300,
        "aria-label": "Search jungle clear buckets",
        right: (
          <span className="text-label opacity-80">{clearsCount} shown</span>
        ),
      },
      actions: (
        <div className="flex flex-wrap items-center gap-[var(--space-2)]">
          <div className="flex flex-col items-start gap-[var(--space-1)]">
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
      ),
      children: (
        <p className="text-ui text-muted-foreground">
          If you’re on a <em>Medium</em> champ, don’t race farm vs <em>Very Fast</em>.
          Path for fights, ganks, or cross-map trades.
        </p>
      ),
    };
  }, [
    tab,
    active,
    builderState,
    subTab,
    subTabs,
    subTabBaseId,
    query,
    clearsQuery,
    clearsCount,
    targetBucket,
    editing,
    setQuery,
    setSubTab,
    toggleEditing,
  ]);

  return (
    <PageShell
      as="section"
      grid
      className="py-[var(--space-6)]"
      contentClassName="gap-y-[var(--space-6)]"
      aria-labelledby="teamcomp-header"
    >
      <PageHeader
        containerClassName="col-span-full"
        header={{
          id: "teamcomp-header",
          eyebrow: "Comps",
          heading: "Team Comps Today",
          subtitle: "Readable. Fast. On brand.",
          icon: <Users2 className="opacity-80" />,
          tabs: {
            items: TABS,
            value: tab,
            onChange: (next: Tab) => setTab(next),
            ariaLabel: "Team comps mode",
          },
          underline: true,
          sticky: true,
        }}
        hero={hero}
      />

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
  );
}
