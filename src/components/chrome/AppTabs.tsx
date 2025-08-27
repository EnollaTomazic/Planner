/*

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/reviews", label: "Reviews" }, // was "/" → fix to /reviews
  { href: "/plan",    label: "Planner" }, // was "/planner" → match your routes
  { href: "/goals",   label: "Goals" },
  { href: "/team",    label: "Team Comp" },
  { href: "/prompts", label: "Prompts" },
];

export default function AppTabs() {
  const pathname = usePathname() || "/";

  return (
    <div className="sticky top-[56px] z-30 border-b border-[hsl(var(--border))] bg-[color-mix(in_oklab,hsl(var(--card))_85%,transparent)] backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-2 flex flex-wrap items-center gap-2">
        {TABS.map((t) => {
          const active =
            pathname === t.href ||
            (t.href !== "/" && pathname.startsWith(t.href));
          return (
            <Link
              key={t.href}
              href={t.href}
              className={[
                "btn-like-segmented rounded-2xl px-3 py-1.5 text-sm",
                active ? "is-active" : "opacity-80 hover:opacity-100",
              ].join(" ")}
              aria-current={active ? "page" : undefined}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

*/