import type { Metadata } from "next";
import CompsPage from "@/components/comps/CompsPage";

export const metadata: Metadata = {
  title: "Components",
  description: "Browse Planner UI building blocks and examples.",
};

export default function CompsRoute() {
  return <CompsPage />;
}
