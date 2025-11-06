import type { Metadata } from "next";

import { PageShell, PageHeader, SectionCard, SectionCardBody } from "@/components/ui";

import A11yPreviewClient from "./A11yPreviewClient";

export const metadata: Metadata = {
  title: "Accessibility preview",
  description: "Showcases focus traps, keyboard roving flows, and axe-friendly markup for reviewer audits.",
};

export const dynamic = "force-static";

export default function A11yPreviewPage() {
  return (
    <PageShell
      as="section"
      grid
      aria-labelledby="a11y-preview-heading"
      className="py-[var(--space-6)] md:py-[var(--space-8)]"
    >
      <PageHeader
        as="header"
        className="col-span-full md:col-span-10 md:col-start-2 lg:col-span-8 lg:col-start-3"
        title="Accessibility guard rails"
        subtitle="Keyboard and focus guard rails highlight Planner's focus traps, roving listboxes, and axe-friendly markup so reviewers can audit accessibility flows across themes."
        headingId="a11y-preview-heading"
      />

      <SectionCard className="col-span-full md:col-span-10 md:col-start-2 lg:col-span-8 lg:col-start-3" aria-labelledby="a11y-preview-heading">
        <SectionCardBody className="space-y-[var(--space-6)] text-ui text-muted-foreground">
          <p>
            These demos exercise Planner&apos;s focus management primitives. The modal trap keeps keyboard users inside the
            dialog until they exit, and the roving listbox demonstrates arrow key loops without hijacking Tab order.
          </p>
          <A11yPreviewClient />
        </SectionCardBody>
      </SectionCard>
    </PageShell>
  );
}
