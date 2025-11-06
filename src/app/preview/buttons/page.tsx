import type { Metadata } from "next";

import { PageShell, PageHeader, SectionCard, SectionCardBody } from "@/components/ui";

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
      <PageHeader
        as="header"
        className="col-span-full"
        title="Button primitives"
        subtitle="Gallery preview. Validate button, icon button, and segmented button states across all Planner themes. Each row enumerates default, hover, focus, active, disabled, and loading treatments using the production gallery demos."
        headingId="buttons-preview-heading"
      />

      <SectionCard className="col-span-full" aria-labelledby="buttons-preview-heading">
        <SectionCardBody className="space-y-[var(--space-5)]">
          <ButtonsPreviewMatrixClient />
        </SectionCardBody>
      </SectionCard>
    </PageShell>
  );
}
