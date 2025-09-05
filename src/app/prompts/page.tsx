import type { Metadata } from "next";
import ComponentGallery from "./ComponentGallery";

export const metadata: Metadata = { title: "Prompts · 13 League Review" };

export default function Page() {
  return <ComponentGallery />;
}
