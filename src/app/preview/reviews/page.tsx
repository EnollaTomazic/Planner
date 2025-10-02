import type { Metadata } from "next";

import {
  PageShell,
  SectionCard,
  SectionCardBody,
  SectionCardHeader,
} from "@/components/ui";

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
      grid
      aria-labelledby="reviews-preview-heading"
      className="py-[var(--space-6)] md:py-[var(--space-8)]"
      contentClassName="gap-y-[var(--space-6)] md:gap-y-[var(--space-7)]"
    >
      <SectionCard
        className="col-span-full"
        aria-labelledby="reviews-preview-heading"
      >
        <SectionCardHeader className="space-y-[var(--space-2)]">
          <div className="space-y-[var(--space-1)]">
            <p className="text-caption font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Gallery preview
            </p>
            <h1
              id="reviews-preview-heading"
              className="text-title font-semibold tracking-[-0.01em] text-foreground"
            >
              Reviews states
            </h1>
          </div>
          <p className="max-w-3xl text-ui text-muted-foreground">
            Validate the refreshed loading, error, and empty experiences for review list and detail panels. Each card renders with
            production tokens so QA can audit parity across Glitch, Aurora, Kitten, Oceanic, Citrus, Noir, and Hardstuck themes.
          </p>
        </SectionCardHeader>
        <SectionCardBody className="space-y-[var(--space-5)]">
          <ReviewsPreviewMatrixClient />
        </SectionCardBody>
      </SectionCard>
    </PageShell>
  );
}
