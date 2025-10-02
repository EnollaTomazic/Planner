import type { Metadata } from "next";

import {
  PageShell,
  SectionCard,
  SectionCardBody,
  SectionCardHeader,
} from "@/components/ui";

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
      grid
      aria-labelledby="forms-preview-heading"
      className="py-[var(--space-6)] md:py-[var(--space-8)]"
      contentClassName="gap-y-[var(--space-6)] md:gap-y-[var(--space-7)]"
    >
      <SectionCard className="col-span-full" aria-labelledby="forms-preview-heading">
        <SectionCardHeader className="space-y-[var(--space-2)]">
          <div className="space-y-[var(--space-1)]">
            <p className="text-caption font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Gallery preview
            </p>
            <h1
              id="forms-preview-heading"
              className="text-title font-semibold tracking-[-0.01em] text-foreground"
            >
              Form controls
            </h1>
          </div>
          <p className="max-w-3xl text-ui text-muted-foreground">
            Inputs and Field wrappers surface the complete interaction stack for Planner forms,
            highlighting hover, focus, active, disabled, and loading states across themes.
          </p>
        </SectionCardHeader>
        <SectionCardBody className="space-y-[var(--space-5)]">
          <FormsPreviewMatrixClient />
        </SectionCardBody>
      </SectionCard>
    </PageShell>
  );
}
