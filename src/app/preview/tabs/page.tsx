import type { Metadata } from "next";

import {
  DESIGN_TOKEN_GROUPS,
  buildGalleryNavigation,
} from "@/components/gallery-page/ComponentsPage";
import { PageShell, SectionCard } from "@/components/ui";

import TabsPreviewMatrixClient from "./TabsPreviewMatrixClient";

export const metadata: Metadata = {
  title: "Gallery tabs preview",
  description:
    "Preview the components gallery category tabs across Planner themes.",
};

export const dynamic = "force-static";

export default function TabsPreviewPage() {
  const navigation = buildGalleryNavigation();
  const tokenGroups = DESIGN_TOKEN_GROUPS;

  return (
    <PageShell
      as="main"
      grid
      aria-labelledby="tabs-preview-heading"
      className="py-[var(--space-6)] md:py-[var(--space-8)]"
      contentClassName="gap-y-[var(--space-6)] md:gap-y-[var(--space-7)]"
    >
      <SectionCard className="col-span-full" aria-labelledby="tabs-preview-heading">
        <SectionCard.Header className="space-y-[var(--space-2)]">
          <div className="space-y-[var(--space-1)]">
            <p className="text-caption font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Gallery preview
            </p>
            <h1
              id="tabs-preview-heading"
              className="text-title font-semibold tracking-[-0.01em] text-foreground"
            >
              Category tabs
            </h1>
          </div>
          <p className="max-w-3xl text-ui text-muted-foreground">
            Confirm the components gallery navigation stays legible across all Planner themes.
            This preview renders the four gallery categories using the production tabs layout.
          </p>
        </SectionCard.Header>
        <SectionCard.Body className="space-y-[var(--space-5)]">
          <TabsPreviewMatrixClient navigation={navigation} tokenGroups={tokenGroups} />
        </SectionCard.Body>
      </SectionCard>
    </PageShell>
  );
}
