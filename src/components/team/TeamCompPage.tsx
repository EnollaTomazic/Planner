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

import React, { useState } from "react";
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
import Header, { type HeaderTab } from "@/components/ui/layout/Header";
import Hero from "@/components/ui/layout/Hero";
import Builder, { type BuilderHandle } from "./Builder";
import JungleClears, { type JungleClearsHandle } from "./JungleClears";
import CheatSheet from "./CheatSheet";
import MyComps from "./MyComps";
import { usePersistentState } from "@/lib/db";
import IconButton from "@/components/ui/primitives/IconButton";
import Button from "@/components/ui/primitives/Button";

type Tab = "cheat" | "builder" | "clears";
type SubTab = "sheet" | "comps";

const SUB_TAB_KEY = "team:cheatsheet:activeSubTab.v1";
const QUERY_KEY = "team:cheatsheet:query.v1";

export default function TeamCompPage() {
  const [tab, setTab] = useState<Tab>("cheat");
  const [subTab, setSubTab] = usePersistentState<SubTab>(SUB_TAB_KEY, "sheet");
  const [query, setQuery] = usePersistentState<string>(QUERY_KEY, "");
  const cheatRef = React.useRef<HTMLDivElement>(null);
  const builderRef = React.useRef<HTMLDivElement>(null);
  const builderApi = React.useRef<BuilderHandle>(null);
  const clearsRef = React.useRef<HTMLDivElement>(null);
  const clearsApi = React.useRef<JungleClearsHandle>(null);
  const subPanelRefs = React.useRef<Record<SubTab, HTMLDivElement | null>>({
    sheet: null,
    comps: null,
  });
  const [subIds, setSubIds] = React.useState<
    Record<SubTab, { tab: string; panel: string }>
  >({
    sheet: { tab: "sheet-tab", panel: "sheet-panel" },
    comps: { tab: "comps-tab", panel: "comps-panel" },
  });
  const [editing, setEditing] = React.useState({
    cheatSheet: false,
    myComps: false,
    builder: false,
    clears: false,
  });
  const [clearsQuery, setClearsQuery] = React.useState("");
  const [clearsCount, setClearsCount] = React.useState(0);
  const toggleEditing = React.useCallback((key: keyof typeof editing) => {
    setEditing((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);
  React.useEffect(() => {
    const map: Record<SubTab, string> = { sheet: "sheet", comps: "comps" };
    const next: Record<SubTab, { tab: string; panel: string }> = {
      sheet: { tab: "sheet-tab", panel: "sheet-panel" },
      comps: { tab: "comps-tab", panel: "comps-panel" },
    };
    (Object.keys(map) as SubTab[]).forEach((k) => {
      const tabEl = document.querySelector<HTMLButtonElement>(
        `[role="tab"][aria-controls$="${map[k]}-panel"]`,
      );
      if (tabEl) {
        next[k] = {
          tab: tabEl.id,
          panel: tabEl.getAttribute("aria-controls") ?? `${map[k]}-panel`,
        };
      }
    });
    setSubIds(next);
  }, []);
  React.useEffect(() => {
    subPanelRefs.current[subTab]?.focus();
  }, [subTab]);
  const subTabs = React.useMemo(
    () => [
      { key: "sheet", label: "Cheat Sheet", icon: <BookOpen /> },
      { key: "comps", label: "My Comps", icon: <Users2 /> },
    ],
    [],
  );
  const renderCheat = React.useCallback(
    () => (
      <div>
        <div
          id={subIds.sheet.panel}
          role="tabpanel"
          aria-labelledby={subIds.sheet.tab}
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
          id={subIds.comps.panel}
          role="tabpanel"
          aria-labelledby={subIds.comps.tab}
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
    [subIds, subTab, query, editing],
  );
  const TABS = React.useMemo(
    (): Array<
      HeaderTab<Tab> & {
        render: () => React.ReactNode;
        ref: React.RefObject<HTMLDivElement>;
      }
    > => [
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
          <Builder ref={builderApi} editing={editing.builder} />
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
            onCountChange={setClearsCount}
          />
        ),
        ref: clearsRef,
      },
    ],
    [renderCheat, editing, clearsQuery],
  );
  const active = TABS.find((t) => t.key === tab);
  React.useEffect(() => {
    TABS.find((t) => t.key === tab)?.ref.current?.focus();
  }, [tab, TABS]);

  const hero = React.useMemo(() => {
    if (tab === "cheat") {
      const editingKey: keyof typeof editing =
        subTab === "sheet" ? "cheatSheet" : "myComps";
      return (
        <Hero
          frame={false}
          topClassName="top-[var(--header-stack)]"
          eyebrow={active?.label}
          heading="Comps"
          subtitle={
            subTab === "sheet"
              ? "Archetypes & tips"
              : "Your saved compositions"
          }
          subTabs={{
            items: subTabs,
            value: subTab,
            onChange: (k: string) => setSubTab(k as SubTab),
            showBaseline: true,
          }}
          search={{
            value: query,
            onValueChange: setQuery,
            placeholder: "Search…",
            round: true,
          }}
          actions={
            <Button
              size="sm"
              variant="ghost"
              onClick={() => toggleEditing(editingKey)}
            >
              {editing[editingKey] ? "Done" : "Edit"}
            </Button>
          }
        />
      );
    }
    if (tab === "builder") {
      return (
        <Hero
          frame={false}
          topClassName="top-[var(--header-stack)]"
          eyebrow="Comps"
          heading="Builder"
          subtitle="Fill allies vs enemies. Swap in one click."
          actions={
            <div className="flex items-center gap-[var(--spacing-2)]">
              <IconButton
                title="Swap Allies ↔ Enemies"
                aria-label="Swap Allies and Enemies"
                onClick={() => builderApi.current?.swapSides()}
                size="sm"
                iconSize="sm"
              >
                <Shuffle />
              </IconButton>
              <IconButton
                title="Copy both sides"
                aria-label="Copy both sides"
                onClick={() => builderApi.current?.copyAll()}
                size="sm"
                iconSize="sm"
              >
                <Clipboard />
              </IconButton>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => toggleEditing("builder")}
              >
                {editing.builder ? "Done" : "Edit"}
              </Button>
            </div>
          }
        />
      );
    }
    return (
      <Hero
        frame={false}
        sticky={false}
        topClassName="top-[var(--header-stack)]"
        rail
        heading="Clear Speed Buckets"
        dividerTint="primary"
        search={{
          value: clearsQuery,
          onValueChange: setClearsQuery,
          placeholder: "Filter by champion, type, or note...",
          round: true,
          debounceMs: 80,
          right: (
            <span className="text-xs opacity-80">{clearsCount} shown</span>
          ),
        }}
        actions={
          <div className="flex items-center gap-[var(--spacing-2)]">
            <Button
              variant="primary"
              size="sm"
              className="px-[var(--spacing-4)] whitespace-nowrap"
              onClick={() => clearsApi.current?.addRow("Medium")}
            >
              <Plus />
              <span>New Row</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => toggleEditing("clears")}
            >
              {editing.clears ? "Done" : "Edit"}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">
          If you’re on a <em>Medium</em> champ, don’t race farm vs <em>Very Fast</em>.
          Path for fights, ganks, or cross-map trades.
        </p>
      </Hero>
    );
  }, [
    tab,
    active,
    subTab,
    subTabs,
    query,
    clearsQuery,
    clearsCount,
    editing,
    setQuery,
    setSubTab,
    toggleEditing,
  ]);

  return (
    <main
      className="page-shell py-6 space-y-6 md:grid md:grid-cols-12 md:gap-4"
      aria-labelledby="teamcomp-header"
    >
      <div className="sticky top-0 hero2-frame relative overflow-hidden rounded-card r-card-lg p-4 md:col-span-12">
        <span aria-hidden className="hero2-beams" />
        <span aria-hidden className="hero2-scanlines" />
        <span aria-hidden className="hero2-noise" />

        <div className="relative z-[2] space-y-[var(--spacing-2)]">
          <Header
            id="teamcomp-header"
            eyebrow="Comps"
            heading="Team Comps Today"
            subtitle="Readable. Fast. On brand."
            icon={<Users2 className="opacity-80" />}
            tabs={{ items: TABS, value: tab, onChange: (k: Tab) => setTab(k) }}
          />
          {hero}
        </div>

        <div
          aria-hidden
          className="absolute inset-0 rounded-card r-card-lg ring-1 ring-inset ring-border/55"
        />
      </div>

      <section className="grid gap-4 md:col-span-12 md:grid-cols-12">
        {TABS.map((t) => (
          <div
            key={t.key}
            id={`${t.key}-panel`}
            role="tabpanel"
            aria-labelledby={`${t.key}-tab`}
            hidden={tab !== t.key}
            tabIndex={tab === t.key ? 0 : -1}
            ref={t.ref}
            className="md:col-span-12"
          >
            {tab === t.key && t.render()}
          </div>
        ))}
      </section>
    </main>
  );
}
