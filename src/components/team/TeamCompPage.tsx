// src/components/team/TeamCompPage.tsx
"use client";

/**
 * TeamCompPage — top-level shell with tabs:
 * - Cheat Sheet (archetypes + sub-tabs: Cheat Sheet | My Comps)
 * - Builder (ally vs enemy)
 * - Jungle Clears (speed buckets)
 *
 * Header hosts the main tabs; the Cheat Sheet tab still renders its own
 * nested Hero internally.
 * A top-level Hero summarizes the active tab.
 */
import "./style.css";

import React, { useState } from "react";
import { Users2, BookOpenText, BookOpen, Hammer, Timer } from "lucide-react";
import Header, { type HeaderTab } from "@/components/ui/layout/Header";
import Hero from "@/components/ui/layout/Hero";
import Builder from "./Builder";
import JungleClears from "./JungleClears";
import CheatSheet from "./CheatSheet";
import MyComps from "./MyComps";
import { usePersistentState } from "@/lib/db";

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
  const clearsRef = React.useRef<HTMLDivElement>(null);
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
          {subTab === "sheet" && <CheatSheet dense query={query} />}
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
          {subTab === "comps" && <MyComps query={query} />}
        </div>
      </div>
    ),
    [subIds, subTab, query],
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
        render: () => <Builder />,
        ref: builderRef,
      },
      {
        key: "clears",
        label: "Jungle Clears",
        hint: "Relative buckets by speed",
        icon: <Timer />,
        render: () => <JungleClears />,
        ref: clearsRef,
      },
    ],
    [renderCheat],
  );
  const active = TABS.find((t) => t.key === tab);
  React.useEffect(() => {
    TABS.find((t) => t.key === tab)?.ref.current?.focus();
  }, [tab, TABS]);

  return (
    <main
      className="page-shell py-6 space-y-6 md:grid md:grid-cols-12 md:gap-4"
      aria-labelledby="teamcomp-header"
    >
      <div className="space-y-[var(--spacing-2)] md:col-span-12">
        <Header
          id="teamcomp-header"
          eyebrow="Comps"
          heading="Team Comps Today"
          subtitle="Readable. Fast. On brand."
          icon={<Users2 className="opacity-80" />}
          tabs={{ items: TABS, value: tab, onChange: (k: Tab) => setTab(k) }}
        />
        {tab === "cheat" && (
          <Hero
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
          />
        )}
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
