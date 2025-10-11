"use client";

import * as React from "react";
import Link from "next/link";
import { X } from "lucide-react";
import Sheet from "@/components/ui/Sheet";
import IconButton from "@/components/ui/primitives/IconButton";
import { MEDIA_QUERY_MD } from "@/lib/breakpoints";
import { useMatchMedia } from "@/lib/react";
import { cn } from "@/lib/utils";
import {
  type NavItem,
  NAV_ITEMS,
  PRIMARY_NAV_LABEL,
} from "@/config/nav";
import { useNavActivity } from "./useNavActivity";

export type MobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
  items?: readonly NavItem[];
  id?: string;
};

export default function MobileNavDrawer({
  open,
  onClose,
  items = NAV_ITEMS,
  id,
}: MobileNavDrawerProps) {
  const { isActive } = useNavActivity();
  const isDesktop = useMatchMedia(MEDIA_QUERY_MD);

  React.useEffect(() => {
    if (open && isDesktop) {
      onClose();
    }
  }, [open, isDesktop, onClose]);

  return (
    <Sheet
      open={open && !isDesktop}
      onClose={onClose}
      side="left"
      className="md:hidden border border-border/40 bg-surface/95 shadow-[var(--depth-shadow-soft)]"
    >
      <div className="flex h-full flex-col pb-[calc(env(safe-area-inset-bottom)+var(--space-4))]">
        <div className="flex items-center justify-between px-[var(--space-4)] pt-[calc(env(safe-area-inset-top)+var(--space-2))] pb-[var(--space-3)]">
          <p className="text-label font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Menu
          </p>
          <IconButton
            aria-label="Close navigation"
            variant="neo"
            size="md"
            onClick={onClose}
            className="shadow-[var(--shadow-glow-sm)]"
          >
            <X aria-hidden="true" className="size-[calc(var(--control-h-md)/2)]" />
          </IconButton>
        </div>
        <nav
          role="navigation"
          aria-label={PRIMARY_NAV_LABEL}
          id={id}
          className="px-[var(--space-2)]"
        >
          <ul className="flex flex-col gap-[var(--space-1)]">
            {items.map(({ href, label, mobileIcon: Icon }) => {
              const active = isActive(href);

              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    data-active={active ? "true" : undefined}
                    onClick={onClose}
                    className={cn(
                      "group flex items-center gap-[var(--space-2)] rounded-full px-[var(--space-3)] py-[var(--space-2)] text-ui font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-0",
                      "bg-surface/80 text-[hsl(var(--fg-muted))] shadow-[var(--shadow-glow-sm)] backdrop-blur",
                      "hover:text-[hsl(var(--accent))] focus-visible:text-[hsl(var(--accent))]",
                      active &&
                        "text-[hsl(var(--accent-contrast))] shadow-[var(--shadow-glow-md)] ring-1 ring-[hsl(var(--accent)/0.4)]",
                    )}
                  >
                    {Icon ? (
                      <span
                        aria-hidden="true"
                        className="flex size-[var(--space-4)] items-center justify-center text-[hsl(var(--fg-muted))] transition-colors group-hover:text-[hsl(var(--accent))] group-focus-visible:text-[hsl(var(--accent))] group-data-[active=true]:text-[hsl(var(--accent-contrast))]"
                      >
                        <Icon className="size-full" strokeWidth={1.75} />
                      </span>
                    ) : null}
                    <span className="flex-1 text-left">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </Sheet>
  );
}
