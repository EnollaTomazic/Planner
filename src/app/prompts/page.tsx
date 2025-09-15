import type { Metadata } from "next";
import PromptsPage from "./PromptsPage";

export const metadata: Metadata = {
  title: "Component Gallery",
  description:
    "Browse and explore UI components like NeoCard and the PageHeader hero variant.",
};

export default function PromptsRoute() {
  return <PromptsPage />;
}
