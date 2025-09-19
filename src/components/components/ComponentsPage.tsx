import ComponentsPageClient from "./ComponentsPageClient";
import { loadGalleryNavigation } from "@/components/gallery/loader";

export default async function ComponentsPage() {
  const navigation = await loadGalleryNavigation();
  return <ComponentsPageClient navigation={navigation} />;
}
