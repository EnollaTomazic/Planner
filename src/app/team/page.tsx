import type { Metadata } from "next";
import { TeamCompPage } from "@/components/team/TeamCompPage";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Team Compositions",
  description:
    "Plan team comps with cheat sheets, a flexible builder, and jungle clears tailored to your matchups.",
};

export default function Page() {
  return <TeamCompPage />;
}
