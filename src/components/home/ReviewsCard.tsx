"use client";

import * as React from "react";
import DashboardCard from "./DashboardCard";
import DashboardList from "./DashboardList";
import { usePersistentState } from "@/lib/db";
import type { Review } from "@/lib/types";
import { LOCALE } from "@/lib/utils";

export default function ReviewsCard() {
  const [reviews] = usePersistentState<Review[]>("reviews.v1", []);
  const recentReviews = React.useMemo(
    () => [...reviews].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3),
    [reviews],
  );

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
