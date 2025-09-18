import type { Metadata } from "next";
import { Suspense } from "react";
import ComponentsPage from "@/components/components/ComponentsPage";
import { Spinner } from "@/components/ui";

export const metadata: Metadata = {
  title: "Components",
  description: "Browse Planner UI building blocks and examples.",
};

export default function ComponentsRoute() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-6">
          <Spinner />
        </div>
      }
    >
      <ComponentsPage />
    </Suspense>
  );
}
