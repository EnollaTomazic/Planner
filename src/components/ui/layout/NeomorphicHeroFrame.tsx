// src/components/ui/layout/NeomorphicHeroFrame.tsx
"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import { NeomorphicFrameStyles } from "./NeomorphicFrameStyles";

type FrameElement = Extract<
  keyof React.JSX.IntrinsicElements,
  "div" | "header" | "section" | "nav" | "article" | "aside" | "main"
>;

export type HeroVariant = "default" | "compact" | "dense" | "unstyled";
export type Align = "start" | "center" | "end" | "between";

const heroSlotOrder = ["tabs", "search", "actions"] as const;
type HeroSlotKey = (typeof heroSlotOrder)[number];

export interface HeroSlot {
  node: React.ReactNode;
  className?: string;
  label?: string;
  labelledById?: string;
  unstyled?: boolean;
}

export type HeroSlotInput = React.ReactNode | HeroSlot;

export type HeroSlots = Partial<Record<HeroSlotKey, HeroSlotInput>>;

export interface NeomorphicHeroFrameProps
  extends React.HTMLAttributes<HTMLElement> {
  as?: FrameElement;
  variant?: HeroVariant;
  align?: Align;
  label?: string;
  labelledById?: string;
  slots?: HeroSlots | null;
  children?: React.ReactNode;
}

type VariantSlotConfig = {
  marginTop: string;
  paddingTop: string;
  gapY: string;
  gapMd: string;
  single: {
    marginTop: string;
    paddingTop: string;
  };
};

type VariantConfig = {
  radius: string;
  padding: string;
  contentSpacing: string;
  slot: VariantSlotConfig;
};

const variantMap: Record<Exclude<HeroVariant, "unstyled">, VariantConfig> = {
  default: {
    radius: "rounded-card r-card-lg",
    padding:
      "px-[var(--space-6)] py-[var(--space-6)] md:px-[var(--space-7)] md:py-[var(--space-7)] lg:px-[var(--space-8)] lg:py-[var(--space-8)]",
    contentSpacing:
      "space-y-[var(--space-5)] md:space-y-[var(--space-6)]",
    slot: {
      marginTop: "mt-[var(--space-6)] md:mt-[var(--space-7)]",
      paddingTop: "pt-[var(--space-5)] md:pt-[var(--space-6)]",
      gapY: "gap-[var(--space-3)]",
      gapMd: "md:gap-[var(--space-4)]",
      single: {
        marginTop: "mt-[var(--space-4)] md:mt-[var(--space-5)]",
        paddingTop: "pt-[var(--space-4)] md:pt-[var(--space-5)]",
      },
    },
  },
  compact: {
    radius: "rounded-card r-card-md",
    padding:
      "px-[var(--space-4)] py-[var(--space-4)] md:px-[var(--space-5)] md:py-[var(--space-5)] lg:px-[var(--space-6)] lg:py-[var(--space-6)]",
    contentSpacing:
      "space-y-[var(--space-4)] md:space-y-[var(--space-5)]",
    slot: {
      marginTop: "mt-[var(--space-5)]",
      paddingTop: "pt-[var(--space-4)] md:pt-[var(--space-5)]",
      gapY: "gap-[var(--space-3)]",
      gapMd: "md:gap-[var(--space-3)]",
      single: {
        marginTop: "mt-[var(--space-4)]",
        paddingTop: "pt-[var(--space-3)] md:pt-[var(--space-4)]",
      },
    },
  },
  dense: {
    radius: "rounded-card r-card-md",
    padding:
      "px-[var(--space-3)] py-[var(--space-3)] md:px-[var(--space-4)] md:py-[var(--space-4)] lg:px-[var(--space-5)] lg:py-[var(--space-5)]",
    contentSpacing:
      "space-y-[var(--space-3)] md:space-y-[var(--space-4)]",
    slot: {
      marginTop: "mt-[var(--space-4)]",
      paddingTop: "pt-[var(--space-3)] md:pt-[var(--space-4)]",
      gapY: "gap-[var(--space-2)]",
      gapMd: "md:gap-[var(--space-3)]",
      single: {
        marginTop: "mt-[var(--space-3)]",
        paddingTop: "pt-[var(--space-2)] md:pt-[var(--space-3)]",
      },
    },
  },
};

