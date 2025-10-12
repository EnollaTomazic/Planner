// src/components/ui/layout/hero/HeroTabs.tsx
"use client";

import * as React from "react";
import {
  type TabBarA11yProps,
  type TabBarProps,
  type TabItem, TabBar } from "../TabBar";

export type HeroTab<K extends string> = TabItem<K> & {
  hint?: string;
};

export type HeroTabsProps<K extends string> = TabBarA11yProps & {
  tabs: Array<HeroTab<K>>;
  activeKey: K;
  onChange: (key: K) => void;
  className?: string;
  align?: TabBarProps["align"];
  size?: TabBarProps["size"];
  right?: React.ReactNode;
  showBaseline?: boolean;
  variant?: TabBarProps["variant"];
  linkPanels?: boolean;
  /**
   * Base string applied to tab and panel ids when linking panels.
   * Mirrors the TabBar `idBase` prop for deterministic aria wiring.
   */
  idBase?: string;
};

export function HeroTabs<K extends string>(props: HeroTabsProps<K>) {
  const {
    tabs,
    activeKey,
    onChange,
    ariaLabel,
    ariaLabelledBy,
    className,
    align = "end",
    size = "md",
    right,
    showBaseline = false,
    variant,
    linkPanels = false,
    idBase,
  } = props;

  const sanitizedAriaLabel =
    typeof ariaLabel === "string" && ariaLabel.trim().length > 0
      ? ariaLabel.trim()
      : undefined;
  const sanitizedAriaLabelledBy =
    typeof ariaLabelledBy === "string" && ariaLabelledBy.trim().length > 0
      ? ariaLabelledBy.trim()
      : undefined;

  const accessibilityProps: TabBarA11yProps = sanitizedAriaLabelledBy
    ? {
        ariaLabelledBy: sanitizedAriaLabelledBy,
        ...(sanitizedAriaLabel ? { ariaLabel: sanitizedAriaLabel } : {}),
      }
    : {
        ariaLabel: sanitizedAriaLabel ?? "Hero tabs",
      };

  const items: TabItem[] = React.useMemo(
    () =>
      tabs.map((tab) => {
        const { hint, ...item } = tab;
        void hint;
        return {
          ...item,
          key: String(tab.key),
        };
      }),
    [tabs],
  );

  return (
    <TabBar
      items={items}
      value={String(activeKey)}
      onValueChange={(key) => onChange(key as K)}
      align={align}
      size={size}
      right={right}
      {...accessibilityProps}
      className={className}
      showBaseline={showBaseline}
      variant={variant}
      linkPanels={linkPanels}
      idBase={idBase}
    />
  );
}

