// src/app/planner/page.tsx
// Server wrapper for the client PlannerPage

import type { Metadata } from "next";
import { PlannerPage } from "@/components/planner";
import {
  Header,
  PRIMARY_PAGE_NAV,
  type HeaderNavItem,
} from "@/components/ui/layout/Header";

const NAV_ITEMS: HeaderNavItem[] = PRIMARY_PAGE_NAV.map((item) => ({
  ...item,
  active: item.key === "planner",
}));

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Planner",
  description: "Organize your tasks and goals using the Planner.",
};

export default function Page() {
  return (
    <>
      <Header
        heading="Planner"
        subtitle="Organize your tasks and goals using the Planner."
        navItems={NAV_ITEMS}
        variant="neo"
        underlineTone="brand"
        showThemeToggle
        sticky={false}
      />
      <PlannerPage />
    </>
  );
}
