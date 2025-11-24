import type { Metadata } from "next";
import { Suspense } from "react";
import HomePageContent from "@/app/home/HomePageContent.client";
import HomePageFallback from "@/app/home/HomePageFallback.server";
import { Header } from "@/components/ui/layout/Header";

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
        variant="neo"
        underlineTone="brand"
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
