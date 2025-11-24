// src/app/reviews/page.tsx
import type { Metadata } from "next";
import { ReviewPage } from "@/components/reviews";
import { Header } from "@/components/ui/layout/Header";

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
        variant="neo"
        underlineTone="brand"
      />
      <ReviewPage />
    </>
  );
}
