"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import Sheet from "@/components/ui/Sheet";
import IconButton from "@/components/ui/primitives/IconButton";
import { cn, withoutBasePath } from "@/lib/utils";
import { NAV_ITEMS, type NavItem, isNavActive } from "@/config/nav";

function useMediaQuery(query: string) {
  const getMatches = React.useCallback(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false;
    }

    try {
      return window.matchMedia(query).matches;
    } catch {
      return false;
    }
  }, [query]);

  const [matches, setMatches] = React.useState(getMatches);

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQueryList = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    setMatches(mediaQueryList.matches);

    if (typeof mediaQueryList.addEventListener === "function") {
      mediaQueryList.addEventListener("change", handleChange);
      return () => {
        mediaQueryList.removeEventListener("change", handleChange);
      };
    }

    mediaQueryList.addListener(handleChange);
    return () => {
      mediaQueryList.removeListener(handleChange);
    };
  }, [getMatches, query]);

  return matches;
}

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
  const rawPathname = usePathname() ?? "/";
  const pathname = withoutBasePath(rawPathname);
  const isDesktop = useMediaQuery("(min-width: 768px)");

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
      className="md:hidden border border-border/40 bg-surface/95 shadow-[var(--shadow-neo-soft)]"
    >
      <div className="flex h-full flex-col pb-[calc(env(safe-area-inset-bottom)+var(--space-4))]">
        <div className="flex items-center justify-between px-[var(--space-4)] pt-[calc(env(safe-area-inset-top)+var(--space-2))] pb-[var(--space-3)]">
          <p className="text-label font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Menu
          </p>
          <IconButton
            aria-label="Close navigation"
            variant="secondary"
            size="md"
            onClick={onClose}
            className="shadow-[var(--shadow-glow-sm)]"
          >
            <X aria-hidden="true" className="size-[calc(var(--control-h-md)/2)]" />
          </IconButton>
        </div>
        <nav
          role="navigation"
          aria-label="Primary mobile navigation"
          id={id}
          className="px-[var(--space-2)]"
        >
          <ul className="flex flex-col gap-[var(--space-1)]">
            {items.map(({ href, label, mobileIcon: Icon }) => {
              const active = isNavActive(pathname, href);

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
