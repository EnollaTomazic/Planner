"use client";

import * as React from "react";
import { PanelsTopLeft } from "lucide-react";

import type { DesignTokenGroup, GalleryNavigationData } from "@/components/gallery/types";
import { PageHeader, PageShell } from "@/components/ui";
import { cn } from "@/lib/utils";

import ComponentsGalleryPanels from "./ComponentsGalleryPanels";
import {
  COMPONENTS_PANEL_ID,
  COMPONENTS_SECTION_TAB_ID_BASE,
  COMPONENTS_VIEW_TAB_ID_BASE,
  useComponentsGalleryState,
} from "./useComponentsGalleryState";

const NEO_TABLIST_SHARED_CLASSES = [
  "data-[variant=neo]:rounded-card",
  "data-[variant=neo]:r-card-lg",
  "data-[variant=neo]:gap-[var(--space-2)]",
  "data-[variant=neo]:px-[var(--space-2)]",
  "data-[variant=neo]:py-[var(--space-2)]",
  "data-[variant=neo]:[--neo-tablist-bg:linear-gradient(135deg,hsl(var(--card)/0.9),hsl(var(--panel)/0.74))]",
  "data-[variant=neo]:[--neo-tab-bg:linear-gradient(135deg,hsl(var(--card)/0.96),hsl(var(--panel)/0.82))]",
  "data-[variant=neo]:shadow-neo",
  "data-[variant=neo]:hover:shadow-neo-soft",
  "data-[variant=neo]:[&_[data-active=true]]:relative",
  "data-[variant=neo]:[&_[data-active=true]::after]:content-['']",
  "data-[variant=neo]:[&_[data-active=true]::after]:pointer-events-none",
  "data-[variant=neo]:[&_[data-active=true]::after]:absolute",
  "data-[variant=neo]:[&_[data-active=true]::after]:left-[var(--space-3)]",
  "data-[variant=neo]:[&_[data-active=true]::after]:right-[var(--space-3)]",
  "data-[variant=neo]:[&_[data-active=true]::after]:-bottom-[var(--space-2)]",
  "data-[variant=neo]:[&_[data-active=true]::after]:h-[var(--hairline-w)]",
  "data-[variant=neo]:[&_[data-active=true]::after]:rounded-full",
  "data-[variant=neo]:[&_[data-active=true]::after]:underline-gradient",
].join(" ");

const HEADER_FRAME_CLASSNAME = [
  "shadow-neo",
  "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[inherit]",
  "before:bg-[radial-gradient(120%_82%_at_12%_-20%,hsl(var(--accent)/0.3),transparent_65%),radial-gradient(110%_78%_at_88%_-12%,hsl(var(--ring)/0.28),transparent_70%)]",
  "before:opacity-80 before:mix-blend-screen",
  "after:pointer-events-none after:absolute after:inset-0 after:-z-20 after:rounded-[inherit]",
  "after:bg-[linear-gradient(135deg,hsl(var(--card)/0.9),hsl(var(--panel)/0.78)),radial-gradient(120%_140%_at_50%_120%,hsl(var(--accent-2)/0.2),transparent_75%)]",
  "after:opacity-70 after:mix-blend-soft-light",
  "motion-reduce:before:opacity-60 motion-reduce:after:opacity-50",
].join(" ");

interface ComponentsPageClientProps {
  readonly navigation: GalleryNavigationData;
  readonly tokenGroups: readonly DesignTokenGroup[];
}

