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

import {
  type TabItem as TabBarItem,
  type TabRenderContext, TabBar } from "@/components/ui/layout/TabBar";
import { cn } from "@/lib/utils";
import segmentedButtonStyles from "@/components/ui/primitives/SegmentedButton.module.css";

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
  value?: string;
  defaultValue?: string;
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
export function PageTabs({
  tabs,
  value,
  defaultValue,
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

  const fallbackTabId = React.useMemo(
    () => tabs[0]?.id ?? "",
    [tabs],
  );
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<string>(() => {
    if (value !== undefined) return value;
    if (defaultValue !== undefined) return defaultValue;
    return fallbackTabId;
  });
  const activeValue = isControlled ? value : internalValue;

  React.useEffect(() => {
    if (isControlled) {
      return;
    }
    const preferred = defaultValue ?? fallbackTabId;
    setInternalValue((current) => {
      if (current && tabs.some((tab) => tab.id === current)) {
        return current;
      }
      return preferred;
    });
  }, [defaultValue, fallbackTabId, isControlled, tabs]);

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
      if (isControlled) {
        onChange?.(hash);
        return;
      }
      setInternalValue(hash);
    }
  }, [isControlled, onChange, tabs]);

  // Sync active tab to URL hash
  React.useEffect(() => {
    if (!activeValue) {
      return;
    }
    if (window.location.hash !== `#${activeValue}`) {
      router.replace(`${pathname}${search}#${activeValue}`, {
        scroll: false,
      });
    }
  }, [activeValue, router, pathname, search]);

  const handleValueChange = React.useCallback(
    (next: string) => {
      if (!isControlled) {
        setInternalValue(next);
      }
      onChange?.(next);
    },
    [isControlled, onChange],
  );

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
        segmentedButtonStyles.root,
        "min-h-[var(--control-h-lg)] font-mono text-ui px-[var(--space-4)] py-[var(--space-3)]",
        baseClassName,
        active && segmentedButtonStyles.glitch,
        active && "glitch-wrapper group/glitch is-active",
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
            data-selected={active ? "true" : undefined}
            data-glitch={active ? "true" : undefined}
            data-depth="raised"
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
          data-selected={active ? "true" : undefined}
          data-glitch={active ? "true" : undefined}
          data-depth="raised"
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
          value={activeValue}
          onValueChange={handleValueChange}
          ariaLabel={ariaLabel}
          variant="glitch"
          renderItem={renderTab}
          tablistClassName="data-[variant=glitch]:gap-[var(--space-2)] data-[variant=glitch]:py-[var(--space-3)]"
        />
      </div>
    </div>
  );
}
