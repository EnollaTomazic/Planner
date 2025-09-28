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
      className="max-w-full overflow-x-auto pb-[var(--space-1)] lg:overflow-x-visible"
    >
      <ul className="flex list-none flex-nowrap items-center justify-center gap-[var(--space-1)] md:gap-[var(--space-2)]">
        {items.map(({ href, label, mobileIcon: Icon }) => {
          const active = isNavActive(path, href);

          return (
            <li key={href} className="relative">
              <Link
                href={href}
                aria-label={Icon ? label : undefined}
                aria-current={active ? "page" : undefined}
                data-active={active ? "true" : undefined}
                className={cn(
                  "group relative inline-flex h-[var(--control-h-lg)] items-center gap-[var(--space-2)] rounded-full px-[var(--space-4)] text-ui font-medium font-mono tracking-[0.04em] transition motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
                  "before:absolute before:inset-y-[calc(var(--space-1)/2)] before:inset-x-[var(--space-1)] before:-z-10 before:rounded-full before:bg-surface/70 before:opacity-0 before:shadow-[var(--shadow-glow-sm)] before:transition-opacity before:duration-quick before:ease-out",
                  "after:pointer-events-none after:absolute after:inset-x-[var(--space-2)] after:bottom-0 after:h-px after:rounded-full after:bg-[linear-gradient(90deg,hsl(var(--glow)/0.6),hsl(var(--accent-2)),hsl(var(--glow)/0.6))] after:opacity-0 after:transition-opacity after:duration-quick after:ease-out",
                  "hover:text-foreground focus-visible:text-foreground",
                  "hover:before:opacity-100 focus-visible:before:opacity-100",
                  "hover:after:opacity-60 focus-visible:after:opacity-80",
                  "disabled:pointer-events-none disabled:opacity-disabled data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-disabled data-[loading=true]:pointer-events-none data-[loading=true]:opacity-loading",
                  active
                    ? "text-foreground before:opacity-100 after:opacity-90"
                    : "text-muted-foreground",
                )}
              >
                {Icon ? (
                  <span
                    aria-hidden="true"
                    className="flex size-[var(--icon-size-md)] items-center justify-center text-muted-foreground transition-colors group-hover:text-foreground group-focus-visible:text-foreground group-active:text-foreground"
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
                    className="absolute left-[var(--space-2)] right-[var(--space-2)] -bottom-[var(--space-1)] h-px rounded-full nav-underline shadow-[var(--shadow-glow-sm)]"
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
