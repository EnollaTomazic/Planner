import type { Metadata } from "next";
import PromptsPage from "./PromptsPage";

export const metadata: Metadata = {
  title: "Component Gallery",
  description:
    "Browse and explore UI components like NeoCard, the PageHeader hero variant, and the compact header navigation demo.",
};

export default function PromptsRoute() {
  return <PromptsPage />;
}
