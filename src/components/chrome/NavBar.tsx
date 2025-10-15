// src/components/chrome/NavBar.tsx
"use client";

/**
 * NavBar — Lavender-Glitch tabs with shared underline.
 * - No hover translate (calm UI).
 * - Active when pathname matches or is nested under the href.
 */
import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { cn, withBasePath, withoutBasePath } from "@/lib/utils";
import { NAV_ITEMS, PRIMARY_NAV_LABEL, NavItem } from "@/config/nav";
import { useNavActivity } from "./useNavActivity";

type NavBarProps = {
  items?: readonly NavItem[];
};

const ABSOLUTE_URL_PATTERN = /^[a-zA-Z][a-zA-Z\d+.-]*:/;

export function NavBar({ items = NAV_ITEMS }: NavBarProps = {}) {
  const { isActive } = useNavActivity();
  const reduceMotion = useReducedMotion();
  return (
    <nav
      role="navigation"
      aria-label={PRIMARY_NAV_LABEL}
      className="max-w-full overflow-x-auto pb-[var(--space-1)] lg:overflow-x-visible"
    >
      <ul className="flex list-none flex-nowrap items-center justify-center gap-[var(--space-1)] md:gap-[var(--space-2)]">
        {items.map(({ href, label, mobileIcon: Icon }) => {
          const trimmedHref = href.trim();
          const isHashLink = trimmedHref.startsWith("#");
          const isQueryLink = trimmedHref.startsWith("?");
          const isAbsoluteLink =
            ABSOLUTE_URL_PATTERN.test(trimmedHref) ||
            trimmedHref.startsWith("//");

          const normalizedHref = (() => {
            if (!trimmedHref) {
              return "/";
            }

            if (isAbsoluteLink) {
              return trimmedHref;
            }

            if (isHashLink) {
              return trimmedHref;
            }

            if (isQueryLink) {
              return `/${trimmedHref}`;
            }

            return trimmedHref.startsWith("/")
              ? trimmedHref
              : `/${trimmedHref}`;
          })();

          const comparableHref = (() => {
            if (isHashLink || isQueryLink || isAbsoluteLink) {
              return normalizedHref;
            }

            const baseStripped = withoutBasePath(normalizedHref);

            if (baseStripped === "/" && normalizedHref !== "/") {
              return normalizedHref;
            }

            return baseStripped;
          })();

          const active =
            isHashLink || isQueryLink || isAbsoluteLink
              ? false
              : isActive(comparableHref);

          const targetHref = isAbsoluteLink
            ? normalizedHref
            : withBasePath(normalizedHref);

          return (
            <li key={href} className="relative">
              <Link
                href={targetHref}
                aria-label={Icon ? label : undefined}
                aria-current={active ? "page" : undefined}
                data-active={active ? "true" : undefined}
                className={cn(
                  "group relative inline-flex h-[var(--control-h-lg)] items-center gap-[var(--space-2)] rounded-full px-[var(--space-4)] text-ui font-medium font-mono tracking-[0.04em] transition motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
                  "before:absolute before:inset-y-[calc(var(--space-1)/2)] before:inset-x-[var(--space-1)] before:-z-10 before:rounded-full before:bg-surface/70 before:opacity-0 before:shadow-[var(--shadow-glow-sm)] before:transition-opacity before:duration-motion-sm before:ease-out",
                  "after:pointer-events-none after:absolute after:inset-x-[var(--space-2)] after:bottom-0 after:h-px after:rounded-full after:bg-[linear-gradient(90deg,hsl(var(--glow)/0.6),hsl(var(--accent-2)),hsl(var(--glow)/0.6))] after:opacity-0 after:transition-opacity after:duration-motion-sm after:ease-out",
                  "hover:text-[hsl(var(--accent))] focus-visible:text-[hsl(var(--accent))]",
                  "hover:before:opacity-100 focus-visible:before:opacity-100",
                  "hover:after:opacity-60 focus-visible:after:opacity-80",
                  "disabled:pointer-events-none disabled:opacity-disabled data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-disabled data-[loading=true]:pointer-events-none data-[loading=true]:opacity-loading",
                  active
                    ? "text-[hsl(var(--accent-contrast))] before:opacity-100 after:opacity-90"
                    : "text-[hsl(var(--fg-muted))]",
                )}
              >
                {Icon ? (
                  <span
                    aria-hidden="true"
                    className="flex size-[var(--icon-size-md)] items-center justify-center text-[hsl(var(--fg-muted))] transition-colors group-hover:text-[hsl(var(--accent))] group-focus-visible:text-[hsl(var(--accent))] group-active:text-[hsl(var(--accent-contrast))] group-data-[active=true]:text-[hsl(var(--accent-contrast))]"
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
