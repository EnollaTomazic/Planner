import type { Metadata } from "next";

import { PageShell, PageHeader, SectionCard, SectionCardBody } from "@/components/ui";

import AIPreviewClient from "./AIPreviewClient";

export const metadata: Metadata = {
  title: "AI safety components preview",
  description:
    "Preview the AI safety primitives including loading shimmer, abort button, and error card states.",
};

export const dynamic = "force-static";

export default function AIPreviewPage() {
  return (
    <PageShell
      as="main"
      id="page-main"
      tabIndex={-1}
      grid
      aria-labelledby="ai-preview-heading"
      className="py-[var(--space-6)] md:py-[var(--space-8)]"
      contentClassName="gap-y-[var(--space-6)] md:gap-y-[var(--space-7)]"
    >
      <PageHeader
        as="header"
        className="col-span-full"
        title="AI conversation states"
        subtitle="Gallery preview. Loading, abort, and error primitives ensure Planner assistants meet safety requirements with consistent states across themes. Use these components to render streaming feedback, abort affordances, and actionable error messaging."
        headingId="ai-preview-heading"
      />

      <SectionCard className="col-span-full" aria-labelledby="ai-preview-heading">
        <SectionCardBody className="space-y-[var(--space-4)]">
          <AIPreviewClient />
        </SectionCardBody>
      </SectionCard>
    </PageShell>
  );
}
