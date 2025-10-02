import type { Metadata } from "next";

import {
  PageShell,
  SectionCard,
  SectionCardHeader,
  SectionCardBody,
} from "@/components/ui";

import PerfPreviewClient from "./PerfPreviewClient";

export const metadata: Metadata = {
  title: "Performance preview",
  description:
    "Stress tests virtualization guards for long lists and downsampled charts without breaking theme parity.",
};

export const dynamic = "force-static";

export default function PerfPreviewPage() {
  return (
    <PageShell
      as="section"
      grid
      aria-labelledby="perf-preview-heading"
      className="py-[var(--space-6)] md:py-[var(--space-8)]"
    >
      <SectionCard className="col-span-full md:col-span-10 md:col-start-2 lg:col-span-8 lg:col-start-3">
        <SectionCardHeader>
          <div className="space-y-[var(--space-2)]" id="perf-preview-heading">
            <p className="text-caption font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Virtualization demo
            </p>
            <h1 className="text-title font-semibold tracking-[-0.01em]">Performance guard rails</h1>
          </div>
        </SectionCardHeader>
        <SectionCardBody className="space-y-[var(--space-6)] text-ui text-muted-foreground">
          <p>
            Preview how Planner keeps large datasets responsive. Lists flip to windowed rendering when row counts
            spike, charts downsample heavy series, and shared Web Vitals helpers keep preview/test payloads in sync so
            Playwright and axe sweeps stay deterministic across themes.
          </p>
          <PerfPreviewClient />
        </SectionCardBody>
      </SectionCard>
    </PageShell>
  );
}
