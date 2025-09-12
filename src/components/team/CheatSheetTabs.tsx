// src/components/team/CheatSheetTabs.tsx
"use client";
import "./style.css";

import * as React from "react";
import { BookOpen, Users2 } from "lucide-react";
import { usePersistentState } from "@/lib/db";
import Hero from "@/components/ui/layout/Hero";
import CheatSheet from "./CheatSheet";
import MyComps from "./MyComps";

/* ───────────────── types ───────────────── */
type SubTab = "sheet" | "comps";

const TAB_KEY = "team:cheatsheet:activeSubTab.v1";
const QUERY_KEY = "team:cheatsheet:query.v1";

export default function CheatSheetTabs() {
  const [tab, setTab] = usePersistentState<SubTab>(TAB_KEY, "sheet");
  const [query, setQuery] = usePersistentState<string>(QUERY_KEY, "");

  const tabs = React.useMemo(
    () => [
      { key: "sheet", label: "Cheat Sheet", icon: <BookOpen /> },
      { key: "comps", label: "My Comps", icon: <Users2 /> },
    ],
    []
  );

  const panelRefs = React.useRef<Record<SubTab, HTMLDivElement | null>>({
    sheet: null,
    comps: null,
  });

  const [ids, setIds] = React.useState<
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
    (Object.keys(map) as SubTab[]).forEach(k => {
      const tabEl = document.querySelector<HTMLButtonElement>(
        `[role="tab"][aria-controls$="${map[k]}-panel"]`
      );
      if (tabEl) {
        next[k] = {
          tab: tabEl.id,
          panel: tabEl.getAttribute("aria-controls") ?? `${map[k]}-panel`,
        };
      }
    });
    setIds(next);
  }, []);

  React.useEffect(() => {
    panelRefs.current[tab]?.focus();
  }, [tab]);

  return (
    <div className="w-full">
      <Hero
        eyebrow="Comps"
        heading="Cheat Sheet"
        subtitle={tab === "sheet" ? "Archetypes & tips" : "Your saved compositions"}
        tabs={{
          items: tabs,
          value: tab,
          onChange: k => setTab(k as SubTab),
          showBaseline: true,
        }}
        search={{
          value: query,
          onValueChange: setQuery,
          placeholder: "Search…",
          round: true,
        }}
      />
      <div className="mt-6">
        <div
          id={ids.sheet.panel}
          role="tabpanel"
          aria-labelledby={ids.sheet.tab}
          hidden={tab !== "sheet"}
          tabIndex={tab === "sheet" ? 0 : -1}
          ref={el => {
            panelRefs.current.sheet = el;
          }}
        >
          {tab === "sheet" && <CheatSheet dense query={query} />}
        </div>
        <div
          id={ids.comps.panel}
          role="tabpanel"
          aria-labelledby={ids.comps.tab}
          hidden={tab !== "comps"}
          tabIndex={tab === "comps" ? 0 : -1}
          ref={el => {
            panelRefs.current.comps = el;
          }}
        >
          {tab === "comps" && <MyComps query={query} />}
        </div>
      </div>
    </div>
  );
}
