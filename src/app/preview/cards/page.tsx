import type { Metadata } from "next";

import {
  PageShell,
  SectionCard,
  SectionCardBody,
  SectionCardHeader,
} from "@/components/ui";

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
      grid
      aria-labelledby="cards-preview-heading"
      className="py-[var(--space-6)] md:py-[var(--space-8)]"
      contentClassName="gap-y-[var(--space-6)] md:gap-y-[var(--space-7)]"
    >
      <SectionCard className="col-span-full" aria-labelledby="cards-preview-heading">
        <SectionCardHeader className="space-y-[var(--space-2)]">
          <div className="space-y-[var(--space-1)]">
            <p className="text-caption font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Gallery preview
            </p>
            <h1
              id="cards-preview-heading"
              className="text-title font-semibold tracking-[-0.01em] text-foreground"
            >
              Card surfaces
            </h1>
          </div>
          <p className="max-w-3xl text-ui text-muted-foreground">
            Compare base cards, neo cards, and section cards across default, hover, active,
            disabled, and loading states. States reuse production gallery demos so theme
            parity issues surface quickly.
          </p>
        </SectionCardHeader>
        <SectionCardBody className="space-y-[var(--space-5)]">
          <CardsPreviewMatrixClient />
        </SectionCardBody>
      </SectionCard>
    </PageShell>
  );
}
