import type { Metadata } from "next";
import { Suspense } from "react";
import { ComponentsPage } from "@/components/gallery-page/ComponentsPage";
import { PageShell, Spinner } from "@/components/ui";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Components",
  description: "Browse Planner UI building blocks and examples.",
};

export default function ComponentsRoute() {
  return (
    <Suspense
      fallback={
        <PageShell as="section" aria-busy="true" role="status">
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
