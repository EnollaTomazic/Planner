import ComponentsPageClient from "./ComponentsPageClient";
import {
  GALLERY_SECTION_GROUPS,
  type GallerySectionGroupMeta,
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
} from "@/components/gallery/types";

const formatSectionLabel = (section: GallerySectionMeta): string => {
  if (section.label) {
    return section.label;
  }
  return formatGallerySectionLabel(section.id);
};

const buildGroupSections = (
  group: GallerySectionGroupMeta,
  knownSectionIds: ReadonlySet<GalleryNavigationSection["id"]>,
): GalleryNavigationSection[] => {
  const sections: GalleryNavigationSection[] = [];

  for (const sectionMeta of group.sections) {
    if (!knownSectionIds.has(sectionMeta.id)) {
      continue;
    }

    sections.push({
      id: sectionMeta.id,
      label: formatSectionLabel(sectionMeta),
      copy: sectionMeta.copy,
      groupId: group.id,
    });
  }

  return sections;
};

const buildGalleryNavigation = (): GalleryNavigationData => {
  const knownSectionIds = new Set<GalleryNavigationSection["id"]>(
    GALLERY_SECTION_IDS,
  );

  const groups: GalleryNavigationGroup[] = GALLERY_SECTION_GROUPS.map(
    (group) => {
      const sections = buildGroupSections(group, knownSectionIds);

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

  return <ComponentsPageClient navigation={navigation} />;
}
