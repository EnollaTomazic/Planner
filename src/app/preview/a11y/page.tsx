import type { Metadata } from "next";

import { PageShell, SectionCard } from "@/components/ui";

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
      <SectionCard className="col-span-full md:col-span-10 md:col-start-2 lg:col-span-8 lg:col-start-3">
        <SectionCard.Header>
          <div className="space-y-[var(--space-2)]" id="a11y-preview-heading">
            <p className="text-caption font-medium uppercase tracking-[0.2em] text-muted-foreground">Keyboard and focus</p>
            <h1 className="text-title font-semibold tracking-[-0.01em]">Accessibility guard rails</h1>
          </div>
        </SectionCard.Header>
        <SectionCard.Body className="space-y-[var(--space-6)] text-ui text-muted-foreground">
          <p>
            These demos exercise Planner&apos;s focus management primitives. The modal trap keeps keyboard users inside the
            dialog until they exit, and the roving listbox demonstrates arrow key loops without hijacking Tab order.
          </p>
          <A11yPreviewClient />
        </SectionCard.Body>
      </SectionCard>
    </PageShell>
  );
}