const alignClassMap: Record<Align, { tabs: string; search: string; actions: string }> = {
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

const spanClassMap = {
  tabs: {
    three: "md:col-span-5",
    twoWithActions: "md:col-span-7",
    two: "md:col-span-6",
    solo: "md:col-span-12",
  },
  search: {
    three: "md:col-span-4",
    twoWithActions: "md:col-span-7",
    two: "md:col-span-6",
    solo: "md:col-span-12",
  },
  actions: {
    three: "md:col-span-3",
    twoWithTabs: "md:col-span-5",
    two: "md:col-span-5",
    solo: "md:col-span-12",
  },
} as const satisfies Record<HeroSlotKey, Record<string, string>>;

type LayoutState = {
  tabs?: string;
  search?: string;
  actions?: string;
};

function getSlotLayout(
  present: Record<HeroSlotKey, boolean>,
): LayoutState {
  const { tabs, search, actions } = present;
  if (tabs && search && actions) {
    return {
      tabs: spanClassMap.tabs.three,
      search: spanClassMap.search.three,
      actions: spanClassMap.actions.three,
    };
  }
  if (tabs && search) {
    return {
      tabs: spanClassMap.tabs.two,
      search: spanClassMap.search.two,
      actions: spanClassMap.actions.solo,
    };
  }
  if (tabs && actions) {
    return {
      tabs: spanClassMap.tabs.twoWithActions,
      search: spanClassMap.search.solo,
      actions: spanClassMap.actions.twoWithTabs,
    };
  }
  if (search && actions) {
    return {
      tabs: spanClassMap.tabs.solo,
      search: spanClassMap.search.twoWithActions,
      actions: spanClassMap.actions.two,
    };
  }
  return {
    tabs: spanClassMap.tabs.solo,
    search: spanClassMap.search.solo,
    actions: spanClassMap.actions.solo,
  };
}

function isSlotConfig(value: HeroSlotInput | undefined): value is HeroSlot {
  return (
    typeof value === "object" &&
    value !== null &&
    !React.isValidElement(value) &&
    Object.prototype.hasOwnProperty.call(value, "node")
  );
}

function normalizeSlot(value: HeroSlotInput | undefined): HeroSlot | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (isSlotConfig(value)) {
    return value.node === null || value.node === undefined
      ? null
      : value;
  }
  return { node: value };
}

const slotWellBaseClass =
  "hero-slot-well group/hero-slot relative isolate flex min-w-0 flex-col gap-[var(--space-2)] overflow-hidden rounded-card r-card-md bg-card/75 px-[var(--space-3)] py-[var(--space-2)] [--neo-inset-shadow:var(--shadow-neo-inset)] neo-inset hero-focus transition-[box-shadow,transform] duration-[var(--dur-chill)] ease-[var(--ease-out)] motion-reduce:transform-none motion-reduce:transition-none focus-within:ring-1 focus-within:ring-ring/60 before:pointer-events-none before:absolute before:inset-0 before:z-0 before:content-[''] before:rounded-[inherit] before:bg-[radial-gradient(circle_at_top_left,hsl(var(--highlight)/0.35)_0%,transparent_62%)] before:opacity-70 before:mix-blend-screen after:pointer-events-none after:absolute after:inset-0 after:z-0 after:content-[''] after:rounded-[inherit] after:translate-x-[calc(var(--space-1)/2)] after:translate-y-[calc(var(--space-1)/2)] after:bg-[radial-gradient(circle_at_bottom_right,hsl(var(--shadow-color)/0.28)_0%,transparent_65%)] after:shadow-[var(--shadow-neo-soft)] after:opacity-65 hover:[--neo-inset-shadow:var(--shadow-neo-soft)] focus-visible:[--neo-inset-shadow:var(--shadow-neo-soft)] focus-within:[--neo-inset-shadow:var(--shadow-neo-soft)] hover:-translate-y-[var(--hairline-w)] focus-visible:-translate-y-[var(--hairline-w)] focus-within:-translate-y-[var(--hairline-w)]";

