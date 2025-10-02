import type { Metadata } from "next";

import {
  PageShell,
  SectionCard,
  SectionCardBody,
  SectionCardHeader,
} from "@/components/ui";

import ButtonsPreviewMatrixClient from "./ButtonsPreviewMatrixClient";

export const metadata: Metadata = {
  title: "Gallery buttons preview",
  description:
    "Preview Planner button primitives across interaction states and theme variants.",
};

export const dynamic = "force-static";

export default function ButtonsPreviewPage() {
  return (
    <PageShell
      as="main"
      grid
      aria-labelledby="buttons-preview-heading"
      className="py-[var(--space-6)] md:py-[var(--space-8)]"
      contentClassName="gap-y-[var(--space-6)] md:gap-y-[var(--space-7)]"
    >
      <SectionCard className="col-span-full" aria-labelledby="buttons-preview-heading">
        <SectionCardHeader className="space-y-[var(--space-2)]">
          <div className="space-y-[var(--space-1)]">
            <p className="text-caption font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Gallery preview
            </p>
            <h1
              id="buttons-preview-heading"
              className="text-title font-semibold tracking-[-0.01em] text-foreground"
            >
              Button primitives
            </h1>
          </div>
          <p className="max-w-3xl text-ui text-muted-foreground">
            Validate button, icon button, and segmented button states across all Planner
            themes. Each row enumerates default, hover, focus, active, disabled, and loading
            treatments using the production gallery demos.
          </p>
        </SectionCardHeader>
        <SectionCardBody className="space-y-[var(--space-5)]">
          <ButtonsPreviewMatrixClient />
        </SectionCardBody>
      </SectionCard>
    </PageShell>
  );
}
