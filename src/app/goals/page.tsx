import { type Metadata } from "next";
import { GoalsPage } from "@/components/goals";
import {
  Header,
  PRIMARY_PAGE_NAV,
  type HeaderNavItem,
} from "@/components/ui/layout/Header";

const NAV_ITEMS: HeaderNavItem[] = PRIMARY_PAGE_NAV.map((item) => ({
  ...item,
  active: item.key === "goals",
}));

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Goals",
  description: "Track and manage your goals.",
};

export default function Page() {
  return (
    <>
      <Header
        heading="Goals"
        subtitle="Track and manage your goals."
        navItems={NAV_ITEMS}
        variant="neo"
        underlineTone="brand"
        showThemeToggle
        sticky={false}
      />
      <GoalsPage />
    </>
  );
}

