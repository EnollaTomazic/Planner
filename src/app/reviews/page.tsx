// src/app/reviews/page.tsx
import type { Metadata } from "next";
import { ReviewPage } from "@/components/reviews";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Reviews",
  description: "Browse community reviews",
};

export default function ReviewsRoute() {
  return <ReviewPage />;
}
