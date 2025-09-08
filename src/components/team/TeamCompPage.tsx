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
import Hero from "@/components/ui/layout/Hero";
import {
  GlitchSegmentedGroup,
  GlitchSegmentedButton,
} from "@/components/ui";
import Builder from "./Builder";
import JungleClears from "./JungleClears";
import CheatSheetTabs from "./CheatSheetTabs";

type Tab = "cheat" | "builder" | "clears";

const TABS = [
  { key: "cheat", label: "Cheat Sheet", hint: "Archetypes, counters, examples", icon: <BookOpenText className="mr-2 h-4 w-4" /> },
  { key: "builder", label: "Builder", hint: "Fill allies vs enemies", icon: <Hammer className="mr-2 h-4 w-4" /> },
  { key: "clears", label: "Jungle Clears", hint: "Relative buckets by speed", icon: <Timer className="mr-2 h-4 w-4" /> },
] as const;

export default function TeamCompPage() {
  const [tab, setTab] = useState<Tab>("cheat");

  return (
    <main className="page-shell py-6 space-y-6">
      <Hero
        eyebrow="Comps"
        heading="Today"
        subtitle="Readable. Fast. On brand."
        icon={<Users2 className="opacity-80" />}
        right={
          <GlitchSegmentedGroup
            value={tab}
            onChange={(v) => setTab(v as Tab)}
            ariaLabel="Comps header mode"
            className="px-2"
          >
            {TABS.map((t) => (
              <GlitchSegmentedButton key={t.key} value={t.key} icon={t.icon}>
                {t.label}
              </GlitchSegmentedButton>
            ))}
          </GlitchSegmentedGroup>
        }
        className="mb-1"
        barClassName="gap-2 items-baseline"
      />

      <section className="grid gap-4">
        <div
          role="tabpanel"
          id="cheat-panel"
          aria-labelledby="cheat-tab"
          hidden={tab !== "cheat"}
        >
          {tab === "cheat" && <CheatSheetTabs />}
        </div>

        <div
          role="tabpanel"
          id="builder-panel"
          aria-labelledby="builder-tab"
          hidden={tab !== "builder"}
        >
          {tab === "builder" && <Builder />}
        </div>

        <div
          role="tabpanel"
          id="clears-panel"
          aria-labelledby="clears-tab"
          hidden={tab !== "clears"}
        >
          {tab === "clears" && <JungleClears />}
        </div>
      </section>
    </main>
  );
}
