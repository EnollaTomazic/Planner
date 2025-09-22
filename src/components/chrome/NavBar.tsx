// src/components/chrome/NavBar.tsx
"use client";

/**
 * NavBar — Lavender-Glitch tabs with shared underline.
 * - No hover translate (calm UI).
 * - Active when pathname matches or is nested under the href.
 */
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { cn, withoutBasePath } from "@/lib/utils";
import { NAV_ITEMS, NavItem, isNavActive } from "./nav-items";

type NavBarProps = {
  items?: readonly NavItem[];
};

export default function NavBar({ items = NAV_ITEMS }: NavBarProps = {}) {
  const rawPath = usePathname() ?? "/";
  const path = withoutBasePath(rawPath);
  const reduceMotion = useReducedMotion();

  return (
    <nav
      role="navigation"
      aria-label="Primary"
      className="max-w-full overflow-x-auto lg:overflow-x-visible"
    >
      <ul className="flex flex-nowrap items-center gap-x-[var(--space-2)] gap-y-[var(--space-2)]">
        {items.map(({ href, label }) => {
          const active = isNavActive(path, href);

          return (
            <li key={href} className="relative">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative inline-flex min-h-[var(--control-h-lg)] items-center rounded-[var(--radius-2xl)] border px-[var(--space-4)] py-[var(--space-3)] font-mono text-ui transition motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "bg-[hsl(var(--card)/0.85)]",
                  "supports-[background:color-mix(in_oklab,hsl(var(--card))_85%,transparent)]:bg-[color:color-mix(in_oklab,hsl(var(--card))_85%,transparent)]",
                  active
                    ? "text-foreground border-ring shadow-nav-active"
                    : "text-muted-foreground border-transparent hover:border-border",
                )}
              >
                <span className="relative z-10">{label}</span>

                {/* hover sheen */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[var(--radius-2xl)] opacity-0 transition group-hover:opacity-100 nav-hover-sheen"
                />

                {/* faint scanlines */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[var(--radius-2xl)] opacity-20 nav-scanlines"
                />

                {/* animated underline shared across tabs */}
                {active && (
                  <motion.span
                    data-testid="nav-underline"
                    layoutId="nav-underline"
                    className="absolute left-[var(--space-2)] right-[var(--space-2)] -bottom-[var(--space-1)] h-px nav-underline"
                    transition={{
                      type: "tween",
                      duration: reduceMotion ? 0 : 0.25,
                      ease: "easeOut",
                    }}
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
