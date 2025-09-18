"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { NeomorphicFrameStyles } from "./NeomorphicFrameStyles";

type FrameElement = Extract<
  keyof React.JSX.IntrinsicElements,
  "div" | "header" | "section" | "nav" | "article" | "aside" | "main"
>;

type HeroSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type HeroVariant = "default" | "compact" | "dense";

export type Align = "start" | "center" | "end" | "between";

export interface HeroSlots {
  tabs?: React.ReactNode | null;
  search?: React.ReactNode | null;
  actions?: React.ReactNode | null;
}

export interface NeomorphicHeroFrameProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  /** Semantic element for the frame. */
  as?: FrameElement;
  /** Built-in surface styling. */
  variant?: HeroVariant;
  /** Aligns slot content on md+ viewports. */
  align?: Align;
  /** Accessible label for the hero landmark. */
  label?: string;
  /** Reference id for an external heading label. */
  labelledById?: string;
  /** Optional hero slots (tabs, search, actions). */
  slots?: HeroSlots | null;
  /** Hero content rendered inside the frame. */
  children: React.ReactNode;
  className?: string;
}

type HeroGridElement = HTMLDivElement;

type HeroGridProps = React.HTMLAttributes<HeroGridElement> & {
  as?: Extract<keyof React.JSX.IntrinsicElements, "div" | "section" | "ul">;
};

type HeroColElement = HTMLDivElement;

type HeroColProps = React.HTMLAttributes<HeroColElement> & {
  as?: Extract<keyof React.JSX.IntrinsicElements, "div" | "li">;
  span?: HeroSpan;
};

const HERO_COL_SPANS: Record<HeroSpan, string> = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
  5: "md:col-span-5",
  6: "md:col-span-6",
  7: "md:col-span-7",
  8: "md:col-span-8",
  9: "md:col-span-9",
  10: "md:col-span-10",
  11: "md:col-span-11",
  12: "md:col-span-12",
};

export const HeroGrid = React.forwardRef<HeroGridElement, HeroGridProps>(
  ({ as, className, ...rest }, ref) => {
    const Component = (as ?? "div") as React.ElementType;

    return (
      <Component
        ref={ref}
        className={cn(
          "grid gap-[var(--space-3)] md:grid-cols-12 md:gap-[var(--space-4)]",
          className,
        )}
        {...rest}
      />
    );
  },
);

HeroGrid.displayName = "HeroGrid";

export const HeroCol = React.forwardRef<HeroColElement, HeroColProps>(
  ({ as, span = 12, className, ...rest }, ref) => {
    const Component = (as ?? "div") as React.ElementType;

    return (
      <Component
        ref={ref}
        className={cn("col-span-12", HERO_COL_SPANS[span], className)}
        {...rest}
      />
    );
  },
);

HeroCol.displayName = "HeroCol";

const VARIANT_STYLES: Record<
  HeroVariant,
  {
    container: string;
    padding: string;
    content: string;
    slots: {
      mt: string;
      pt: string;
      gap: string;
      wellPadding: string;
      radius: string;
    };
  }
> = {
  default: {
    container:
      "rounded-card r-card-lg border border-[hsl(var(--border)/0.45)] bg-card/70 shadow-outline-subtle",
    padding:
      "px-[var(--space-6)] py-[var(--space-6)] md:px-[var(--space-7)] md:py-[var(--space-7)] lg:px-[var(--space-8)] lg:py-[var(--space-8)]",
    content: "space-y-[var(--space-5)] md:space-y-[var(--space-6)]",
    slots: {
      mt: "mt-[var(--space-6)] md:mt-[var(--space-7)]",
      pt: "pt-[var(--space-5)] md:pt-[var(--space-6)]",
      gap: "gap-[var(--space-3)] md:gap-[var(--space-4)]",
      wellPadding: "p-[var(--space-2)] md:p-[var(--space-3)]",
      radius: "r-card-md",
    },
  },
  compact: {
    container:
      "rounded-card r-card-md border border-[hsl(var(--border)/0.4)] bg-card/65 shadow-outline-subtle",
    padding:
      "px-[var(--space-4)] py-[var(--space-4)] md:px-[var(--space-5)] md:py-[var(--space-5)] lg:px-[var(--space-6)] lg:py-[var(--space-6)]",
    content: "space-y-[var(--space-4)] md:space-y-[var(--space-5)]",
    slots: {
      mt: "mt-[var(--space-5)] md:mt-[var(--space-6)]",
      pt: "pt-[var(--space-4)] md:pt-[var(--space-5)]",
      gap: "gap-[var(--space-3)] md:gap-[var(--space-3)]",
      wellPadding: "p-[var(--space-2)]",
      radius: "r-card-md",
    },
  },
  dense: {
    container:
      "rounded-card r-card-sm border border-[hsl(var(--border)/0.35)] bg-card/60 shadow-outline-faint",
    padding:
      "px-[var(--space-3)] py-[var(--space-3)] md:px-[var(--space-4)] md:py-[var(--space-4)]",
    content: "space-y-[var(--space-3)] md:space-y-[var(--space-4)]",
    slots: {
      mt: "mt-[var(--space-4)] md:mt-[var(--space-4)]",
      pt: "pt-[var(--space-3)] md:pt-[var(--space-3)]",
      gap: "gap-[var(--space-2)] md:gap-[var(--space-3)]",
      wellPadding: "p-[var(--space-1)] md:p-[var(--space-2)]",
      radius: "r-card-sm",
    },
  },
};

