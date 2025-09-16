"use client";

import Link from "next/link";
import * as React from "react";
import DashboardCard from "./DashboardCard";
import { usePersistentState } from "@/lib/db";
import type { Review } from "@/lib/types";
import { LOCALE } from "@/lib/utils";
import { CircleSlash } from "lucide-react";

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
      <ul className="divide-y divide-[hsl(var(--border))]">
        {recentReviews.map((r) => (
          <li key={r.id} className="flex justify-between py-2 text-ui">
            <span>{r.title || "Untitled"}</span>
            <span className="text-label text-muted-foreground">
              {new Date(r.createdAt).toLocaleDateString(LOCALE)}
            </span>
          </li>
        ))}
        {recentReviews.length === 0 && (
          <li className="flex justify-between py-2 text-ui text-muted-foreground">
            <span className="flex items-center gap-2">
              <CircleSlash className="size-3" />
              No reviews yet
            </span>
            <Link href="/reviews" className="text-label underline">
              Create
            </Link>
          </li>
        )}
      </ul>
    </DashboardCard>
  );
}
