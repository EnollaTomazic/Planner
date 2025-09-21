import type { Metadata } from "next";
import { Suspense } from "react";
import ComponentsPage from "@/components/components/ComponentsPage";
import { PageShell, Spinner } from "@/components/ui";

export const metadata: Metadata = {
  title: "Components",
  description: "Browse Planner UI building blocks and examples.",
};

export default function ComponentsRoute() {
  return (
    <Suspense
      fallback={
        <PageShell as="main" aria-busy="true">
          <div className="flex justify-center p-[var(--space-5)]">
            <Spinner />
          </div>
        </PageShell>
      }
    >
      <ComponentsPage />
    </Suspense>
  );
}
