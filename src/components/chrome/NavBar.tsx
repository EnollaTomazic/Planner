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
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/reviews", label: "Reviews" },
  { href: "/planner", label: "Planner" },
  { href: "/goals", label: "Goals" },
  { href: "/team", label: "Comps" },
  { href: "/prompts", label: "Prompts" },
] as const;

export type NavItem = (typeof ITEMS)[number];

export default function NavBar() {
  const path = usePathname() ?? "/";
  const reduceMotion = useReducedMotion();

  return (
    <nav aria-label="Primary">
      <ul className="flex items-center gap-2">
        {ITEMS.map(({ href, label }: NavItem) => {
          const active = path === href || path.startsWith(href + "/");

          return (
            <li key={href} className="relative">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex items-center rounded-[var(--radius-2xl)] border px-4 py-2 font-mono text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "bg-[hsl(var(--card)/0.85)]",
                  "supports-[background:color-mix(in_oklab,hsl(var(--card))_85%,transparent)]:bg-[color:color-mix(in_oklab,hsl(var(--card))_85%,transparent)]",
                  active
                    ? "text-foreground border-ring shadow-[0_0_0_1px_hsl(var(--ring)/.35),0_8px_24px_hsl(var(--ring)/.2)]"
                    : "text-muted-foreground border-transparent hover:border-border",
                )}
              >
                <span className="relative z-10">{label}</span>

                {/* hover sheen */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[var(--radius-2xl)] opacity-0 transition hover:opacity-100 nav-hover-sheen"
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
                    className="absolute left-2 right-2 -bottom-1 h-px nav-underline"
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
