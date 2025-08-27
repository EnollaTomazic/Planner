import type { Metadata } from "next";
import PromptsPage from "@/components/prompts/PromptsPage";
export const metadata: Metadata = { title: "Prompts · 13 League Review" };

export default function Page() { return <PromptsPage />; }