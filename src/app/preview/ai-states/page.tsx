import type { Metadata } from "next";

import {
  PageShell,
  SectionCard,
  SectionCardBody,
  SectionCardHeader,
} from "@/components/ui";

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
      grid
      aria-labelledby="ai-states-preview-heading"
      className="py-[var(--space-6)] md:py-[var(--space-8)]"
      contentClassName="gap-y-[var(--space-6)] md:gap-y-[var(--space-7)]"
    >
      <SectionCard className="col-span-full" aria-labelledby="ai-states-preview-heading">
        <SectionCardHeader className="space-y-[var(--space-2)]">
          <div className="space-y-[var(--space-1)]">
            <p className="text-caption font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Gallery preview
            </p>
            <h1
              id="ai-states-preview-heading"
              className="text-title font-semibold tracking-[-0.01em] text-foreground"
            >
              AI response state matrix
            </h1>
          </div>
          <p className="max-w-3xl text-ui text-muted-foreground">
            Stream, abort, retry, and confidence primitives render side-by-side so you can
            verify each assistant state across Glitch, Aurora, Kitten, Oceanic, Citrus, Noir,
            and Hardstuck themes. Use the toggles to confirm tone, focus, and accessibility
            treatments remain consistent.
          </p>
        </SectionCardHeader>
        <SectionCardBody className="space-y-[var(--space-5)]">
          <AIStatesPreviewMatrixClient />
        </SectionCardBody>
      </SectionCard>
    </PageShell>
  );
}
