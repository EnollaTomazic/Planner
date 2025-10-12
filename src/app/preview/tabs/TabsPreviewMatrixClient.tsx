"use client";

import * as React from "react";

import { ComponentsPageClient } from "@/components/gallery-page/ComponentsPageClient";
import { ThemeMatrix } from "@/components/prompts/ComponentsView";
import type {
  DesignTokenGroup,
  GalleryNavigationData,
} from "@/components/gallery/types";

interface TabsPreviewMatrixClientProps {
  readonly navigation: GalleryNavigationData;
  readonly tokenGroups: readonly DesignTokenGroup[];
}

function GalleryTabsPreview({
  navigation,
  tokenGroups,
}: TabsPreviewMatrixClientProps) {
  return (
    <div className="bg-background text-foreground">
      <ComponentsPageClient navigation={navigation} tokenGroups={tokenGroups} />
    </div>
  );
}

export default function TabsPreviewMatrixClient({
  navigation,
  tokenGroups,
}: TabsPreviewMatrixClientProps) {
  const previewRenderer = React.useMemo(() => {
    const Renderer = () => (
      <GalleryTabsPreview navigation={navigation} tokenGroups={tokenGroups} />
    );
    Renderer.displayName = "GalleryTabsPreviewRenderer";
    return Renderer;
  }, [navigation, tokenGroups]);

  return (
    <div className="space-y-[var(--space-5)]">
      <ThemeMatrix
        entryId="gallery-tabs-preview"
        previewRenderer={previewRenderer}
      />
    </div>
  );
}
