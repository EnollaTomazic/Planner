// src/config/nav.ts
// Shared navigation configuration for chrome components and documentation.

import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CalendarDays,
  Flag,
  PanelsTopLeft,
  Sparkles,
  Users,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  mobileIcon?: LucideIcon;
};

export const NAV_ITEMS = [
  { href: "/reviews", label: "Reviews", mobileIcon: BookOpen },
  { href: "/planner", label: "Planner", mobileIcon: CalendarDays },
  { href: "/goals", label: "Goals", mobileIcon: Flag },
  { href: "/team", label: "Team", mobileIcon: Users },
  { href: "/components", label: "Components", mobileIcon: PanelsTopLeft },
  { href: "/prompts", label: "Prompts", mobileIcon: Sparkles },
] as const satisfies readonly NavItem[];

const normalizePath = (value: string) => {
  if (value === "/") {
    return value;
  }

  return value.replace(/\/+$/, "");
};

export const isNavActive = (path: string, href: string) => {
  const normalizedPath = normalizePath(path);
  const normalizedHref = normalizePath(href);

  if (normalizedHref === "/") {
    return normalizedPath === "/";
  }

  return (
    normalizedPath === normalizedHref ||
    normalizedPath.startsWith(`${normalizedHref}/`)
  );
};
