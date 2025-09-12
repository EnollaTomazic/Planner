import type { Metadata } from "next";
import PromptsPage from "./PromptsPage";

export const metadata: Metadata = {
  title: "Component Gallery",
  description: "Browse and explore UI components.",
};

export default function PromptsRoute() {
  return <PromptsPage />;
}
