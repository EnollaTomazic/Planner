import type { Metadata } from "next";
import { Suspense } from "react";
import { ComponentsPage } from "@/components/gallery-page/ComponentsPage";
import { PageShell, Spinner } from "@/components/ui";
import {
  Header,
  PRIMARY_PAGE_NAV,
  type HeaderNavItem,
} from "@/components/ui/layout/Header";

const NAV_ITEMS: HeaderNavItem[] = PRIMARY_PAGE_NAV.map((item) => ({
  ...item,
  active: item.key === "components",
}));

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Components",
  description: "Browse Planner UI building blocks and examples.",
};

export default function ComponentsRoute() {
  return (
    <>
      <Header
        heading="Components"
        subtitle="Browse Planner UI building blocks and examples."
        navItems={NAV_ITEMS}
        variant="neo"
        underlineTone="brand"
        showThemeToggle
        sticky={false}
      />
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
    </>
  );
}
