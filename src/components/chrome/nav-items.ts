// src/components/chrome/nav-items.ts
// Navigation items shared across chrome components.

export type NavItem = {
  href: string;
  label: string;
};

export const NAV_ITEMS = [
  { href: "/reviews", label: "Reviews" },
  { href: "/planner", label: "Planner" },
  { href: "/goals", label: "Goals" },
  { href: "/team", label: "Comps" },
  { href: "/prompts", label: "Prompts" },
] as const satisfies readonly NavItem[];
