import type { Metadata } from "next";

import { PageShell, PageHeader, SectionCard, SectionCardBody } from "@/components/ui";
import { Database } from "lucide-react";

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
      <PageHeader
        as="header"
        className="col-span-full md:col-span-10 md:col-start-2 lg:col-span-8 lg:col-start-3"
        title="Performance guard rails"
        subtitle="Preview how Planner keeps large datasets responsive. Lists flip to windowed rendering when row counts spike, charts downsample heavy series, and shared Web Vitals helpers keep preview/test payloads in sync so Playwright and axe sweeps stay deterministic across themes."
        headingId="perf-preview-heading"
        hero={
          <div className="rounded-full border border-border/60 bg-panel/60 p-[var(--space-4)]">
            <Database className="h-8 w-8 text-muted-foreground" />
          </div>
        }
      />

      <SectionCard className="col-span-full md:col-span-10 md:col-start-2 lg:col-span-8 lg:col-start-3">
        <SectionCardBody className="space-y-[var(--space-6)] text-ui text-muted-foreground">
          <PerfPreviewClient />
        </SectionCardBody>
      </SectionCard>
    </PageShell>
  );
}
