"use client";

import * as React from "react";
import { PanelsTopLeft } from "lucide-react";
import { PageHeader, PageShell } from "@/components/ui";
import { cn } from "@/lib/utils";
import ComponentsViewPanel from "@/components/prompts/ComponentsView";
import ColorsView from "@/components/prompts/ColorsView";
import {
  COMPONENTS_VIEW_TABS,
  SECTION_TABS,
  SPEC_DATA,
  type Section,
  type ComponentsView,
} from "@/components/prompts/constants";
import { usePersistentState } from "@/lib/db";
import { useRouter, useSearchParams } from "next/navigation";

function hasSection(value: string): value is Section {
  return Object.prototype.hasOwnProperty.call(SPEC_DATA, value);
}

function getValidSection(value: string | null): Section {
  return value && hasSection(value) ? value : "buttons";
}

function hasView(value: string): value is ComponentsView {
  return value === "components" || value === "colors";
}

function getValidView(value: string | null): ComponentsView {
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

const NEO_TABLIST_SHARED_CLASSES = [
  "data-[variant=neo]:gap-[var(--space-2)]",
  "data-[variant=neo]:px-[var(--space-2)]",
  "data-[variant=neo]:py-[var(--space-2)]",
  "data-[variant=neo]:[--neo-tablist-bg:linear-gradient(135deg,hsl(var(--card)/0.9),hsl(var(--panel)/0.74))]",
  "data-[variant=neo]:[--neo-tab-bg:linear-gradient(135deg,hsl(var(--card)/0.96),hsl(var(--panel)/0.82))]",
  "data-[variant=neo]:[--shadow-raised:inset_var(--space-1)_var(--space-1)_var(--space-3)_hsl(var(--background)/0.55),inset_-var(--space-1)_-var(--space-1)_var(--space-3)_hsl(var(--highlight)/0.12),0_var(--space-3)_var(--space-6)_hsl(var(--shadow-color)/0.32)]",
  "data-[variant=neo]:[&_[data-active=true]]:relative",
  "data-[variant=neo]:[&_[data-active=true]::after]:content-['']",
  "data-[variant=neo]:[&_[data-active=true]::after]:pointer-events-none",
  "data-[variant=neo]:[&_[data-active=true]::after]:absolute",
  "data-[variant=neo]:[&_[data-active=true]::after]:left-[var(--space-3)]",
  "data-[variant=neo]:[&_[data-active=true]::after]:right-[var(--space-3)]",
  "data-[variant=neo]:[&_[data-active=true]::after]:-bottom-[var(--space-2)]",
  "data-[variant=neo]:[&_[data-active=true]::after]:h-px",
  "data-[variant=neo]:[&_[data-active=true]::after]:rounded-full",
  "data-[variant=neo]:[&_[data-active=true]::after]:underline-gradient",
].join(" ");

const HEADER_FRAME_CLASSNAME = [
  "shadow-[var(--shadow-raised)]",
  "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[inherit]",
  "before:bg-[radial-gradient(120%_82%_at_12%_-20%,hsl(var(--accent)/0.3),transparent_65%),radial-gradient(110%_78%_at_88%_-12%,hsl(var(--ring)/0.28),transparent_70%)]",
  "before:opacity-80 before:mix-blend-screen",
  "after:pointer-events-none after:absolute after:inset-0 after:-z-20 after:rounded-[inherit]",
  "after:bg-[linear-gradient(135deg,hsl(var(--card)/0.9),hsl(var(--panel)/0.78)),radial-gradient(120%_140%_at_50%_120%,hsl(var(--accent-2)/0.2),transparent_75%)]",
  "after:opacity-70 after:mix-blend-soft-light",
  "motion-reduce:before:opacity-60 motion-reduce:after:opacity-50",
].join(" ");

export default function ComponentsPage() {
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
  const [view, setView] = React.useState<ComponentsView>(() =>
    getValidView(viewParam),
  );
  const [query, setQuery] = usePersistentState("components-query", "");
  const componentsPanelRef = React.useRef<HTMLDivElement>(null);
  const colorsPanelRef = React.useRef<HTMLDivElement>(null);
  const previousViewRef = React.useRef<ComponentsView | null>(null);
  const sectionLabel = React.useMemo(
    () =>
      section
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
    [section],
  );

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

  const searchPlaceholder = React.useMemo(
    () => `Search ${sectionLabel.toLowerCase()} specs…`,
    [sectionLabel],
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
    const previousView = previousViewRef.current;
    if (view === "components" && previousView !== "components") {
      componentsPanelRef.current?.focus();
    }
    previousViewRef.current = view;
  }, [view]);

  React.useEffect(() => {
    if (view === "colors") {
      colorsPanelRef.current?.focus();
    }
  }, [view]);

  return (
    <PageShell
      as="main"
      className="space-y-[var(--space-6)] py-[var(--space-6)]"
      aria-labelledby="components-header"
    >
      <PageHeader
        containerClassName="relative isolate"
        header={{
          id: "components-header",
          heading: "Component Gallery",
          subtitle: "Browse Planner UI building blocks by category.",
          sticky: false,
          tabs: {
            items: COMPONENTS_VIEW_TABS,
            value: view,
            onChange: (key) => setView(key as ComponentsView),
            ariaLabel: "Component gallery view",
            idBase: "components",
            linkPanels: true,
            variant: "neo",
            tablistClassName: NEO_TABLIST_SHARED_CLASSES,
          },
        }}
        frameProps={{
          className: HEADER_FRAME_CLASSNAME,
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
            "isolate overflow-hidden rounded-[var(--radius-2xl)] before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(118%_82%_at_15%_-18%,hsl(var(--accent)/0.34),transparent_65%),radial-gradient(112%_78%_at_85%_-12%,hsl(var(--ring)/0.3),transparent_70%)] before:opacity-80 before:mix-blend-screen after:pointer-events-none after:absolute after:inset-0 after:-z-20 after:bg-[linear-gradient(135deg,hsl(var(--card)/0.9),hsl(var(--panel)/0.78)),repeating-linear-gradient(0deg,hsl(var(--ring)/0.12)_0_hsl(var(--ring)/0.12)_1px,transparent_1px,transparent_var(--space-2))] after:opacity-70 after:mix-blend-soft-light motion-reduce:after:opacity-50",
          subTabs:
            view === "components"
              ? {
                  ariaLabel: "Component section",
                  items: heroTabs,
                  value: section,
                  onChange: (key) => setSection(key as Section),
                  idBase: "components",
                  linkPanels: true,
                  size: "sm",
                  variant: "default",
                  showBaseline: true,
                  tablistClassName: "max-w-full shadow-neo-inset",
                  className: "max-w-full",
                  renderItem: ({ item, props, ref, disabled }) => {
                    const {
                      className: baseClassName,
                      onClick,
                      "aria-label": ariaLabelProp,
                      "aria-labelledby": ariaLabelledByProp,
                      title: titleProp,
                      ...restProps
                    } = props;
                    const handleClick: React.MouseEventHandler<HTMLElement> = (
                      event,
                    ) => {
                      onClick?.(event);
                    };
                    const labelText =
                      typeof item.label === "string" || typeof item.label === "number"
                        ? String(item.label)
                        : undefined;
                    const computedTitle = titleProp ?? labelText;
                    const computedAriaLabel =
                      ariaLabelProp ??
                      (labelText && !ariaLabelledByProp ? labelText : undefined);
                    return (
                      <button
                        type="button"
                        {...restProps}
                        ref={ref as React.Ref<HTMLButtonElement>}
                        className={cn(
                          baseClassName,
                          "text-label font-normal text-muted-foreground transition-colors",
                          "data-[active=true]:text-foreground data-[active=true]:font-medium",
                          disabled && "pointer-events-none",
                        )}
                        onClick={(event) => {
                          if (disabled) {
                            event.preventDefault();
                            event.stopPropagation();
                            return;
                          }
                          handleClick(event);
                        }}
                        disabled={disabled}
                        aria-labelledby={ariaLabelledByProp}
                        aria-label={computedAriaLabel}
                        title={computedTitle}
                      >
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  },
                }
              : undefined,
          search:
            view === "components"
              ? {
                  id: "components-search",
                  value: query,
                  onValueChange: setQuery,
                  debounceMs: 250,
                  round: true,
                  variant: "neo",
                  label: searchLabel,
                  placeholder: searchPlaceholder,
                  fieldClassName: cn(
                    "bg-[linear-gradient(135deg,hsl(var(--card)/0.95),hsl(var(--panel)/0.82))]",
                    "!shadow-neo-inset",
                    "hover:!shadow-neo-soft",
                    "active:!shadow-neo-inset",
                    "focus-within:!shadow-neo-soft",
                    "focus-within:[--tw-ring-offset-width:var(--space-1)]",
                    "focus-within:[--tw-ring-offset-color:hsl(var(--panel)/0.82)]",
                    "motion-reduce:transition-none motion-reduce:hover:!shadow-neo-inset motion-reduce:active:!shadow-neo-inset motion-reduce:focus-within:!shadow-neo-soft",
                  ),
                }
              : undefined,
        }}
      />
      <section className="grid gap-[var(--space-6)]">
        <div
          id="components-components-panel"
          role="tabpanel"
          aria-labelledby={`components-components-tab components-${section}-tab`}
          tabIndex={-1}
          ref={componentsPanelRef}
          hidden={view !== "components"}
          aria-hidden={view !== "components"}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ComponentsViewPanel
            query={query}
            section={section}
          />
        </div>
        <div
          id="components-colors-panel"
          role="tabpanel"
          aria-labelledby="components-colors-tab"
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
