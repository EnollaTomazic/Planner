import type { Metadata } from "next";
import { TeamCompPage } from "@/components/team/TeamCompPage";
import {
  Header,
  PRIMARY_PAGE_NAV,
  type HeaderNavItem,
} from "@/components/ui/layout/Header";

const NAV_ITEMS: HeaderNavItem[] = PRIMARY_PAGE_NAV.map((item) => ({
  ...item,
  active: item.key === "team",
}));

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Team",
  description: "Meet the team behind Planner.",
};

export default function Page() {
  return (
    <>
      <Header
        heading="Team"
        subtitle="Meet the team behind Planner."
        navItems={NAV_ITEMS}
        variant="neo"
        underlineTone="brand"
        showThemeToggle
        sticky={false}
      />
      <TeamCompPage />
    </>
  );
}
