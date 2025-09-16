// src/components/chrome/PageTabs.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import SegmentedButton from "@/components/ui/primitives/SegmentedButton";

type TabItem = {
  id: string;
  label: React.ReactNode;
  href?: string;
  controls?: string;
};

export interface PageTabsProps {
  tabs: TabItem[];
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
 * - Uses SegmentedButton tokened style.
 * - No hover translate.
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
  const tabRefs = React.useRef<(HTMLElement | null)[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  const hasRestoredFromHash = React.useRef(false);

  // Restore tab from hash on load
  React.useEffect(() => {
    if (hasRestoredFromHash.current) {
      return;
    }
    hasRestoredFromHash.current = true;

    const hash = window.location.hash.replace("#", "");
    if (hash && tabs.some(t => t.id === hash)) {
      onChange?.(hash);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync active tab to URL hash
  React.useEffect(() => {
    if (window.location.hash !== `#${value}`) {
      router.replace(`${pathname}#${value}`, { scroll: false });
    }
  }, [value, router, pathname]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const idx = tabs.findIndex(t => t.id === value);
    if (idx === -1) return;
    let nextIdx = idx;
    if (e.key === "ArrowRight") nextIdx = idx === tabs.length - 1 ? 0 : idx + 1;
    if (e.key === "ArrowLeft") nextIdx = idx === 0 ? tabs.length - 1 : idx - 1;
    if (e.key === "Home") nextIdx = 0;
    if (e.key === "End") nextIdx = tabs.length - 1;
    const next = tabs[nextIdx];
    tabRefs.current[nextIdx]?.focus();
    onChange?.(next.id);
  };

  return (
    <div
      className={[
        "w-full page-tabs-surface",
        sticky ? "sticky z-30 backdrop-blur" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={sticky ? { top: topOffset } : undefined}
    >
      <div className="page-shell">
        <div
          role="tablist"
          aria-label={ariaLabel}
          className="flex gap-2 py-2"
          onKeyDown={handleKeyDown}
        >
            {tabs.map((t, i) => {
              const active = t.id === value;
              const controls = t.controls ?? `${t.id}-panel`;
              const className = [
                "rounded-[var(--control-radius)] px-4 py-2 font-mono text-ui border relative",
                active ? "btn-glitch" : "",
              ]
                .filter(Boolean)
                .join(" ");

              const inner = (
                <>
                  {t.label}
                  {active && (
                    <motion.span
                      layoutId="glitch-tabs-underline"
                      className="absolute left-2 right-2 -bottom-1 h-px underline-gradient"
                      transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
                    />
                  )}
                </>
              );

              const commonProps = {
                role: "tab",
                id: t.id,
                "aria-selected": active,
                "aria-controls": controls,
                tabIndex: active ? 0 : -1,
                ref: (el: HTMLElement | null) => {
                  tabRefs.current[i] = el;
                },
                className,
                isActive: active,
              } as const;

              return t.href ? (
                <SegmentedButton
                  as={Link}
                  key={t.id}
                  href={t.href}
                  onClick={() => onChange?.(t.id)}
                  {...commonProps}
                >
                  {inner}
                </SegmentedButton>
              ) : (
                <SegmentedButton
                  key={t.id}
                  onClick={() => onChange?.(t.id)}
                  {...commonProps}
                >
                  {inner}
                </SegmentedButton>
              );
            })}
        </div>
      </div>
    </div>
  );
}
