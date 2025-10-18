import type { Metadata } from "next";

import {
  PageShell,
  SectionCard,
  SectionCardBody,
  SectionCardHeader,
} from "@/components/ui";

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
      grid
      aria-labelledby="ai-preview-heading"
      className="py-[var(--space-6)] md:py-[var(--space-8)]"
      contentClassName="gap-y-[var(--space-6)] md:gap-y-[var(--space-7)]"
    >
      <SectionCard className="col-span-full" aria-labelledby="ai-preview-heading">
        <SectionCardHeader className="space-y-[var(--space-2)]">
          <div className="space-y-[var(--space-1)]">
            <p className="text-caption font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Gallery preview
            </p>
            <h1
              id="ai-preview-heading"
              className="text-title font-semibold tracking-[-0.01em] text-foreground"
            >
              AI conversation states
            </h1>
          </div>
          <p className="max-w-3xl text-ui text-muted-foreground">
            Loading, abort, and error primitives ensure Planner assistants meet safety requirements
            with consistent states across themes. Use these components to render streaming feedback,
            abort affordances, and actionable error messaging.
          </p>
        </SectionCardHeader>
        <SectionCardBody className="space-y-[var(--space-4)]">
          <AIPreviewClient />
        </SectionCardBody>
      </SectionCard>
    </PageShell>
  );
}