const slotBareBaseClass =
  "group/hero-slot relative isolate flex min-w-0 flex-col";

const slotContentClass = "relative z-[1] flex w-full min-w-0 flex-col";

const heroGridGaps: Record<Exclude<HeroVariant, "unstyled">, string> = {
  default: "gap-[var(--space-4)] md:gap-[var(--space-6)]",
  compact: "gap-[var(--space-3)] md:gap-[var(--space-4)]",
  dense: "gap-[var(--space-2)] md:gap-[var(--space-3)]",
};

export interface HeroGridProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Exclude<HeroVariant, "unstyled">;
}

export const HeroGrid = React.forwardRef<HTMLDivElement, HeroGridProps>(
  ({ variant = "default", className, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "grid grid-cols-1 md:grid-cols-12",
          heroGridGaps[variant],
          className,
        )}
        {...rest}
      />
    );
  },
);

HeroGrid.displayName = "HeroGrid";

const heroColSpanClasses = {
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
} as const;

const heroColSpanLgClasses = {
  1: "lg:col-span-1",
  2: "lg:col-span-2",
  3: "lg:col-span-3",
  4: "lg:col-span-4",
  5: "lg:col-span-5",
  6: "lg:col-span-6",
  7: "lg:col-span-7",
  8: "lg:col-span-8",
  9: "lg:col-span-9",
  10: "lg:col-span-10",
  11: "lg:col-span-11",
  12: "lg:col-span-12",
} as const;

export interface HeroColProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: keyof typeof heroColSpanClasses;
  spanLg?: keyof typeof heroColSpanLgClasses;
}

export const HeroCol = React.forwardRef<HTMLDivElement, HeroColProps>(
  ({ span = 12, spanLg, className, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "col-span-full min-w-0",
          heroColSpanClasses[span],
          spanLg ? heroColSpanLgClasses[spanLg] : undefined,
          className,
        )}
        {...rest}
      />
    );
  },
);

HeroCol.displayName = "HeroCol";

