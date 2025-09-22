import ComponentsPageClient from "./ComponentsPageClient";
import tokens from "../../../tokens/tokens.js";
import {
  GALLERY_SECTION_GROUPS,
  type GallerySectionMeta,
} from "@/components/gallery/metadata";
import {
  GALLERY_SECTION_IDS,
  formatGallerySectionLabel,
} from "@/components/gallery/registry";
import type {
  GalleryNavigationData,
  GalleryNavigationGroup,
  GalleryNavigationSection,
  DesignTokenGroup,
} from "@/components/gallery/types";
import { buildDesignTokenGroups } from "@/lib/design-token-registry";

const DESIGN_TOKEN_GROUPS = buildDesignTokenGroups(tokens);

const formatSectionLabel = (section: GallerySectionMeta): string => {
  if (section.label) {
    return section.label;
  }
  return formatGallerySectionLabel(section.id);
};

const buildGalleryNavigation = (): GalleryNavigationData => {
  const knownSectionIds = new Set<GalleryNavigationSection["id"]>(
    GALLERY_SECTION_IDS,
  );

  const groups: GalleryNavigationGroup[] = GALLERY_SECTION_GROUPS.map(
    (group) => {
      const sections: GalleryNavigationSection[] = group.sections
        .filter((section) => knownSectionIds.has(section.id))
        .map((section) => ({
          id: section.id,
          label: formatSectionLabel(section),
          copy: section.copy,
          groupId: group.id,
        }));

      return {
        id: group.id,
        label: group.label,
        copy: group.copy,
        sections,
      } satisfies GalleryNavigationGroup;
    },
  );

  return { groups } satisfies GalleryNavigationData;
};

export default function ComponentsPage() {
  const navigation = buildGalleryNavigation();
  const tokenGroups: readonly DesignTokenGroup[] = DESIGN_TOKEN_GROUPS;

  return (
    <ComponentsPageClient navigation={navigation} tokenGroups={tokenGroups} />
  );
}
