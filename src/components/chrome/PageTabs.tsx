// src/components/chrome/PageTabs.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import TabBar, {
  type TabItem as TabBarItem,
  type TabRenderContext,
} from "@/components/ui/layout/TabBar";
import { cn } from "@/lib/utils";

import { useStickyOffsetClass } from "./useStickyOffsetClass";

type PageTabDefinition = {
  id: string;
  label: React.ReactNode;
  href?: string;
  controls?: string;
};

type PageTabBarItem = TabBarItem<string> & { href?: string };

export interface PageTabsProps {
  tabs: PageTabDefinition[];
  value: string;
  onChange?: (id: string) => void;
  className?: string;
  sticky?: boolean;
  /** CSS top offset when sticky (supports tokens) */
  topOffset?: string;
  ariaLabel: string;
}

/**
 * PageTabs — secondary tab row for a page section.
 * - Delegates focus and keyboard handling to TabBar.
 * - Renders glitch underline with motion span.
 */
export default function PageTabs({
  tabs,
  value,
  onChange,
  className = "",
  sticky = true,
  topOffset = "var(--header-stack)",
  ariaLabel,
}: PageTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { style: stickyStyle } = useStickyOffsetClass(
    sticky ? topOffset : undefined,
  );

  const search = React.useMemo(() => {
    const serialized = searchParams.toString();
    return serialized ? `?${serialized}` : "";
  }, [searchParams]);

  const hasRestoredFromHash = React.useRef(false);

  const tabItems = React.useMemo<PageTabBarItem[]>(
    () =>
      tabs.map((tab) => ({
        key: tab.id,
        label: tab.label,
        controls: tab.controls,
        id: tab.id,
        href: tab.href,
      })),
    [tabs],
  );

  // Restore tab from hash on load
  React.useEffect(() => {
    if (hasRestoredFromHash.current) {
      return;
    }
    hasRestoredFromHash.current = true;

    const hash = window.location.hash.replace("#", "");
    if (hash && tabs.some((tab) => tab.id === hash)) {
      onChange?.(hash);
    }
  }, [tabs, onChange]);

  // Sync active tab to URL hash
  React.useEffect(() => {
    if (window.location.hash !== `#${value}`) {
      router.replace(`${pathname}${search}#${value}`, { scroll: false });
    }
  }, [value, router, pathname, search]);

  const renderTab = React.useCallback(
    ({
      item,
      active,
      props,
      ref,
      disabled,
    }: TabRenderContext<string, PageTabBarItem>) => {
      const { className: baseClassName, onClick, ...restProps } = props;
      const mergedClassName = cn(
        "btn-like-segmented min-h-[var(--control-h-lg)] font-mono text-ui px-[var(--space-4)] py-[var(--space-3)]",
        baseClassName,
        active && "btn-glitch is-active",
        disabled && "pointer-events-none opacity-disabled",
      );

      const handleClick: React.MouseEventHandler<HTMLElement> = (event) => {
        onClick?.(event);
      };

      const content = (
        <>
          <span className="relative z-10 truncate">{item.label}</span>
          {active && (
            <motion.span
              layoutId="glitch-tabs-underline"
              className="pointer-events-none absolute inset-x-[var(--space-2)] bottom-[calc(var(--space-1)*-1)] h-[var(--hairline-w)] underline-gradient"
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
            />
          )}
        </>
      );

      if (item.href) {
        return (
          <Link
            {...restProps}
            ref={ref as React.Ref<HTMLAnchorElement>}
            href={item.href}
            scroll={false}
            className={mergedClassName}
            onClick={(event) => {
              if (disabled) {
                event.preventDefault();
                event.stopPropagation();
                return;
              }
              handleClick(event);
            }}
          >
            {content}
          </Link>
        );
      }

      return (
        <button
          type="button"
          {...restProps}
          ref={ref as React.Ref<HTMLButtonElement>}
          disabled={disabled}
          className={mergedClassName}
          onClick={(event) => {
            if (disabled) {
              event.preventDefault();
              event.stopPropagation();
              return;
            }
            handleClick(event);
          }}
        >
          {content}
        </button>
      );
    },
    [],
  );

  return (
    <div
      className={cn(
        "w-full page-tabs-surface",
        sticky && "sticky z-30 backdrop-blur",
        className,
      )}
      data-sticky={sticky ? "true" : undefined}
      style={sticky ? stickyStyle : undefined}
    >
      <div className="page-shell">
        <TabBar<string, { href?: string }>
          items={tabItems}
          value={value}
          onValueChange={(next) => onChange?.(next)}
          ariaLabel={ariaLabel}
          variant="glitch"
          renderItem={renderTab}
          tablistClassName="data-[variant=glitch]:gap-[var(--space-2)] data-[variant=glitch]:py-[var(--space-3)]"
        />
      </div>
    </div>
  );
}
