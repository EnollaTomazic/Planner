import type { Metadata } from "next";
import { PromptsPage } from "@/components/prompts/PromptsPage";
import {
  Header,
  PRIMARY_PAGE_NAV,
  type HeaderNavItem,
} from "@/components/ui/layout/Header";

const NAV_ITEMS: HeaderNavItem[] = PRIMARY_PAGE_NAV.map((item) => ({
  ...item,
  active: item.key === "prompts",
}));

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Saved Prompts Library",
  description:
    "Browse saved Planner prompts, capture new ideas, and explore demos for composing, saving, and reusing prompts. Layout primitives documented on this route: Grid, Stack, Cluster, Sidebar, and Switcher.",
};

export default function PromptsRoute() {
  return (
    <>
      <Header
        heading="Saved Prompts Library"
        subtitle="Browse saved Planner prompts, capture new ideas, and explore demos for composing, saving, and reusing prompts."
        navItems={NAV_ITEMS}
        variant="neo"
        underlineTone="brand"
        showThemeToggle
        sticky={false}
      />
      <PromptsPage />
    </>
  );
}
