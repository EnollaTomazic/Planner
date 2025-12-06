// src/app/reviews/page.tsx
import type { Metadata } from "next";
import { ReviewPage } from "@/components/reviews";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Reviews",
  description: "Capture and learn from your past sprints.",
};

export default function ReviewsRoute() {
  return <ReviewPage />;
}
