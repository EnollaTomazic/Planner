import type { Metadata } from "next";
import { TeamCompsPage } from "@/components/pages";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Team",
  description: "Meet the team behind Planner.",
};

export default function Page() {
  return <TeamCompsPage />;
}
