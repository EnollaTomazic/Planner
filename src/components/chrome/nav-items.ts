// src/components/chrome/nav-items.ts
// Navigation items shared across chrome components.

export type NavItem = {
  href: string;
  label: string;
  mobileLabel?: string;
};

export const NAV_ITEMS = [
  { href: "/reviews", label: "Reviews" },
  { href: "/planner", label: "Planner" },
  { href: "/goals", label: "Goals" },
  { href: "/team", label: "Comps", mobileLabel: "Team" },
  { href: "/comps", label: "Components" },
  { href: "/prompts", label: "Prompts" },
] as const satisfies readonly NavItem[];
