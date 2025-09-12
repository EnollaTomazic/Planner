import type { Metadata } from "next";
import TeamCompPage from "@/components/team/TeamCompPage";

export const metadata: Metadata = { title: "Team" };

export default function Page() {
  return <TeamCompPage />;
}
