"use client";

import * as React from "react";
import Link from "next/link";
import { cn, withBasePath } from "@/lib/utils";
import {
  NAV_ITEMS,
  PRIMARY_NAV_LABEL,
  type NavItem,
} from "@/config/nav";
import { Spinner } from "@/components/ui/feedback/Spinner";
import { useNavActivity } from "./useNavActivity";

type BottomNavState =
  | "default"
  | "active"
  | "disabled"
  | "syncing"
  | "hover"
  | "focus-visible";

type BottomNavItem = NavItem & {
  state?: BottomNavState;
  disabled?: boolean;
  busy?: boolean;
};

type BottomNavProps = {
  className?: string;
  items?: readonly BottomNavItem[];
};

export function BottomNav({
  className,
  items = NAV_ITEMS,
}: BottomNavProps = {}) {
  const { isActive } = useNavActivity();
  const navigationLabel = PRIMARY_NAV_LABEL;
  return (
    <div
      className={cn(
        "md:hidden",
        "sticky bottom-0 z-40 sticky-blur",
        "px-[var(--space-4)] pb-[calc(env(safe-area-inset-bottom)+var(--space-2))] pt-[var(--space-2)]",
      )}
    >
      <nav
        role="navigation"
        aria-label={navigationLabel}
        className={cn(
          "relative isolate mx-auto w-full max-w-2xl",
          "rounded-card r-card-lg card-neo-soft shadow-depth-outer-strong",
          "px-[var(--space-4)] pb-[var(--space-2)] pt-[calc(var(--space-3)+var(--hairline-w))]",
          className,
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none nav-underline absolute left-[var(--space-4)] right-[var(--space-4)] top-[calc(var(--space-2)/2)] h-[var(--hairline-w)] rounded-full opacity-80"
        />
        <ul className="flex w-full justify-around">
          {items.map((item) => {
            const { href, label, mobileIcon: Icon } = item;
            if (!Icon) {
              return null;
            }

            const active = isActive(href);
            const disabled = Boolean(item.disabled);
            const busy = Boolean(item.busy);
            const providedState = item.state;
            const derivedState: BottomNavState = providedState
              ? providedState
              : disabled
              ? "disabled"
              : busy
              ? "syncing"
              : active
              ? "active"
              : "default";
            const pressed = derivedState === "active";
            const isDisabledState = derivedState === "disabled";
            const isBusyState = derivedState === "syncing";
            const ariaDisabled = isDisabledState || disabled;
            const ariaBusy = isBusyState || busy;
            const targetHref = withBasePath(href, { skipForNextLink: true });

            return (
              <li key={href}>
                <Link
                  href={targetHref}
                  aria-current={active ? "page" : undefined}
                  role="button"
                  aria-pressed={pressed || undefined}
                  aria-disabled={ariaDisabled || undefined}
                  aria-busy={ariaBusy || undefined}
                  tabIndex={ariaDisabled ? -1 : undefined}
                  onClick={
                    ariaDisabled
                      ? (event) => {
                          event.preventDefault();
                        }
                      : undefined
                  }
                  data-state={derivedState}
                  data-busy={ariaBusy || undefined}
                  className={cn(
                  "group flex min-h-[var(--control-h-lg)] flex-col items-center gap-[var(--space-1)] rounded-card r-card-md px-[var(--space-5)] py-[var(--space-3)] text-label font-medium transition focus-visible:outline-none focus-visible:ring-[var(--ring-size-2)] focus-visible:ring-[var(--theme-ring)] focus-visible:ring-offset-0 motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none",
                  "data-[state=default]:text-[hsl(var(--fg-muted))] data-[state=default]:hover:text-[hsl(var(--accent))]",
                  "data-[state=active]:text-[hsl(var(--accent-contrast))] data-[state=active]:ring-[var(--ring-size-2)] data-[state=active]:ring-[var(--theme-ring)]",
                  "data-[state=hover]:text-[hsl(var(--accent))] motion-safe:data-[state=hover]:-translate-y-0.5 motion-reduce:data-[state=hover]:transform-none",
                  "data-[state=focus-visible]:text-[hsl(var(--accent))] data-[state=focus-visible]:ring-[var(--ring-size-2)] data-[state=focus-visible]:ring-[var(--theme-ring)]",
                  "data-[state=disabled]:text-[hsl(var(--fg-muted))] data-[state=disabled]:pointer-events-none data-[state=disabled]:opacity-disabled",
                  "data-[state=syncing]:text-[hsl(var(--accent-contrast))]",
                  ariaDisabled && "pointer-events-none"
                )}
              >
                <span className="[&_svg]:size-[var(--space-4)] [&_svg]:stroke-[var(--icon-stroke-150)]">
                  <Icon aria-hidden="true" />
                </span>
                <span className="flex items-center gap-[var(--space-1)]">
                  {label}
                  {ariaBusy ? (
                    <Spinner
                      size="xs"
                      className="border-[var(--ring-stroke-m)] border-t-transparent [--spinner-size:calc(var(--ring-diameter-m)/4)]"
                    />
                  ) : null}
                </span>
              </Link>
            </li>
          );
        })}
        </ul>
      </nav>
    </div>
  );
}
