import ComponentsPageClient from "./ComponentsPageClient";
import {
  loadDesignTokenGroups,
  loadGalleryNavigation,
} from "@/components/gallery/loader";

export default async function ComponentsPage() {
  const [navigation, tokenGroups] = await Promise.all([
    loadGalleryNavigation(),
    loadDesignTokenGroups(),
  ]);

  return (
    <ComponentsPageClient navigation={navigation} tokenGroups={tokenGroups} />
  );
}
