"use client";

import * as React from "react";
import { PanelsTopLeft } from "lucide-react";
import { PageHeader, PageShell } from "@/components/ui";
import Badge from "@/components/ui/primitives/Badge";
import ComponentsView from "@/components/prompts/ComponentsView";
import ColorsView from "@/components/prompts/ColorsView";
import {
  COMPS_VIEW_TABS,
  SECTION_TABS,
  SPEC_DATA,
  type Section,
  type CompsView,
} from "@/components/prompts/constants";
import { usePersistentState } from "@/lib/db";
import { useRouter, useSearchParams } from "next/navigation";

function hasSection(value: string): value is Section {
  return Object.prototype.hasOwnProperty.call(SPEC_DATA, value);
}

function getValidSection(value: string | null): Section {
  return value && hasSection(value) ? value : "buttons";
}

function hasView(value: string): value is CompsView {
  return value === "components" || value === "colors";
}

function getValidView(value: string | null): CompsView {
  return value && hasView(value) ? value : "components";
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
    heading: "Layout and container components",
    subtitle:
      "Shells, overlays, and navigation scaffolding that organize Planner surfaces.",
  },
  "page-header": {
    eyebrow: "First impression",
    heading: "Hero and page header components",
    subtitle:
      "Framed intros, hero shells, and portrait accents for high-impact screens.",
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

const COLORS_HERO_COPY = {
  eyebrow: "Palette",
  heading: "Planner color tokens",
  subtitle:
    "Core palettes, gradients, and section cards for Planner surfaces.",
};

export default function CompsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramsString = searchParams.toString();
  const sectionParam = searchParams.get("section");
  const queryParam = searchParams.get("q");
  const viewParam = searchParams.get("view");
  const [, startTransition] = React.useTransition();

  const [section, setSection] = React.useState<Section>(() =>
    getValidSection(sectionParam),
  );
  const [view, setView] = React.useState<CompsView>(() =>
    getValidView(viewParam),
  );
  const [query, setQuery] = usePersistentState("comps-query", "");
  const componentsPanelRef = React.useRef<HTMLDivElement>(null);
  const colorsPanelRef = React.useRef<HTMLDivElement>(null);
  const [filteredCount, setFilteredCount] = React.useState(() =>
    SPEC_DATA[getValidSection(sectionParam)].length,
  );

  const sectionLabel = React.useMemo(
    () =>
      section
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
    [section],
  );

  const resultsLabel = React.useMemo(() => {
    const suffix = filteredCount === 1 ? "spec" : "specs";
    return `${filteredCount} ${sectionLabel.toLowerCase()} ${suffix}`;
  }, [filteredCount, sectionLabel]);

  const heroTabs = React.useMemo(
    () =>
      SECTION_TABS.map((tab) => ({
        ...tab,
        controls: "components-panel",
      })),
    [],
  );

  const heroCopy = React.useMemo(
    () =>
      view === "colors"
        ? COLORS_HERO_COPY
        : SECTION_HERO_COPY[section] ?? SECTION_HERO_COPY.buttons,
    [section, view],
  );

  const sectionCopy = React.useMemo(
    () => SECTION_HERO_COPY[section] ?? SECTION_HERO_COPY.buttons,
    [section],
  );

  const searchLabel = React.useMemo(
    () => `Search ${sectionCopy.heading}`,
    [sectionCopy.heading],
  );

  React.useEffect(() => {
    const next = getValidSection(sectionParam);
    setSection((prev) => (prev === next ? prev : next));
  }, [sectionParam]);

  React.useEffect(() => {
    const next = getValidView(viewParam);
    setView((prev) => (prev === next ? prev : next));
  }, [viewParam]);

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
    const current = getValidView(viewParam);
    if (current === view) return;
    const next = new URLSearchParams(paramsString);
    if (view === "components") {
      next.delete("view");
    } else {
      next.set("view", view);
    }
    startTransition(() => {
      router.replace(`?${next.toString()}`, { scroll: false });
    });
  }, [paramsString, router, startTransition, view, viewParam]);

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
    if (view === "components") {
      componentsPanelRef.current?.focus();
    }
  }, [section, view]);

  React.useEffect(() => {
    if (view === "colors") {
      colorsPanelRef.current?.focus();
    }
  }, [view]);

  React.useEffect(() => {
    setFilteredCount(SPEC_DATA[section].length);
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
          tabs: {
            items: COMPS_VIEW_TABS,
            value: view,
            onChange: (key) => setView(key as CompsView),
            ariaLabel: "Component gallery view",
            idBase: "comps",
            linkPanels: true,
          },
        }}
        frameProps={{
          className:
            "before:pointer-events-none before:absolute before:inset-0 before:z-0 before:rounded-[inherit] before:bg-[radial-gradient(120%_85%_at_10%_-25%,hsl(var(--accent)/0.22),transparent_60%),radial-gradient(120%_85%_at_90%_-25%,hsl(var(--ring)/0.24),transparent_60%)] before:opacity-80 before:mix-blend-screen after:pointer-events-none after:absolute after:inset-0 after:z-0 after:rounded-[inherit] after:bg-[linear-gradient(135deg,hsl(var(--ring)/0.12)_0%,transparent_65%,hsl(var(--accent)/0.16)_100%)] after:opacity-60 after:mix-blend-soft-light",
        }}
        hero={{
          frame: true,
          sticky: false,
          eyebrow: heroCopy.eyebrow,
          heading: heroCopy.heading,
          subtitle: heroCopy.subtitle,
          icon: (
            <span className="[&_svg]:size-[var(--space-6)]">
              <PanelsTopLeft aria-hidden />
            </span>
          ),
          barClassName:
            "isolate overflow-hidden rounded-[var(--radius-2xl)] before:pointer-events-none before:absolute before:inset-0 before:z-0 before:bg-[radial-gradient(120%_80%_at_15%_-20%,hsl(var(--accent)/0.35),transparent_60%),radial-gradient(110%_70%_at_85%_-10%,hsl(var(--ring)/0.3),transparent_65%)] before:opacity-75 before:mix-blend-screen after:pointer-events-none after:absolute after:inset-0 after:z-0 after:bg-[linear-gradient(120deg,hsl(var(--accent)/0.1)_0%,transparent_55%,hsl(var(--ring)/0.14)_100%),repeating-linear-gradient(0deg,hsl(var(--ring)/0.1)_0,hsl(var(--ring)/0.1)_1px,transparent_1px,transparent_var(--space-3))] after:opacity-70 after:mix-blend-soft-light motion-reduce:after:opacity-50",
          subTabs:
            view === "components"
              ? {
                  ariaLabel: "Component section",
                  items: heroTabs,
                  value: section,
                  onChange: (key) => setSection(key as Section),
                  idBase: "comps",
                  linkPanels: true,
                  size: "sm",
                  variant: "neo",
                  showBaseline: true,
                  tablistClassName:
                    "data-[variant=neo]:[--ring:var(--accent)] data-[variant=neo]:px-[calc(var(--space-1)*0.75)] data-[variant=neo]:py-[calc(var(--space-1)*0.75)] data-[variant=neo]:gap-[calc(var(--space-1)*0.75)] data-[variant=neo]:[--neo-tablist-bg:linear-gradient(140deg,hsl(var(--card)/0.9),hsl(var(--surface-2)/0.74))] data-[variant=neo]:[--neo-tab-bg:linear-gradient(145deg,hsl(var(--background)/0.96),hsl(var(--card)/0.82))] motion-reduce:transition-none",
                  className:
                    "max-w-full data-[variant=neo]:[&>div[aria-hidden]]:[background:linear-gradient(90deg,transparent,hsl(var(--accent)/0.55),transparent)] data-[variant=neo]:[&>div[aria-hidden]]:opacity-85",
                }
              : undefined,
          search:
            view === "components"
              ? {
                  id: "comps-search",
                  value: query,
                  onValueChange: setQuery,
                  debounceMs: 250,
                  round: true,
                  variant: "neo",
                  fieldClassName:
                    "motion-reduce:transition-none motion-reduce:hover:!shadow-neo-inset motion-reduce:active:!shadow-neo-inset motion-reduce:focus-within:!shadow-neo-soft",
                  right: (
                    <Badge
                      tone="accent"
                      size="sm"
                      aria-live="polite"
                      className="shadow-none bg-[hsl(var(--surface-2)/0.68)] text-[hsl(var(--foreground)/0.92)] border-[hsl(var(--accent)/0.55)] motion-reduce:transition-none"
                    >
                      {resultsLabel}
                    </Badge>
                  ),
                  "aria-label": searchLabel,
                }
              : undefined,
        }}
      />
      <section className="grid gap-[var(--space-6)]">
        <div
          id="comps-components-panel"
          role="tabpanel"
          aria-labelledby={`comps-components-tab comps-${section}-tab`}
          tabIndex={-1}
          ref={componentsPanelRef}
          hidden={view !== "components"}
          aria-hidden={view !== "components"}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ComponentsView
            query={query}
            section={section}
            onFilteredCountChange={setFilteredCount}
          />
        </div>
        <div
          id="comps-colors-panel"
          role="tabpanel"
          aria-labelledby="comps-colors-tab"
          tabIndex={-1}
          ref={colorsPanelRef}
          hidden={view !== "colors"}
          aria-hidden={view !== "colors"}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ColorsView />
        </div>
      </section>
    </PageShell>
  );
}
