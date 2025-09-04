// src/components/team/TeamCompPage.tsx
"use client";

/**
 * TeamCompPage — top-level shell with tabs:
 * - Cheat Sheet (archetypes + sub-tabs: Cheat Sheet | My Comps)
 * - Builder (ally vs enemy)
 * - Jungle Clears (speed buckets)
 *
 * Uses Hero (v1) + HeroTabs for the main header.
 * The Cheat Sheet tab itself renders a nested Hero2 internally.
 */
import "../team/style.css";

import { useState } from "react";
import { Users2, BookOpenText, Hammer, Timer } from "lucide-react";
import Hero, { HeroTabs, type HeroTab } from "@/components/ui/layout/Hero";
import Builder from "./Builder";
import JungleClears from "./JungleClears";
import CheatSheetTabs from "./CheatSheetTabs";

type Tab = "cheat" | "builder" | "clears";

const TABS: HeroTab<Tab>[] = [
  { key: "cheat",   label: "Cheat Sheet",   hint: "Archetypes, counters, examples", icon: <BookOpenText className="mr-1" /> },
  { key: "builder", label: "Builder",       hint: "Fill allies vs enemies",         icon: <Hammer className="mr-1" /> },
  { key: "clears",  label: "Jungle Clears", hint: "Relative buckets by speed",      icon: <Timer className="mr-1" /> },
] as const;

export default function TeamCompPage() {
  const [tab, setTab] = useState<Tab>("cheat");

  return (
    <main className="grid gap-4">
      <Hero
        eyebrow="Comps"
        heading="Today"
        subtitle="Readable. Fast. On brand."
        icon={<Users2 className="opacity-80" />}
        right={
          <HeroTabs<Tab>
            tabs={TABS}
            activeKey={tab}
            onChange={(k: Tab) => setTab(k)}
            ariaLabel="Comps views"
          />
        }
        className="mb-1"
      />

      <section className="grid gap-4">
        <div
          role="tabpanel"
          id="hero-cheat-panel"
          aria-labelledby="hero-cheat-tab"
          hidden={tab !== "cheat"}
        >
          {tab === "cheat" && <CheatSheetTabs />}
        </div>

        <div
          role="tabpanel"
          id="hero-builder-panel"
          aria-labelledby="hero-builder-tab"
          hidden={tab !== "builder"}
        >
          {tab === "builder" && <Builder />}
        </div>

        <div
          role="tabpanel"
          id="hero-clears-panel"
          aria-labelledby="hero-clears-tab"
          hidden={tab !== "clears"}
        >
          {tab === "clears" && <JungleClears />}
        </div>
      </section>
    </main>
  );
}