export default function ComponentsPageClient({
  navigation,
  tokenGroups,
}: ComponentsPageClientProps) {
  const {
    view,
    section,
    query,
    setQuery,
    heroCopy,
    heroTabs,
    viewTabs,
    inPageNavigation,
    showSectionTabs,
    searchLabel,
    searchPlaceholder,
    filteredSpecs,
    sectionLabel,
    countLabel,
    countDescriptionId,
    componentsPanelLabelledBy,
    handleViewChange,
    handleSectionChange,
    componentsPanelRef,
    tokensPanelRef,
  } = useComponentsGalleryState({ navigation });

  return (
    <>
      <PageShell
        as="header"
        className="py-[var(--space-6)] md:py-[var(--space-7)] lg:py-[var(--space-8)]"
      >
        <PageHeader
          containerClassName="relative isolate col-span-full"
          header={{
            id: "components-header",
            heading: "Component Gallery",
            subtitle: "Browse Planner UI building blocks by category.",
            sticky: false,
            nav:
              inPageNavigation.length > 0
                ? (
                    <nav aria-label="Component categories">
                      <ul className="flex flex-wrap items-center gap-[var(--space-2)]">
                        {inPageNavigation.map((item) => {
                          const isActive = view === item.id;
                          return (
                            <li key={item.id}>
                              <a
                                href={item.href}
                                className={cn(
                                  "text-label font-medium transition-colors",
                                  "text-muted-foreground hover:text-foreground focus-visible:text-foreground",
                                  isActive && "text-foreground",
                                )}
                                aria-current={isActive ? "page" : undefined}
                                onClick={(event) => {
                                  event.preventDefault();
                                  if (view !== item.id) {
                                    handleViewChange(item.id);
                                  }
                                  const targetHash = item.href.startsWith("#")
                                    ? item.href.slice(1)
                                    : item.href;
                                  if (targetHash && typeof window !== "undefined") {
                                    window.location.hash = targetHash;
                                  }
                                }}
                              >
                                {item.label}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </nav>
                  )
                : undefined,
            tabs: {
              items: viewTabs,
              value: view,
              onChange: handleViewChange,
              ariaLabel: "Component gallery view",
              idBase: COMPONENTS_VIEW_TAB_ID_BASE,
              linkPanels: true,
              variant: "neo",
              tablistClassName: cn(NEO_TABLIST_SHARED_CLASSES, "w-full md:w-auto"),
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
              "isolate overflow-hidden rounded-card r-card-lg before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(118%_82%_at_15%_-18%,hsl(var(--accent)/0.34),transparent_65%),radial-gradient(112%_78%_at_85%_-12%,hsl(var(--ring)/0.3),transparent_70%)] before:opacity-80 before:mix-blend-screen after:pointer-events-none after:absolute after:inset-0 after:-z-20 after:bg-[linear-gradient(135deg,hsl(var(--card)/0.9),hsl(var(--panel)/0.78)),repeating-linear-gradient(0deg,hsl(var(--ring)/0.12)_0_hsl(var(--ring)/0.12)_var(--hairline-w),transparent_var(--hairline-w),transparent_var(--space-2))] after:opacity-70 after:mix-blend-soft-light motion-reduce:after:opacity-50",
            subTabs: showSectionTabs
              ? {
                  ariaLabel: "Component section",
                  items: heroTabs,
                  value: section,
                  onChange: handleSectionChange,
                  idBase: COMPONENTS_SECTION_TAB_ID_BASE,
                  linkPanels: true,
                  size: "sm",
                  variant: "default",
                  showBaseline: true,
                  tablistClassName: cn(
                    "max-w-full shadow-neo-inset rounded-card r-card-lg",
                    "w-full md:w-auto",
                  ),
                  className: "max-w-full w-full md:w-auto",
                  renderItem: ({ item, props, ref, disabled }) => {
                    const {
                      className: baseClassName,
                      onClick,
                      "aria-label": ariaLabelProp,
                      "aria-labelledby": ariaLabelledByProp,
                      "aria-controls": ariaControlsProp,
                      title: titleProp,
                      ...restProps
                    } = props;
                    const handleClick: React.MouseEventHandler<HTMLElement> = (
                      event,
                    ) => {
                      onClick?.(event);
                      handleSectionChange(item.key);
                    };
                    const labelText =
                      typeof item.label === "string" ? item.label : undefined;
                    const computedTitle = titleProp ?? labelText;
                    const computedAriaLabel =
                      ariaLabelProp ??
                      (labelText && !ariaLabelledByProp ? labelText : undefined);
                    const computedAriaControls =
                      ariaControlsProp != null ? COMPONENTS_PANEL_ID : undefined;

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
                        aria-controls={computedAriaControls}
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
              showSectionTabs
                ? {
                    id: "components-search",
                    value: query,
                    onValueChange: setQuery,
                    debounceMs: 300,
                    round: true,
                    variant: "neo",
                    label: searchLabel,
                    placeholder: searchPlaceholder,
                    fieldClassName: cn(
                      "bg-[linear-gradient(135deg,hsl(var(--card)/0.95),hsl(var(--panel)/0.82))]",
                      "!shadow-neo-soft",
                      "hover:!shadow-neo-soft",
                      "active:!shadow-neo-soft",
                      "focus-within:!shadow-neo-soft",
                      "focus-within:[--tw-ring-offset-width:var(--space-1)]",
                      "focus-within:[--tw-ring-offset-color:hsl(var(--panel)/0.82)]",
                      "motion-reduce:transition-none motion-reduce:hover:!shadow-neo-soft motion-reduce:active:!shadow-neo-soft motion-reduce:focus-within:!shadow-neo-soft",
                    ),
                  }
                : undefined,
          }}
        />
      </PageShell>

      <PageShell
        as="section"
        id={`components-${view}`}
        grid
        aria-labelledby="components-header"
        className="scroll-mt-[calc(env(safe-area-inset-top)+var(--header-stack)+var(--space-2))] py-[var(--space-6)] md:py-[var(--space-7)] lg:py-[var(--space-8)]"
        contentClassName="gap-y-[var(--space-6)] md:gap-y-[var(--space-7)] lg:gap-y-[var(--space-8)]"
      >
        <ComponentsGalleryPanels
          view={view}
          filteredSpecs={filteredSpecs}
          sectionLabel={sectionLabel}
          countLabel={countLabel}
          countDescriptionId={countDescriptionId}
          componentsPanelLabelledBy={componentsPanelLabelledBy}
          componentsPanelRef={componentsPanelRef}
          tokensPanelRef={tokensPanelRef}
          tokenGroups={tokenGroups}
        />
      </PageShell>
    </>
  );
}
