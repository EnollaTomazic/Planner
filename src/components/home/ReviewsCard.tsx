"use client";

import * as React from "react";
import { DashboardListCard } from "./DashboardListCard";
import { useReviews } from "@/components/reviews";
import { LOCALE } from "@/lib/utils";

export function ReviewsCard() {
  const { recentReviews } = useReviews();

  return (
    <DashboardListCard
      title="Recent reviews"
      items={recentReviews}
      getKey={(review) => review.id}
      itemClassName="flex justify-between text-ui"
      emptyMessage="No reviews yet"
      listCta={{ label: "Create", href: "/reviews" }}
      renderItem={(review) => (
        <>
          <span>{review.title || "Untitled"}</span>
          <span className="text-label text-muted-foreground">
            {new Date(review.createdAt).toLocaleDateString(LOCALE)}
          </span>
        </>
      )}
      footerAction={{
        label: "Open Reviews",
        href: "/reviews",
      }}
    />
  );
}
