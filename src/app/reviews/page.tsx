// src/app/reviews/page.tsx
import type { Metadata } from "next";
import { ReviewPage } from "@/components/reviews";
import { Header } from "@/components/ui/layout/Header";
import { PRIMARY_PAGE_NAV, type HeaderNavItem } from "@/components/ui/layout/primary-nav";

const navItems: HeaderNavItem[] = PRIMARY_PAGE_NAV.map((item) => ({
  ...item,
  active: item.key === "reviews",
}));

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Reviews",
  description: "Browse community reviews",
};

export default function ReviewsRoute() {
  const headerHeadingId = "reviews-header";

  return (
    <>
      <Header
        heading={<span id={headerHeadingId}>Reviews</span>}
        subtitle="Browse community reviews"
        navItems={navItems}
        variant="neo"
        underlineTone="brand"
        showThemeToggle
      />
      <ReviewPage />
    </>
  );
}
