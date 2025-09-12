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
import { Users2, BookOpenText, Hammer, Timer } from "lucide-react";
import Header, { type HeaderTab } from "@/components/ui/layout/Header";
import Hero from "@/components/ui/layout/Hero";
import Builder from "./Builder";
import JungleClears from "./JungleClears";
import CheatSheetTabs from "./CheatSheetTabs";

type Tab = "cheat" | "builder" | "clears";

export default function TeamCompPage() {
  const [tab, setTab] = useState<Tab>("cheat");
  const cheatRef = React.useRef<HTMLDivElement>(null);
  const builderRef = React.useRef<HTMLDivElement>(null);
  const clearsRef = React.useRef<HTMLDivElement>(null);
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
        render: () => <CheatSheetTabs />,
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
    [],
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
      <Header
        id="teamcomp-header"
        eyebrow="Comps"
        heading="Team Comps Today"
        subtitle="Readable. Fast. On brand."
        icon={<Users2 className="opacity-80" />}
        tabs={{ items: TABS, value: tab, onChange: (k: Tab) => setTab(k) }}
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
