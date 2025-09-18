"use client";

import * as React from "react";
import { PanelsTopLeft } from "lucide-react";
import { PageHeader, PageShell } from "@/components/ui";
import Badge from "@/components/ui/primitives/Badge";
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

const SECTION_HERO_COPY = {
  buttons: {
    eyebrow: "Action triggers",
    heading: "Action-ready button components",
    subtitle:
      "Primary, segmented, and icon buttons that keep Planner workflows moving.",
  },
  inputs: {
    eyebrow: "Data entry",
    heading: "Focused input components",
    subtitle:
      "Fields, textareas, and selectors tuned for confident capture and review.",
  },
  prompts: {
    eyebrow: "Guidance",
    heading: "Prompt and messaging components",
    subtitle:
      "Dialogs, sheets, and toasts that deliver the right nudge at the right moment.",
  },
  planner: {
    eyebrow: "Core surfaces",
    heading: "Planner workflow components",
    subtitle:
      "Boards, goals, and schedule pieces that build the heart of Planner.",
  },
  cards: {
    eyebrow: "Summaries",
    heading: "Card and surface components",
    subtitle:
      "Progress cards and shells that package Planner insights cleanly.",
  },
  layout: {
    eyebrow: "Structure",
    heading: "Layout and framing components",
    subtitle:
      "Headers, heroes, and containers that define the product experience.",
  },
  feedback: {
    eyebrow: "Status",
    heading: "Feedback and state components",
    subtitle:
      "Spinners, skeletons, and snackbars for communicating system status.",
  },
  toggles: {
    eyebrow: "Preferences",
    heading: "Toggle and control components",
    subtitle:
      "Switches and selectors that flip Planner settings instantly.",
  },
  league: {
    eyebrow: "Esports",
    heading: "League companion components",
    subtitle:
      "Role, matchup, and score UI shaped for competitive recaps.",
  },
  misc: {
    eyebrow: "Utilities",
    heading: "Utility and experimental components",
    subtitle:
      "Supporting patterns and helpers that round out the system.",
  },
} satisfies Record<
  Section,
  { eyebrow: string; heading: string; subtitle: string }
>;

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
  const [filteredCount, setFilteredCount] = React.useState(() =>
    SPEC_DATA[getValidSection(sectionParam)].length,
  );
  const panelRef = React.useRef<HTMLDivElement>(null);

  const heroTabs = React.useMemo(
    () =>
      SECTION_TABS.map((tab) => ({
        ...tab,
        controls: "components-panel",
      })),
    [],
  );

  const sectionCopy = React.useMemo(
    () => SECTION_HERO_COPY[section] ?? SECTION_HERO_COPY.buttons,
    [section],
  );

  const sectionLabel = React.useMemo(
    () => sectionCopy.heading,
    [sectionCopy],
  );

  const searchLabel = React.useMemo(
    () => `Search ${sectionLabel}`,
    [sectionLabel],
  );

  const filteredLabel = React.useMemo(() => {
    const suffix = filteredCount === 1 ? "component" : "components";
    return `${filteredCount} ${suffix}`;
  }, [filteredCount]);

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
          eyebrow: sectionCopy.eyebrow,
          heading: sectionCopy.heading,
          subtitle: sectionCopy.subtitle,
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
          actions: (
            <Badge tone="support" size="sm" className="text-muted-foreground">
              {filteredLabel}
            </Badge>
          ),
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
            onFilteredCountChange={setFilteredCount}
          />
        </div>
      </section>
    </PageShell>
  );
}
