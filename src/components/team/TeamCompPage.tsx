// src/components/team/TeamCompPage.tsx
"use client";

/**
 * TeamCompPage — top-level shell with tabs:
 * - Cheat Sheet (archetypes + sub-tabs: Cheat Sheet | My Comps)
 * - Builder (ally vs enemy)
 * - Jungle Clears (speed buckets)
 *
 * Uses Hero2 for the main header with built-in tabs.
 * The Cheat Sheet tab itself renders a nested Hero2 internally.
 */
import "./style.css";

import { useState } from "react";
import { Users2, BookOpenText, Hammer, Timer } from "lucide-react";
import Header from "@/components/ui/layout/Header";
import Hero2 from "@/components/ui/layout/Hero2";
import Builder from "./Builder";
import JungleClears from "./JungleClears";
import CheatSheetTabs from "./CheatSheetTabs";

type Tab = "cheat" | "builder" | "clears";

const TABS = [
  {
    key: "cheat",
    label: "Cheat Sheet",
    hint: "Archetypes, counters, examples",
    icon: <BookOpenText />,
  },
  {
    key: "builder",
    label: "Builder",
    hint: "Fill allies vs enemies",
    icon: <Hammer />,
  },
  {
    key: "clears",
    label: "Jungle Clears",
    hint: "Relative buckets by speed",
    icon: <Timer />,
  },
] as const;

export default function TeamCompPage() {
  const [tab, setTab] = useState<Tab>("cheat");

  return (
    <main className="page-shell py-6 space-y-6">
      <div className="space-y-2">
        <Header
          eyebrow="Comps"
          heading="Today"
          subtitle="Readable. Fast. On brand."
          icon={<Users2 className="opacity-80" />}
        />
        <Hero2
          eyebrow="Comps"
          heading="Today"
          subtitle="Readable. Fast. On brand."
          icon={<Users2 className="opacity-80" />}
          tabs={{
            items: TABS.map((t) => ({
              key: t.key,
              label: t.label,
              icon: t.icon,
            })),
            value: tab,
            onChange: (k) => setTab(k as Tab),
            align: "end",
            className: "px-2",
          }}
          className="mb-1"
          barClassName="gap-2 items-baseline"
        />
      </div>

      <section className="grid gap-4">
        <div role="tabpanel" hidden={tab !== "cheat"}>
          {tab === "cheat" && <CheatSheetTabs />}
        </div>

        <div role="tabpanel" hidden={tab !== "builder"}>
          {tab === "builder" && <Builder />}
        </div>

        <div role="tabpanel" hidden={tab !== "clears"}>
          {tab === "clears" && <JungleClears />}
        </div>
      </section>
    </main>
  );
}
