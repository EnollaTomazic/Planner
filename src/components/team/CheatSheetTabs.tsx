// src/components/team/CheatSheetTabs.tsx
"use client";
import "../team/style.css";

import * as React from "react";
import { BookOpen, Users2 } from "lucide-react";
import { useLocalDB } from "@/lib/db";
import Hero2 from "@/components/ui/layout/Hero2";
import CheatSheet from "./CheatSheet";
import MyComps from "./MyComps";

/* ───────────────── types ───────────────── */
type SubTab = "sheet" | "comps";

const TAB_KEY = "team:cheatsheet:activeSubTab.v1";
const QUERY_KEY = "team:cheatsheet:query.v1";

export default function CheatSheetTabs() {
  const [tab, setTab] = useLocalDB<SubTab>(TAB_KEY, "sheet");
  const [query, setQuery] = useLocalDB<string>(QUERY_KEY, "");

  const tabs = React.useMemo(
    () => [
      { key: "sheet", label: "Cheat Sheet", icon: <BookOpen /> },
      { key: "comps", label: "My Comps", icon: <Users2 /> },
    ],
    []
  );

  return (
    <div className="w-full">
      <Hero2
        eyebrow="Team Comp"
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
          size: "md",
          round: true,
          // No "New Comp" button here; creation lives inside <MyComps />
        }}
      />
      <div className="mt-6">
        {tab === "sheet" ? <CheatSheet dense /> : <MyComps />}
      </div>
    </div>
  );
}
