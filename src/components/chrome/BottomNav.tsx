"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, withoutBasePath } from "@/lib/utils";
import { NAV_ITEMS, type NavItem, isNavActive } from "./nav-items";

type BottomNavProps = {
  className?: string;
  items?: readonly NavItem[];
};

export default function BottomNav({
  className,
  items = NAV_ITEMS,
}: BottomNavProps = {}) {
  const rawPathname = usePathname() ?? "/";
  const pathname = withoutBasePath(rawPathname);

  return (
    <nav
      role="navigation"
      aria-label="Primary"
      className={cn(
        "border-t border-border pt-[var(--space-4)] md:hidden",
        className,
      )}
    >
      <ul className="flex justify-around">
        {items.map(({ href, label, mobileIcon: Icon }) => {
          if (!Icon) {
            return null;
          }

          const active = isNavActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                data-active={active}
                className={cn(
                  "group flex min-h-[var(--control-h-lg)] flex-col items-center gap-[var(--space-1)] rounded-card r-card-md px-[var(--space-5)] py-[var(--space-3)] text-label font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-0 motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none",
                  active
                    ? "text-accent-3 ring-2 ring-[var(--focus)]"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="[&_svg]:size-[var(--space-4)]">
                  <Icon aria-hidden="true" />
                </span>
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
