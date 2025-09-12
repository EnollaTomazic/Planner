import type { Metadata } from "next";
import TeamCompPage from "@/components/team/TeamCompPage";

export const metadata: Metadata = {
  title: "Team · 13 League Review",
  description: "Meet the people behind 13 League Review.",
};

export default function Page() {
  return <TeamCompPage />;
}
