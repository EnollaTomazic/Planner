"use client";

import * as React from "react";
import { PageHeader, PageShell, Button, IconButton, Badge } from "@/components/ui";
import { Sparkles, Plus } from "lucide-react";
import ComponentsView from "@/components/prompts/ComponentsView";
import ColorsView from "@/components/prompts/ColorsView";
import OnboardingTabs from "@/components/prompts/OnboardingTabs";
import {
  VIEW_TABS,
  SECTION_TABS,
  type View,
  type Section,
} from "@/components/prompts/constants";
import { usePromptsRouter } from "@/components/prompts/usePromptsRouter";
import { readLocal, writeLocal } from "@/lib/db";
import { useRouter, useSearchParams } from "next/navigation";

export default function Page() {
  return (
    <React.Suspense fallback={<p className="p-4 text-sm">Loading...</p>}>
      <PageContent />
    </React.Suspense>
  );
}

function PageContent() {
  const { view, setView, section, setSection } = usePromptsRouter();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = React.useTransition();
  const queryParam = searchParams.get("q");
  const [query, setQuery] = React.useState("");
  const componentsRef = React.useRef<HTMLDivElement>(null);
  const colorsRef = React.useRef<HTMLDivElement>(null);
  const onboardingRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const q = queryParam ?? "";
    if (q !== query) setQuery(q);
  }, [queryParam, query]);

  React.useEffect(() => {
    const stored = readLocal<string>("prompts-query");
    if (stored) setQuery(stored);
  }, []);

  React.useEffect(() => {
    writeLocal("prompts-query", query);
    const sp = new URLSearchParams(searchParams.toString());
    const current = sp.get("q") ?? "";
    if (current === query) return;
    if (query) sp.set("q", query);
    else sp.delete("q");
    startTransition(() =>
      router.replace(`?${sp.toString()}`, { scroll: false }),
    );
  }, [query, router, searchParams, startTransition]);

  React.useEffect(() => {
    const map: Record<View, React.RefObject<HTMLDivElement>> = {
      components: componentsRef,
      colors: colorsRef,
      onboarding: onboardingRef,
    };
    map[view].current?.focus();
  }, [view]);

  return (
    <PageShell
      as="main"
      className="py-6 space-y-6"
      aria-labelledby="prompts-header"
    >
      <PageHeader
        className="sticky top-0"
        header={{
          id: "prompts-header",
          heading: "Prompts Playground",
          subtitle: "Explore components and tokens",
          icon: <Sparkles className="opacity-80" />,
          tabs: {
            items: VIEW_TABS,
            value: view,
            onChange: (k) => setView(k as View),
          },
        }}
        hero={{
          frame: false,
          heading:
            view === "components"
              ? "Components"
              : view === "colors"
                ? "Colors"
                : "Onboarding",
          ...(view === "components"
            ? {
                subTabs: {
                  items: SECTION_TABS,
                  value: section,
                  onChange: (k: string) => setSection(k as Section),
                },
              }
            : {}),
          search: {
            id: "playground-search",
            value: query,
            onValueChange: setQuery,
            debounceMs: 300,
            round: true,
            "aria-label": "Search components",
          },
          actions: (
            <div className="flex items-center gap-2">
              {view === "colors" ? (
                <Badge
                  size="sm"
                  tone="accent"
                  className="hidden sm:inline-flex border-transparent bg-[hsl(var(--accent-3)/0.16)] text-[hsl(var(--accent-3))] shadow-[0_0_0_1px_hsl(var(--accent-3)/0.25)]"
                >
                  <span className="mr-1 inline-flex h-2 w-2 items-center justify-center">
                    <span
                      aria-hidden="true"
                      className="block h-2 w-2 rounded-full"
                      style={{ backgroundColor: "hsl(var(--accent-3))" }}
                    />
                  </span>
                  Accent 3
                </Badge>
              ) : null}
              <Button size="sm">Action</Button>
              <IconButton size="sm" aria-label="Add">
                <Plus />
              </IconButton>
            </div>
          ),
        }}
      />
      <section className="grid gap-6 lg:grid-cols-1">
        <div className="space-y-6 lg:col-span-full">
          <div>
            <div
              role="tabpanel"
              id="components-panel"
              aria-labelledby="components-tab"
              hidden={view !== "components"}
              tabIndex={view === "components" ? 0 : -1}
              ref={componentsRef}
            >
              <ComponentsView query={query} section={section} />
            </div>
            <div
              role="tabpanel"
              id="colors-panel"
              aria-labelledby="colors-tab"
              hidden={view !== "colors"}
              tabIndex={view === "colors" ? 0 : -1}
              ref={colorsRef}
            >
              <ColorsView />
            </div>
            <div
              role="tabpanel"
              id="onboarding-panel"
              aria-labelledby="onboarding-tab"
              hidden={view !== "onboarding"}
              tabIndex={view === "onboarding" ? 0 : -1}
              ref={onboardingRef}
            >
              <OnboardingTabs />
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
