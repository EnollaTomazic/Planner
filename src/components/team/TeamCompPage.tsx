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

import * as React from "react";
import { Users2, BookOpenText, Hammer, Timer } from "lucide-react";
import Header, {
  HeaderTabs,
  type HeaderTab,
} from "@/components/ui/layout/Header";
import Hero from "@/components/ui/layout/Hero";
import Builder from "./Builder";
import JungleClears from "./JungleClears";
import CheatSheetTabs from "./CheatSheetTabs";

type Tab = "cheat" | "builder" | "clears";

const TABS: HeaderTab<Tab>[] = [
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
];

export default function TeamCompPage() {
  const [tab, setTab] = React.useState<Tab>("cheat");
  const active = TABS.find((t) => t.key === tab);
  const cheatRef = React.useRef<HTMLDivElement>(null);
  const builderRef = React.useRef<HTMLDivElement>(null);
  const clearsRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const map: Record<Tab, React.RefObject<HTMLDivElement>> = {
      cheat: cheatRef,
      builder: builderRef,
      clears: clearsRef,
    };
    map[tab].current?.focus();
  }, [tab]);

  return (
    <main
      className="page-shell py-6 space-y-6 md:grid md:grid-cols-12 md:gap-4"
      aria-labelledby="teamcomp-header"
    >
      <Header
        id="teamcomp-header"
        eyebrow="Comps"
        heading="Team Comps Today"
        subtitle="Readable. Fast. On brand."
        icon={<Users2 className="opacity-80" />}
        right={
          <HeaderTabs
            tabs={TABS}
            activeKey={tab}
            onChange={(k: Tab) => setTab(k)}
          />
        }
        className="md:col-span-12"
      />
      {tab === "cheat" && (
        <Hero
          topClassName="top-[var(--header-stack)]"
          eyebrow={active?.label}
          heading="Comps"
          subtitle={active?.hint}
          className="md:col-span-12"
        />
      )}

      <section className="grid gap-4 md:col-span-12 md:grid-cols-12">
        <div
          id="cheat-panel"
          role="tabpanel"
          aria-labelledby="cheat-tab"
          hidden={tab !== "cheat"}
          tabIndex={tab === "cheat" ? 0 : -1}
          ref={cheatRef}
          className="md:col-span-12"
        >
          {tab === "cheat" && <CheatSheetTabs />}
        </div>

        <div
          id="builder-panel"
          role="tabpanel"
          aria-labelledby="builder-tab"
          hidden={tab !== "builder"}
          tabIndex={tab === "builder" ? 0 : -1}
          ref={builderRef}
          className="md:col-span-12"
        >
          {tab === "builder" && <Builder />}
        </div>

        <div
          id="clears-panel"
          role="tabpanel"
          aria-labelledby="clears-tab"
          hidden={tab !== "clears"}
          tabIndex={tab === "clears" ? 0 : -1}
          ref={clearsRef}
          className="md:col-span-12"
        >
          {tab === "clears" && <JungleClears />}
        </div>
      </section>
    </main>
  );
}
