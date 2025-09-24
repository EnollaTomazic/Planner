// src/components/ui/layout/PageShell.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type PageShellElement =
  | "div"
  | "main"
  | "section"
  | "article"
  | "aside"
  | "header"
  | "footer"
  | "nav";

const BREAKPOINTS = ["base", "md", "lg"] as const;

type Breakpoint = (typeof BREAKPOINTS)[number];

type PageShellSpacingScale =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl";

type PageShellPaddingValue =
  | PageShellSpacingScale
  | {
      top?: PageShellSpacingScale;
      bottom?: PageShellSpacingScale;
    };

type PageShellPaddingConfig =
  | PageShellPaddingValue
  | Partial<Record<Breakpoint, PageShellPaddingValue>>;

type PageShellGapConfig =
  | PageShellSpacingScale
  | Partial<Record<Breakpoint, PageShellSpacingScale>>;

type PageShellSafeAreaInput =
  | "none"
  | "top"
  | "bottom"
  | "both"
  | boolean
  | {
      top?: boolean;
      bottom?: boolean;
    };

type PageShellSlot = "header" | "main" | "footer" | "section" | "banner" | "toolbar";

type ResolvedPadding = Partial<Record<Breakpoint, { top?: PageShellSpacingScale; bottom?: PageShellSpacingScale }>>;
type ResolvedGap = Partial<Record<Breakpoint, PageShellSpacingScale>>;
type ResolvedSafeArea = { top: boolean; bottom: boolean };

const BREAKPOINT_SUFFIX: Record<Breakpoint, string> = {
  base: "",
  md: "-md",
  lg: "-lg",
};

const SLOT_DEFAULTS: Partial<
  Record<
    PageShellSlot,
    {
      padding?: PageShellPaddingConfig;
      gapBefore?: PageShellGapConfig;
      safeArea?: PageShellSafeAreaInput;
    }
  >
> = {
  header: {
    padding: "xl",
    safeArea: "top",
  },
  main: {
    padding: "xl",
    safeArea: "bottom",
  },
  footer: {
    padding: "lg",
    safeArea: "bottom",
  },
  section: {
    padding: "lg",
  },
  banner: {
    padding: "sm",
    safeArea: "top",
  },
  toolbar: {
    padding: {
      base: { top: "sm", bottom: "none" },
      md: { top: "sm", bottom: "sm" },
    },
    safeArea: "top",
  },
};

const hasBreakpointKey = (value: object): boolean =>
  BREAKPOINTS.some((breakpoint) =>
    Object.prototype.hasOwnProperty.call(value, breakpoint),
  );

const normalizePaddingValue = (
  value: PageShellPaddingValue,
): { top?: PageShellSpacingScale; bottom?: PageShellSpacingScale } | undefined => {
  if (typeof value === "string") {
    return { top: value, bottom: value };
  }
  if (!value) return undefined;
  const result: { top?: PageShellSpacingScale; bottom?: PageShellSpacingScale } = {};
  if (value.top) {
    result.top = value.top;
  }
  if (value.bottom) {
    result.bottom = value.bottom;
  }
  return Object.keys(result).length > 0 ? result : undefined;
};

const normalizePaddingConfig = (value?: PageShellPaddingConfig): ResolvedPadding => {
  if (!value) return {};
  if (typeof value === "string") {
    return { base: { top: value, bottom: value } } satisfies ResolvedPadding;
  }
  if (typeof value === "object" && value !== null && !hasBreakpointKey(value)) {
    const normalized = normalizePaddingValue(value as PageShellPaddingValue);
    return normalized ? { base: normalized } : {};
  }
  const result: ResolvedPadding = {};
  for (const breakpoint of BREAKPOINTS) {
    const entry = (value as Partial<Record<Breakpoint, PageShellPaddingValue>>)[breakpoint];
    if (!entry) continue;
    const normalized = normalizePaddingValue(entry);
    if (normalized) {
      result[breakpoint] = normalized;
    }
  }
  return result;
};

const mergePadding = (base: ResolvedPadding, override: ResolvedPadding): ResolvedPadding => {
  const result: ResolvedPadding = { ...base };
  for (const breakpoint of BREAKPOINTS) {
    const baseEntry = result[breakpoint];
    const overrideEntry = override[breakpoint];
    if (!overrideEntry) continue;
    result[breakpoint] = {
      ...(baseEntry ?? {}),
      ...(overrideEntry.top !== undefined ? { top: overrideEntry.top } : {}),
      ...(overrideEntry.bottom !== undefined ? { bottom: overrideEntry.bottom } : {}),
    };
  }
  return result;
};

const normalizeGapConfig = (value?: PageShellGapConfig): ResolvedGap => {
  if (!value) return {};
  if (typeof value === "string") {
    return { base: value } satisfies ResolvedGap;
  }
  const result: ResolvedGap = {};
  for (const breakpoint of BREAKPOINTS) {
    const entry = value[breakpoint];
    if (entry) {
      result[breakpoint] = entry;
    }
  }
  return result;
};

const mergeGap = (base: ResolvedGap, override: ResolvedGap): ResolvedGap => {
  const result: ResolvedGap = { ...base };
  for (const breakpoint of BREAKPOINTS) {
    if (override[breakpoint] !== undefined) {
      result[breakpoint] = override[breakpoint];
    }
  }
  return result;
};

