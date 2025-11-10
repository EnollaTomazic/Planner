import type { Metadata } from "next";

import { PageShell, PageHeader, SectionCard, SectionCardBody } from "@/components/ui";

import AIStatesPreviewMatrixClient from "./AIStatesPreviewMatrixClient";

export const metadata: Metadata = {
  title: "AI state matrix preview",
  description:
    "Preview AI conversation primitives across loading, abort, confidence, and error states with theme-aware styling.",
};

export const dynamic = "force-static";

export default function AIStatesPreviewPage() {
  return (
    <PageShell
      as="main"
      id="page-main"
      tabIndex={-1}
      grid
      aria-labelledby="ai-states-preview-heading"
      className="py-[var(--space-6)] md:py-[var(--space-8)]"
      contentClassName="gap-y-[var(--space-6)] md:gap-y-[var(--space-7)]"
    >
      <PageHeader
        as="header"
        className="col-span-full"
        title="AI response state matrix"
        subtitle="Gallery preview. Stream, abort, retry, and confidence primitives render side-by-side so you can verify assistant states across Glitch, Aurora, Kitten, Oceanic, Citrus, Noir, and Hardstuck themes. Use the toggles to confirm tone, focus, and accessibility treatments stay consistent."
        headingId="ai-states-preview-heading"
      />

      <SectionCard className="col-span-full" aria-labelledby="ai-states-preview-heading">
        <SectionCardBody className="space-y-[var(--space-5)]">
          <AIStatesPreviewMatrixClient />
        </SectionCardBody>
      </SectionCard>
    </PageShell>
  );
}