const ALIGN_CLASS_MAP: Record<
  Align,
  { tabs: string; search: string; actions: string }
> = {
  start: {
    tabs: "md:justify-self-start",
    search: "md:justify-self-start",
    actions: "md:justify-self-start",
  },
  center: {
    tabs: "md:justify-self-center",
    search: "md:justify-self-center",
    actions: "md:justify-self-center",
  },
  end: {
    tabs: "md:justify-self-end",
    search: "md:justify-self-end",
    actions: "md:justify-self-end",
  },
  between: {
    tabs: "md:justify-self-start",
    search: "md:justify-self-stretch",
    actions: "md:justify-self-end",
  },
};

const SLOT_LAYOUTS: Record<
  string,
  { tabs: HeroSpan; search: HeroSpan; actions: HeroSpan }
> = {
  "tabs-search-actions": { tabs: 5, search: 4, actions: 3 },
  "tabs-search": { tabs: 6, search: 6, actions: 12 },
  "tabs-actions": { tabs: 7, search: 12, actions: 5 },
  "search-actions": { tabs: 12, search: 7, actions: 5 },
  tabs: { tabs: 12, search: 12, actions: 12 },
  search: { tabs: 12, search: 12, actions: 12 },
  actions: { tabs: 12, search: 12, actions: 12 },
  none: { tabs: 12, search: 12, actions: 12 },
};

function getSlotLayout({
  hasTabs,
  hasSearch,
  hasActions,
}: {
  hasTabs: boolean;
  hasSearch: boolean;
  hasActions: boolean;
}) {
  if (hasTabs && hasSearch && hasActions) {
    return SLOT_LAYOUTS["tabs-search-actions"];
  }
  if (hasTabs && hasSearch) {
    return SLOT_LAYOUTS["tabs-search"];
  }
  if (hasTabs && hasActions) {
    return SLOT_LAYOUTS["tabs-actions"];
  }
  if (hasSearch && hasActions) {
    return SLOT_LAYOUTS["search-actions"];
  }
  if (hasTabs) {
    return SLOT_LAYOUTS.tabs;
  }
  if (hasSearch) {
    return SLOT_LAYOUTS.search;
  }
  if (hasActions) {
    return SLOT_LAYOUTS.actions;
  }
  return SLOT_LAYOUTS.none;
}

function sanitizeLabel(value?: string) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

const haloStyles = (
  <style jsx global>{`
    .neo-hero-frame {
      position: relative;
      isolation: isolate;
    }
    .neo-hero-frame::before {
      content: "";
      position: absolute;
      inset: calc(var(--hairline-w) * -2);
      border-radius: inherit;
      pointer-events: none;
      opacity: 0;
      transform: scale(0.98);
      transition: opacity var(--dur-quick) var(--ease-out),
        transform var(--dur-quick) var(--ease-out);
      background: radial-gradient(
        120% 120% at 50% 50%,
        hsl(var(--ring) / 0.25),
        transparent 70%
      );
    }
    .neo-hero-frame:has(:focus-visible)::before,
    .neo-hero-frame[data-has-focus="true"]::before {
      opacity: 1;
      transform: scale(1);
    }
    @media (prefers-reduced-motion: reduce) {
      .neo-hero-frame::before {
        transition: none;
      }
    }
    .hero-focus {
      outline: none;
      position: relative;
    }
    .hero-focus:has(:focus-visible) {
      outline: 2px solid hsl(var(--ring));
      outline-offset: 2px;
    }
    .neo-inset {
      position: relative;
    }
    @media (prefers-reduced-motion: reduce) {
      .hero-focus {
        transition: none;
      }
    }
  `}</style>
);

function assignRef<T>(ref: React.ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    (ref as React.MutableRefObject<T | null>).current = value;
  }
}

const NeomorphicHeroFrame = React.forwardRef<
  HTMLElement,
  NeomorphicHeroFrameProps
