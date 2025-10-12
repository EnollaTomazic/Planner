import { Suspense } from "react";
import type { Metadata } from "next";
import { glitchLandingEnabled } from "@/lib/features";
import {
  HOME_HERO_HEADING_ID,
  HOME_OVERVIEW_HEADING_ID,
  HomePageSuspenseFallback,
} from "./home/home-fallbacks";

import HomePlannerIsland from "./home/HomePlannerIslandBoundary.client";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Planner · Your day at a glance",
  description:
    "Plan your day, track goals, and review games with weekly highlights that keep the team aligned.",
};

export default function Page() {
  const glitchLandingState = glitchLandingEnabled;

  return (
    <Suspense
      fallback={
        <HomePageSuspenseFallback
          heroHeadingId={HOME_HERO_HEADING_ID}
          overviewHeadingId={HOME_OVERVIEW_HEADING_ID}
        />
      }
    >
      <HomePlannerIsland glitchLandingEnabled={glitchLandingState} />
    </Suspense>
  );
}
