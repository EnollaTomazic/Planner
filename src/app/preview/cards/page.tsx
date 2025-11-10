import type { Metadata } from "next";

import { PageShell, PageHeader, SectionCard, SectionCardBody } from "@/components/ui";

import CardsPreviewMatrixClient from "./CardsPreviewMatrixClient";

export const metadata: Metadata = {
  title: "Gallery cards preview",
  description:
    "Preview Planner card surfaces across interaction states and theme variants.",
};

export const dynamic = "force-static";

export default function CardsPreviewPage() {
  return (
    <PageShell
      as="main"
      id="page-main"
      tabIndex={-1}
      grid
      aria-labelledby="cards-preview-heading"
      className="py-[var(--space-6)] md:py-[var(--space-8)]"
      contentClassName="gap-y-[var(--space-6)] md:gap-y-[var(--space-7)]"
    >
      <PageHeader
        as="header"
        className="col-span-full"
        title="Card surfaces"
        subtitle="Gallery preview. Compare base, neo, and section cards across default, hover, active, disabled, and loading states so theme parity issues surface quickly."
        headingId="cards-preview-heading"
      />

      <SectionCard className="col-span-full" aria-labelledby="cards-preview-heading">
        <SectionCardBody className="space-y-[var(--space-5)]">
          <CardsPreviewMatrixClient />
        </SectionCardBody>
      </SectionCard>
    </PageShell>
  );
}
