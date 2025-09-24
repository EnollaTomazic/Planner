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
      <ul className="flex list-none flex-nowrap items-center gap-[var(--space-2)]">
        {items.map(({ href, label, mobileIcon: Icon }) => {
          const active = isNavActive(path, href);

          return (
            <li key={href} className="relative">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                data-active={active ? "true" : undefined}
                className={cn(
                  "group relative inline-flex min-h-[var(--control-h-lg)] items-center gap-[var(--space-2)] rounded-card r-card-lg px-[var(--space-4)] py-[var(--space-2)] text-ui font-medium font-mono transition motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
                  "card-neo-soft",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {Icon ? (
                  <span
                    aria-hidden="true"
                    className="flex size-[var(--icon-size-md)] items-center justify-center text-muted-foreground transition-colors group-hover:text-foreground group-focus-visible:text-foreground"
                  >
                    <Icon aria-hidden="true" className="size-full" />
                  </span>
                ) : null}
                <span className="relative z-10">{label}</span>

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
