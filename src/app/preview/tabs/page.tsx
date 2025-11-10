import type { Metadata } from "next";

import {
  DESIGN_TOKEN_GROUPS,
  buildGalleryNavigation,
} from "@/components/gallery-page/ComponentsPage";
import { PageShell, PageHeader, SectionCard, SectionCardBody } from "@/components/ui";

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
      id="page-main"
      tabIndex={-1}
      grid
      aria-labelledby="tabs-preview-heading"
      className="py-[var(--space-6)] md:py-[var(--space-8)]"
      contentClassName="gap-y-[var(--space-6)] md:gap-y-[var(--space-7)]"
    >
      <PageHeader
        as="header"
        className="col-span-full"
        title="Category tabs"
        subtitle="Gallery preview. Confirm the components gallery navigation stays legible across all Planner themes. This preview renders the four gallery categories using the production tabs layout."
        headingId="tabs-preview-heading"
      />

      <SectionCard className="col-span-full" aria-labelledby="tabs-preview-heading">
        <SectionCardBody className="space-y-[var(--space-5)]">
          <TabsPreviewMatrixClient navigation={navigation} tokenGroups={tokenGroups} />
        </SectionCardBody>
      </SectionCard>
    </PageShell>
  );
}
