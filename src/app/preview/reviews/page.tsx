import type { Metadata } from "next";

import { PageShell, PageHeader, SectionCard, SectionCardBody } from "@/components/ui";

import ReviewsPreviewMatrixClient from "./ReviewsPreviewMatrixClient";

export const metadata: Metadata = {
  title: "Reviews state previews",
  description:
    "Preview tokenized loading, error, and empty review states across all Planner themes for QA and design validation.",
};

export const dynamic = "force-static";

export default function ReviewsPreviewPage() {
  return (
    <PageShell
      as="main"
      id="page-main"
      tabIndex={-1}
      grid
      aria-labelledby="reviews-preview-heading"
      className="py-[var(--space-6)] md:py-[var(--space-8)]"
      contentClassName="gap-y-[var(--space-6)] md:gap-y-[var(--space-7)]"
    >
      <PageHeader
        as="header"
        className="col-span-full"
        title="Reviews states"
        subtitle="Gallery preview. Validate the refreshed loading, error, and empty experiences for review list and detail panels. Each card renders with production tokens so QA can audit parity across Glitch, Aurora, Kitten, Oceanic, Citrus, Noir, and Hardstuck themes."
        headingId="reviews-preview-heading"
      />

      <SectionCard
        className="col-span-full"
        aria-labelledby="reviews-preview-heading"
      >
        <SectionCardBody className="space-y-[var(--space-5)]">
          <ReviewsPreviewMatrixClient />
        </SectionCardBody>
      </SectionCard>
    </PageShell>
  );
}