>(
  (
    {
      as,
      variant = "default",
      align = "between",
      label,
      labelledById,
      slots,
      children,
      className,
      onFocusCapture,
      onBlurCapture,
      role: roleProp,
      ...rest
    },
    forwardedRef,
  ) => {
    const Component = (as ?? "div") as FrameElement;
    const Comp = Component as React.ElementType;
    const variantStyles = VARIANT_STYLES[variant];
    const slotConfig = variantStyles.slots;
    const slotAlign = ALIGN_CLASS_MAP[align];

    const frameRef = React.useRef<HTMLElement | null>(null);

    const handleRef = React.useCallback(
      (node: HTMLElement | null) => {
        frameRef.current = node;
        assignRef(forwardedRef, node);
      },
      [forwardedRef],
    );

    const [hasFocusVisible, setHasFocusVisible] = React.useState(false);

    const handleFocusCapture = React.useCallback<
      NonNullable<React.HTMLAttributes<HTMLElement>["onFocusCapture"]>
    >(
      (event) => {
        onFocusCapture?.(event);
        if (event.defaultPrevented) return;

        const target = event.target as HTMLElement | null;
        if (target && typeof target.matches === "function") {
          if (target.matches(":focus-visible")) {
            setHasFocusVisible(true);
            return;
          }
        }

        requestAnimationFrame(() => {
          const node = frameRef.current;
          if (!node) return;
          const active = node.querySelector(":focus-visible");
          setHasFocusVisible(Boolean(active));
        });
      },
      [onFocusCapture],
    );

    const handleBlurCapture = React.useCallback<
      NonNullable<React.HTMLAttributes<HTMLElement>["onBlurCapture"]>
    >(
      (event) => {
        onBlurCapture?.(event);
        if (event.defaultPrevented) return;

        requestAnimationFrame(() => {
          const node = frameRef.current;
          if (!node) {
            setHasFocusVisible(false);
            return;
          }
          const active = node.querySelector(":focus-visible");
          setHasFocusVisible(Boolean(active));
        });
      },
      [onBlurCapture],
    );

    const resolvedSlots = slots === null ? null : slots ?? undefined;
    const hasTabs = Boolean(resolvedSlots?.tabs);
    const hasSearch = Boolean(resolvedSlots?.search);
    const hasActions = Boolean(resolvedSlots?.actions);
    const hasSlotContent =
      resolvedSlots !== null && (hasTabs || hasSearch || hasActions);

    const layout = React.useMemo(
      () =>
        getSlotLayout({
          hasTabs,
          hasSearch,
          hasActions,
        }),
      [hasTabs, hasSearch, hasActions],
    );

    const ariaLabel = sanitizeLabel(label);
    const ariaLabelledBy = sanitizeLabel(labelledById);

    const computedRole =
      roleProp ??
      (Component === "header"
        ? "banner"
        : Component === "nav"
        ? "navigation"
        : undefined);

    return (
      <>
        <NeomorphicFrameStyles />
        {haloStyles}
        <Comp
          ref={handleRef}
          className={cn(
            "neo-hero-frame relative isolate overflow-visible hero2-frame hero2-neomorph",
            variantStyles.container,
            variantStyles.padding,
            className,
          )}
          data-variant={variant}
          data-has-focus={hasFocusVisible ? "true" : undefined}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          role={computedRole}
          onFocusCapture={handleFocusCapture}
          onBlurCapture={handleBlurCapture}
          {...rest}
        >
          <div
            className={cn(
              "relative z-[2]",
              variantStyles.content,
            )}
          >
            {children}
          </div>

          {hasSlotContent ? (
            <HeroGrid
              className={cn(
                "neo-hero-frame__slots relative z-[2] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-[hsl(var(--card-hairline)/0.55)] before:opacity-80",
                slotConfig.mt,
                slotConfig.pt,
                slotConfig.gap,
              )}
            >
              {hasTabs ? (
                <HeroCol
                  data-slot="tabs"
                  span={layout.tabs}
                  className={cn(
                    "flex flex-col gap-[var(--space-2)]",
                    slotAlign.tabs,
                  )}
                >
                  <div
                    className={cn(
                      "neo-inset hero-focus rounded-card border border-[hsl(var(--card-hairline)/0.55)] bg-panel/80 shadow-neo-inset",
                      slotConfig.radius,
                      slotConfig.wellPadding,
                    )}
                  >
                    {resolvedSlots?.tabs}
                  </div>
                </HeroCol>
              ) : null}

              {hasSearch ? (
                <HeroCol
                  data-slot="search"
                  span={layout.search}
                  className={cn(
                    "flex flex-col gap-[var(--space-2)]",
                    slotAlign.search,
                  )}
                >
                  <div
                    className={cn(
                      "neo-inset hero-focus rounded-card border border-[hsl(var(--card-hairline)/0.55)] bg-panel/80 shadow-neo-inset",
                      slotConfig.radius,
                      slotConfig.wellPadding,
                    )}
                  >
                    {resolvedSlots?.search}
                  </div>
                </HeroCol>
              ) : null}

              {hasActions ? (
                <HeroCol
                  data-slot="actions"
                  span={layout.actions}
                  className={cn(
                    "hero-focus flex flex-wrap items-center justify-end gap-[var(--space-2)]",
                    slotAlign.actions,
                  )}
                >
                  {resolvedSlots?.actions}
                </HeroCol>
              ) : null}
            </HeroGrid>
          ) : null}
        </Comp>
      </>
    );
  },
);

NeomorphicHeroFrame.displayName = "NeomorphicHeroFrame";

export default NeomorphicHeroFrame;
