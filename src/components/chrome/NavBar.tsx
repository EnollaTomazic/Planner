// src/components/chrome/NavBar.tsx
"use client";

/**
 * NavBar — Lavender-Glitch tabs with shared underline.
 * - No hover translate (calm UI).
 * - Active when pathname matches or is nested under the href.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/reviews", label: "Reviews" },
  { href: "/planner", label: "Planner" },
  { href: "/goals", label: "Goals" },
  { href: "/team", label: "Comps" },
  { href: "/prompts", label: "Prompts" },
];

export default function NavBar() {
  const path = usePathname() ?? "/";

  return (
    <nav aria-label="Primary">
      <ul className="flex items-center gap-2">
        {ITEMS.map((it) => {
          const active =
            path === it.href || path.startsWith(it.href + "/");

          return (
            <li key={it.href} className="relative">
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex items-center rounded-xl border px-4 py-2 font-mono text-sm transition",
                  "bg-[color:color-mix(in_oklab,hsl(var(--card))_85%,transparent)]",
                  active
                    ? "text-foreground border-[hsl(var(--ring))] shadow-[0_0_0_1px_hsl(var(--ring)/.35),0_8px_24px_hsl(var(--ring)/.2)]"
                    : "text-muted-foreground border-transparent hover:border-[hsl(var(--border))]"
                )}
              >
                <span className="relative z-10">{it.label}</span>

                {/* hover sheen */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition hover:opacity-100"
                  style={{
                    background:
                      "linear-gradient(90deg,hsl(var(--primary)/.15),transparent 40%,transparent 60%,hsl(var(--accent)/.15))",
                  }}
                />

                {/* faint scanlines */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-xl opacity-20"
                  style={{
                    background:
                      "repeating-linear-gradient(0deg,rgba(255,255,255,.04) 0 1px,transparent 1px 3px)",
                  }}
                />

                {/* animated underline shared across tabs */}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute left-2 right-2 -bottom-1 h-px"
                    style={{
                      background:
                        "linear-gradient(90deg,hsl(var(--primary)),hsl(var(--accent)),hsl(var(--primary)))",
                    }}
                    transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
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