const normalizeSafeArea = (
  value?: PageShellSafeAreaInput,
): Partial<Record<"top" | "bottom", boolean>> => {
  if (value === undefined) {
    return {};
  }
  if (typeof value === "boolean") {
    return value ? { top: true, bottom: true } : { top: false, bottom: false };
  }
  if (typeof value === "string") {
    switch (value) {
      case "none":
        return { top: false, bottom: false };
      case "top":
        return { top: true };
      case "bottom":
        return { bottom: true };
      case "both":
        return { top: true, bottom: true };
      default:
        return {};
    }
  }
  const result: Partial<Record<"top" | "bottom", boolean>> = {};
  if (value.top !== undefined) {
    result.top = Boolean(value.top);
  }
  if (value.bottom !== undefined) {
    result.bottom = Boolean(value.bottom);
  }
  return result;
};

const resolveSafeArea = (
  slotInput?: PageShellSafeAreaInput,
  overrideInput?: PageShellSafeAreaInput,
): ResolvedSafeArea => {
  const slot = normalizeSafeArea(slotInput);
  const override = normalizeSafeArea(overrideInput);
  return {
    top: override.top ?? slot.top ?? false,
    bottom: override.bottom ?? slot.bottom ?? false,
  } satisfies ResolvedSafeArea;
};

type PageShellOwnProps<T extends PageShellElement = "div"> = {
  /** Semantic element for the shell container. Defaults to a <div>. */
  as?: T;
  className?: string;
  /**
   * Enables the standardized 12-column grid within the page shell.
   * When set, children should define their own col-span wrappers.
   */
  grid?: boolean;
  /** Additional classes for the inner grid container when `grid` is enabled. */
  contentClassName?: string;
  /** Identifies the shell's position in the layout to apply default rhythm rules. */
  slot?: PageShellSlot;
  /** Custom padding configuration using the spacing scale. */
  padding?: PageShellPaddingConfig;
  /** Adds margin before the shell to manage vertical rhythm between sections. */
  gapBefore?: PageShellGapConfig;
  /** Overrides safe-area padding on the top and/or bottom edges. */
  safeArea?: PageShellSafeAreaInput;
};

export type PageShellProps<T extends PageShellElement = "div"> =
  PageShellOwnProps<T> &
    Omit<React.ComponentPropsWithoutRef<T>, keyof PageShellOwnProps<T>>;

/**
 * PageShell — width-constrained wrapper that applies the global `page-shell` class.
 * Use the `grid` prop to opt into the standard 12-column layout inside the shell.
 */
export default function PageShell<T extends PageShellElement = "div">({
  as,
  className,
  grid = false,
  contentClassName,
  slot,
  padding,
  gapBefore,
  safeArea,
  children,
  ...rest
}: PageShellProps<T>) {
  const Component = (as ?? "div") as PageShellElement;
  const mainAccessibilityProps: Partial<React.ComponentPropsWithoutRef<"main">> =
    Component === "main"
      ? { id: "main-content", tabIndex: -1 }
      : {};

  const slotDefaults = slot ? SLOT_DEFAULTS[slot] : undefined;

  const resolvedPadding = React.useMemo(() => {
    const basePadding = normalizePaddingConfig(slotDefaults?.padding);
    const overridePadding = normalizePaddingConfig(padding);
    return mergePadding(basePadding, overridePadding);
  }, [slotDefaults?.padding, padding]);

  const resolvedGap = React.useMemo(() => {
    const baseGap = normalizeGapConfig(slotDefaults?.gapBefore);
    const overrideGap = normalizeGapConfig(gapBefore);
    return mergeGap(baseGap, overrideGap);
  }, [slotDefaults?.gapBefore, gapBefore]);

  const resolvedSafeArea = React.useMemo(
    () => resolveSafeArea(slotDefaults?.safeArea, safeArea),
    [slotDefaults?.safeArea, safeArea],
  );

  const dataAttributes: Record<string, string | undefined> = {};

  if (slot) {
    dataAttributes["data-slot"] = slot;
  }

  for (const breakpoint of BREAKPOINTS) {
    const suffix = BREAKPOINT_SUFFIX[breakpoint];
    const paddingEntry = resolvedPadding[breakpoint];
    if (paddingEntry) {
      if (paddingEntry.top) {
        dataAttributes[`data-padding-top${suffix}`] = paddingEntry.top;
      }
      if (paddingEntry.bottom) {
        dataAttributes[`data-padding-bottom${suffix}`] = paddingEntry.bottom;
      }
    }
    const gapEntry = resolvedGap[breakpoint];
    if (gapEntry) {
      dataAttributes[`data-gap-before${suffix}`] = gapEntry;
    }
  }

  if (resolvedSafeArea.top) {
    dataAttributes["data-safe-area-top"] = "true";
  }
  if (resolvedSafeArea.bottom) {
    dataAttributes["data-safe-area-bottom"] = "true";
  }

  return (
    <Component
      className={cn("page-shell", className)}
      {...mainAccessibilityProps}
      {...rest}
      {...dataAttributes}
    >
      {grid ? (
        <div
          className={cn(
            "grid gap-[var(--space-4)] md:grid-cols-12 lg:gap-[var(--space-5)]",
            contentClassName
          )}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </Component>
  );
}
