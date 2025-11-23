import type { Metadata } from "next";
import { Suspense } from "react";
import { ComponentsPage } from "@/components/gallery-page/ComponentsPage";
import { Header, PRIMARY_PAGE_NAV, type HeaderNavItem } from "@/components/ui/layout/Header";
import { PageShell, Spinner } from "@/components/ui";

const navItems: HeaderNavItem[] = PRIMARY_PAGE_NAV.map((item) => ({
  ...item,
  active: item.key === "components",
}));

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Components",
  description: "Browse Planner UI building blocks and examples.",
};

export default function ComponentsRoute() {
  const headerHeadingId = "components-header";

  return (
    <>
      <Header
        heading={<span id={headerHeadingId}>Components</span>}
        subtitle="Browse Planner UI building blocks and examples."
        navItems={navItems}
        variant="neo"
        underlineTone="brand"
        showThemeToggle
      />
      <Suspense
        fallback={
          <PageShell as="main" id="page-main" tabIndex={-1} aria-busy="true" role="status">
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
