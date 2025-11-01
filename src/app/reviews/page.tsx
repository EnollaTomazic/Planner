// src/app/reviews/page.tsx
import type { Metadata } from "next";
import { ReviewPage } from "@/components/reviews";
import {
  Header,
  PRIMARY_PAGE_NAV,
  type HeaderNavItem,
} from "@/components/ui/layout/Header";

const NAV_ITEMS: HeaderNavItem[] = PRIMARY_PAGE_NAV.map((item) => ({
  ...item,
  active: item.key === "reviews",
}));

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Reviews",
  description: "Browse community reviews",
};

export default function ReviewsRoute() {
  return (
    <>
      <Header
        heading="Reviews"
        subtitle="Browse community reviews"
        navItems={NAV_ITEMS}
        variant="neo"
        underlineTone="brand"
        showThemeToggle
        sticky={false}
      />
      <ReviewPage />
    </>
  );
}
