"use client";

import * as React from "react";
import Link from "next/link";

import { Card } from "./Card";
import { DashboardList } from "./DashboardList";
import { useReviews } from "@/components/reviews";
import { Button } from "@/components/ui";
import { LOCALE, withBasePath } from "@/lib/utils";

export function ReviewsCard() {
  const { recentReviews } = useReviews();

  return (
    <Card>
      <Card.Header title="Recent reviews" />
      <Card.Body className="text-card-foreground">
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
      </Card.Body>
      <Card.Footer className="flex justify-end text-card-foreground">
        <Button asChild size="sm" variant="default">
          <Link href={withBasePath("/reviews", { skipForNextLink: true })}>
            Open Reviews
          </Link>
        </Button>
      </Card.Footer>
    </Card>
  );
}
