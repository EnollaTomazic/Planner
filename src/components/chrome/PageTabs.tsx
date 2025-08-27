// src/components/chrome/PageTabs.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

type TabItem = { id: string; label: React.ReactNode; href?: string };

export interface PageTabsProps {
  tabs: TabItem[];
  value: string;
  onChange?: (id: string) => void;
  className?: string;
  sticky?: boolean;
  topOffset?: number; // px from top when sticky
}

/**
 * PageTabs — secondary tab row for a page section.
 * - Uses .btn-like-segmented tokened style.
 * - No hover translate.
 */
export default function PageTabs({
  tabs,
  value,
  onChange,
  className = "",
  sticky = true,
  topOffset = 56,
}: PageTabsProps) {
  return (
    <div
      className={[
        "w-full",
        sticky ? "sticky z-30 backdrop-blur" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        sticky
          ? {
              top: topOffset,
              background:
                "color-mix(in oklab, hsl(var(--background)) 60%, transparent)",
              borderBottom: "1px solid hsl(var(--border))",
            }
          : undefined
      }
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex gap-2 py-2">
          {tabs.map((t) => {
            const active = t.id === value;
            const classNames = [
              "btn-like-segmented rounded-xl px-4 py-2 font-mono text-sm border relative",
              active ? "is-active" : "",
            ]
              .filter(Boolean)
              .join(" ");

            const inner = (
              <>
                {t.label}
                {active && (
                  <motion.span
                    layoutId="glitch-tabs-underline"
                    className="absolute left-2 right-2 -bottom-1 h-px"
                    style={{
                      background:
                        "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))",
                    }}
                  />
                )}
              </>
            );

            return t.href ? (
              <Link key={t.id} href={t.href} className={classNames}>
                {inner}
              </Link>
            ) : (
              <button
                key={t.id}
                type="button"
                onClick={() => onChange?.(t.id)}
                className={classNames}
              >
                {inner}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