const NeomorphicHeroFrame = React.forwardRef<HTMLElement, NeomorphicHeroFrameProps>(
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
      role: roleProp,
      tabIndex,
      onFocusCapture,
      onBlurCapture,
      ...rest
    },
    ref,
  ) => {
    const Component = (as ?? "div") as FrameElement;
    const Comp = Component as React.ElementType;
    const variantStyles =
      variant !== "unstyled" ? variantMap[variant] : undefined;
    const [hasFocus, setHasFocus] = React.useState(false);

    const normalizedSlots = React.useMemo(() => {
      if (slots === null) return null;
      if (!slots) return undefined;
      const entries: Partial<Record<HeroSlotKey, HeroSlot>> = {};
      let any = false;
      for (const key of heroSlotOrder) {
        const normalized = normalizeSlot(slots[key]);
        if (normalized) {
          entries[key] = normalized;
          any = true;
        }
      }
      return any ? entries : undefined;
    }, [slots]);

    const hasTabs = Boolean(normalizedSlots?.tabs);
    const hasSearch = Boolean(normalizedSlots?.search);
    const hasActions = Boolean(normalizedSlots?.actions);
    const slotCount = Number(hasTabs) + Number(hasSearch) + Number(hasActions);

    const layout = React.useMemo(
      () =>
        normalizedSlots
          ? getSlotLayout({
              tabs: hasTabs,
              search: hasSearch,
              actions: hasActions,
            })
          : ({} as LayoutState),
      [normalizedSlots, hasTabs, hasSearch, hasActions],
    );

    const aligns = alignClassMap[align];

    const handleFocusCapture = React.useCallback(
      (event: React.FocusEvent<HTMLElement>) => {
        setHasFocus(true);
        onFocusCapture?.(event);
      },
      [onFocusCapture],
    );

    const handleBlurCapture = React.useCallback(
      (event: React.FocusEvent<HTMLElement>) => {
        const nextTarget = event.relatedTarget as Node | null;
        if (nextTarget && event.currentTarget.contains(nextTarget)) {
          onBlurCapture?.(event);
          return;
        }
        setHasFocus(false);
        onBlurCapture?.(event);
      },
      [onBlurCapture],
    );

    const roleFromElement =
      as === "header"
        ? "banner"
        : as === "nav"
        ? "navigation"
        : undefined;

    const resolvedChildren = variantStyles ? (
      <div
        className={cn(
          "relative z-[1]",
          variantStyles.contentSpacing,
        )}
      >
        {children}
      </div>
    ) : (
      children
    );

    const slotMarginTopClass =
      slotCount === 1
        ? variantStyles?.slot.single.marginTop ?? variantStyles?.slot.marginTop
        : variantStyles?.slot.marginTop;
    const slotPaddingTopClass =
      slotCount === 1
        ? variantStyles?.slot.single.paddingTop ?? variantStyles?.slot.paddingTop
        : variantStyles?.slot.paddingTop;

    const slotArea = normalizedSlots ? (
      <div
        role="group"
        className={cn(
          "group/hero-slots relative z-[1] isolate w-full grid grid-cols-1",
          slotMarginTopClass,
          slotPaddingTopClass,
          variantStyles?.slot.gapY,
          variantStyles?.slot.gapMd,
          "md:grid-cols-12",
          "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-[hsl(var(--hero-slot-divider,var(--ring)))] before:opacity-60 before:content-['']",
          "after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:h-px after:bg-[hsl(var(--hero-slot-divider,var(--ring)))] after:opacity-40 after:[filter:blur(var(--hero-divider-blur,calc(var(--spacing-1)*1.5)))] after:content-['']",
        )}
        data-align={align}
      >
        {heroSlotOrder.map((key) => {
          const slot = normalizedSlots[key];
          if (!slot) return null;
          const slotLabel =
            typeof slot.label === "string" && slot.label.trim().length > 0
              ? slot.label.trim()
              : undefined;
          const slotLabelledById =
            typeof slot.labelledById === "string" &&
            slot.labelledById.trim().length > 0
              ? slot.labelledById.trim()
              : undefined;
          return (
            <div
              key={key}
              data-slot={key}
              className={cn(
                slot.unstyled ? slotBareBaseClass : slotWellBaseClass,
                layout[key as keyof LayoutState],
                aligns[key],
                slot.className,
              )}
              role="group"
              aria-label={slotLabel}
              aria-labelledby={slotLabelledById}
            >
              <div className={slotContentClass}>{slot.node}</div>
            </div>
          );
        })}
      </div>
    ) : null;

    const haloClasses =
      "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:transition before:duration-300 before:ease-out before:content-[''] motion-reduce:before:transition-none";

    return (
      <>
        {variant !== "unstyled" ? <NeomorphicFrameStyles /> : null}
        <Comp
          ref={ref}
          {...rest}
          className={cn(
            "group/hero-frame relative z-0 isolate flex flex-col overflow-visible hero-focus",
            variantStyles
              ? cn(
                  "border border-border/55 bg-card/70 text-foreground shadow-outline-subtle hero2-frame hero2-neomorph",
                  haloClasses,
                  "has-[:focus-visible]:before:[--hero2-focus-ring:var(--hero2-focus-ring-active)]",
                  "data-[has-focus=true]:before:[--hero2-focus-ring:var(--hero2-focus-ring-active)]",
                  variantStyles.radius,
                  variantStyles.padding,
                )
              : undefined,
            className,
          )}
          data-has-focus={hasFocus ? "true" : undefined}
          data-variant={variant}
          role={roleProp ?? roleFromElement}
          aria-label={label}
          aria-labelledby={labelledById}
          tabIndex={tabIndex ?? -1}
          onFocusCapture={handleFocusCapture}
          onBlurCapture={handleBlurCapture}
        >
          {resolvedChildren}
          {slotArea}
        </Comp>
      </>
    );
  },
);

NeomorphicHeroFrame.displayName = "NeomorphicHeroFrame";

export default NeomorphicHeroFrame;
