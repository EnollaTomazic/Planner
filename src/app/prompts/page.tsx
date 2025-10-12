import type { Metadata } from "next";
import { PromptsPage } from "@/components/prompts/PromptsPage";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Saved Prompts Library",
  description:
    "Browse saved Planner prompts, capture new ideas, and explore demos for composing, saving, and reusing prompts. Layout primitives documented on this route: Grid, Stack, Cluster, Sidebar, and Switcher.",
};

export default function PromptsRoute() {
  return <PromptsPage />;
}
