import type { Metadata } from "next";

import { PageShell, PageHeader, SectionCard, SectionCardBody } from "@/components/ui";

import FormsPreviewMatrixClient from "./FormsPreviewMatrixClient";

export const metadata: Metadata = {
  title: "Gallery forms preview",
  description:
    "Preview Planner form controls across default, hover, active, disabled, and loading states.",
};

export const dynamic = "force-static";

export default function FormsPreviewPage() {
  return (
    <PageShell
      as="main"
      id="page-main"
      tabIndex={-1}
      grid
      aria-labelledby="forms-preview-heading"
      className="py-[var(--space-6)] md:py-[var(--space-8)]"
      contentClassName="gap-y-[var(--space-6)] md:gap-y-[var(--space-7)]"
    >
      <PageHeader
        as="header"
        className="col-span-full"
        title="Form controls"
        subtitle="Gallery preview. Inputs and Field wrappers surface the complete interaction stack for Planner forms, highlighting hover, focus, active, disabled, and loading states across themes."
        headingId="forms-preview-heading"
      />

      <SectionCard className="col-span-full" aria-labelledby="forms-preview-heading">
        <SectionCardBody className="space-y-[var(--space-5)]">
          <FormsPreviewMatrixClient />
        </SectionCardBody>
      </SectionCard>
    </PageShell>
  );
}
