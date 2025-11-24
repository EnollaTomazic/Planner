import type { Metadata } from "next";
import { Suspense } from "react";
import HomePageContent from "@/app/home/HomePageContent.client";
import HomePageFallback from "@/app/home/HomePageFallback.server";
import { Header, PRIMARY_PAGE_NAV, type HeaderNavItem } from "@/components/ui/layout/Header";

const primaryNav = Array.isArray(PRIMARY_PAGE_NAV) ? PRIMARY_PAGE_NAV : [];

const navItems: HeaderNavItem[] = primaryNav.map((item) => ({
  ...item,
  active: item.key === "home",
}));

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Planner · Your day at a glance",
  description:
    "Plan your day, track goals, and review games with weekly highlights that keep the team aligned.",
};

export default function Page() {
  const heroHeadingId = "home-hero-heading";
  const overviewHeadingId = "home-overview-heading";
  const headerHeadingId = "home-header";

  return (
    <>
      <Header
        heading={<span id={headerHeadingId}>Planner</span>}
        subtitle="Your day at a glance"
        navItems={navItems}
        variant="neo"
        underlineTone="brand"
        showThemeToggle
      />
      <Suspense
        fallback={
          <HomePageFallback
            heroHeadingId={heroHeadingId}
            overviewHeadingId={overviewHeadingId}
          />
        }
      >
        <HomePageContent
          heroHeadingId={heroHeadingId}
          overviewHeadingId={overviewHeadingId}
        />
      </Suspense>
    </>
  );
}
