"use client";

import * as React from "react";
import { DashboardCard } from "./DashboardCard";
import { DashboardList } from "./DashboardList";
import { useReviews } from "@/components/reviews";
import { LOCALE } from "@/lib/utils";

export function ReviewsCard() {
  const { recentReviews } = useReviews();

  return (
    <DashboardCard
      title="Recent reviews"
      cta={{ label: "Open Reviews", href: "/reviews" }}
    >
      <DashboardList
        items={recentReviews}
        getKey={(review) => review.id}
        itemClassName="flex justify-between text-ui"
        empty="No reviews yet"
        cta={{ label: "Create", href: "/reviews" }}
        renderItem={(review) => (
          <>
            <span>{review.title || "Untitled"}</span>
            <span className="text-label text-muted-foreground">
              {new Date(review.createdAt).toLocaleDateString(LOCALE)}
            </span>
          </>
        )}
      />
    </DashboardCard>
  );
}
