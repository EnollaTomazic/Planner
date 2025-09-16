"use client";

import * as React from "react";
import {
  PageHeader,
  PageShell,
  Button,
  IconButton,
  Skeleton,
  Badge,
} from "@/components/ui";
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
import { usePersistentState } from "@/lib/db";
import { useRouter, useSearchParams } from "next/navigation";

function getNodeText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return `${node}`;
  if (Array.isArray(node)) return node.map(getNodeText).join("");
  if (React.isValidElement(node)) return getNodeText(node.props.children);
  return "";
}

export default function Page() {
  return (
    <React.Suspense fallback={<PromptsPageFallback />}>
      <PageContent />
    </React.Suspense>
  );
}

function PromptsPageFallback() {
  return (
    <PageShell
      as="main"
      className="space-y-6 py-6"
      aria-labelledby="prompts-loading-title"
      aria-busy="true"
    >
      <div role="status" aria-live="polite" className="space-y-6">
        <span id="prompts-loading-title" className="sr-only">
          Loading Prompts Playground
        </span>
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-2/5 sm:w-1/3" radius="card" />
            <Skeleton className="w-3/5 sm:w-1/2" />
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Skeleton className="h-10 w-full md:w-96" radius="card" />
            <div className="flex gap-3 md:flex-none">
              <Skeleton className="h-10 w-24" radius="card" />
              <Skeleton className="h-10 w-10" radius="full" />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-9 w-28 flex-1" radius="full" />
            <Skeleton className="h-9 w-28 flex-1" radius="full" />
            <Skeleton className="h-9 w-28 flex-1" radius="full" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" radius="card" />
          <Skeleton className="h-64" radius="card" />
          <Skeleton className="h-64 lg:col-span-2" radius="card" />
        </div>
      </div>
    </PageShell>
  );
}

function PageContent() {
  const { view, setView, section, setSection } = usePromptsRouter();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = React.useTransition();
  const queryParam = searchParams.get("q");
  const [query, setQuery] = usePersistentState("prompts-query", "");
  const componentsRef = React.useRef<HTMLDivElement>(null);
  const colorsRef = React.useRef<HTMLDivElement>(null);
  const onboardingRef = React.useRef<HTMLDivElement>(null);
  const searchLabel = React.useMemo(() => {
    const tab = VIEW_TABS.find((item) => item.key === view);
    const labelText = getNodeText(tab?.label ?? null).trim();
    if (!labelText) return "Search";
    return `Search ${labelText.toLocaleLowerCase()}`;
  }, [view]);

  React.useEffect(() => {
    const q = queryParam ?? "";
    if (q !== query) setQuery(q);
  }, [queryParam, query, setQuery]);

  React.useEffect(() => {
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
            ariaLabel: "Playground view",
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
                  ariaLabel: "Component section",
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
            "aria-label": searchLabel,
          },
          actions: (
            <div className="flex items-center gap-2">
              <Badge
                tone="accent"
                size="sm"
                aria-label="Accent color preview: Accent 3"
                className="bg-accent-soft/20 text-[color:var(--text-on-accent)]"
                style={{
                  backgroundColor:
                    "color-mix(in oklab, var(--accent-overlay) 32%, transparent)",
                }}
              >
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: "hsl(var(--accent-3))" }}
                />
                Accent 3
              </Badge>
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
