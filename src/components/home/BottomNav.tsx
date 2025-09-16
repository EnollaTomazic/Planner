"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Flag, CalendarDays, BookOpen, Users, Sparkles } from "lucide-react";

const LINKS = [
  { href: "/goals", label: "Goals", icon: Flag },
  { href: "/planner", label: "Planner", icon: CalendarDays },
  { href: "/reviews", label: "Reviews", icon: BookOpen },
  { href: "/team", label: "Team", icon: Users },
  { href: "/prompts", label: "Prompts", icon: Sparkles },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="border-t border-border pt-4">
      <ul className="flex justify-around">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                data-active={active}
                className={cn(
                  "group flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--theme-ring] focus-visible:ring-offset-0 motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none",
                  active
                    ? "text-accent ring-2 ring-[--theme-ring]"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon aria-hidden="true" className="size-5" />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
