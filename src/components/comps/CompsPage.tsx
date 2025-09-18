"use client";

import * as React from "react";
import { PanelsTopLeft } from "lucide-react";
import { PageHeader, PageShell } from "@/components/ui";
import ComponentsView from "@/components/prompts/ComponentsView";
import {
  SECTION_TABS,
  SPEC_DATA,
  type Section,
} from "@/components/prompts/constants";
import { usePersistentState } from "@/lib/db";
import { useRouter, useSearchParams } from "next/navigation";

function getValidSection(value: string | null): Section {
  return value && value in SPEC_DATA ? (value as Section) : "buttons";
}

function getNodeText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return `${node}`;
  if (Array.isArray(node)) return node.map(getNodeText).join("");
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return getNodeText(node.props.children ?? null);
  }
  return "";
}

export default function CompsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramsString = searchParams.toString();
  const sectionParam = searchParams.get("section");
  const queryParam = searchParams.get("q");
  const [, startTransition] = React.useTransition();

  const [section, setSection] = React.useState<Section>(() =>
    getValidSection(sectionParam),
  );
  const [query, setQuery] = usePersistentState("comps-query", "");
  const panelRef = React.useRef<HTMLDivElement>(null);

  const heroTabs = React.useMemo(
    () =>
      SECTION_TABS.map((tab) => ({
        ...tab,
        controls: "components-panel",
      })),
    [],
  );

  const sectionLabel = React.useMemo(() => {
    const labelNode = heroTabs.find((tab) => tab.key === section)?.label;
    const label = getNodeText(labelNode);
    return label || "Components";
  }, [heroTabs, section]);

  const searchLabel = React.useMemo(
    () => `Search ${sectionLabel.toLowerCase()} components`,
    [sectionLabel],
  );

  React.useEffect(() => {
    const next = getValidSection(sectionParam);
    setSection((prev) => (prev === next ? prev : next));
  }, [sectionParam]);

  React.useEffect(() => {
    const next = queryParam ?? "";
    if (next !== query) {
      setQuery(next);
    }
  }, [queryParam, query, setQuery]);

  React.useEffect(() => {
    const current = getValidSection(sectionParam);
    if (current === section) return;
    const next = new URLSearchParams(paramsString);
    next.set("section", section);
    startTransition(() => {
      router.replace(`?${next.toString()}`, { scroll: false });
    });
  }, [paramsString, router, section, sectionParam, startTransition]);

  React.useEffect(() => {
    const current = queryParam ?? "";
    if (current === query) return;
    const next = new URLSearchParams(paramsString);
    if (query) {
      next.set("q", query);
    } else {
      next.delete("q");
    }
    startTransition(() => {
      router.replace(`?${next.toString()}`, { scroll: false });
    });
  }, [paramsString, query, queryParam, router, startTransition]);

  React.useEffect(() => {
    panelRef.current?.focus();
  }, [section]);

  return (
    <PageShell
      as="main"
      className="space-y-[var(--space-6)] py-[var(--space-6)]"
      aria-labelledby="comps-header"
    >
      <PageHeader
        header={{
          id: "comps-header",
          heading: "Component Gallery",
          subtitle: "Browse Planner UI building blocks by category.",
          sticky: false,
        }}
        hero={{
          frame: false,
          sticky: false,
          heading: sectionLabel,
          icon: (
            <span className="[&_svg]:size-[var(--space-6)]">
              <PanelsTopLeft aria-hidden />
            </span>
          ),
          subTabs: {
            ariaLabel: "Component section",
            items: heroTabs,
            value: section,
            onChange: (key) => setSection(key as Section),
            idBase: "comps",
          },
          search: {
            id: "comps-search",
            value: query,
            onValueChange: setQuery,
            debounceMs: 250,
            round: true,
            "aria-label": searchLabel,
          },
        }}
      />
      <section className="grid gap-[var(--space-6)]">
        <div
          id="comps-components-panel"
          role="tabpanel"
          aria-labelledby={`comps-${section}-tab`}
          tabIndex={-1}
          ref={panelRef}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ComponentsView
            query={query}
            section={section}
          />
        </div>
      </section>
    </PageShell>
  );
}
