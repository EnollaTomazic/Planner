"use client";

import * as React from "react";
import { TabBar, type TabItem } from "@/components/ui";
import { usePrompts } from "./usePrompts";

type Role = "designer" | "developer";

const ROLE_TABS: TabItem<Role>[] = [
  { key: "designer", label: "Senior Lead Designer" },
  { key: "developer", label: "Senior Lead Developer" },
];

export default function OnboardingTabs() {
  const [role, setRole] = React.useState<Role>("designer");
  const { prompts } = usePrompts();
  const [updatedAt, setUpdatedAt] = React.useState(Date.now());

  React.useEffect(() => {
    setUpdatedAt(Date.now());
  }, [prompts]);

  return (
    <div className="space-y-4">
      <TabBar
        items={ROLE_TABS}
        value={role}
        onValueChange={setRole}
        ariaLabel="Onboarding roles"
      />
      <p className="text-sm text-muted-foreground">
        Last updated {new Date(updatedAt).toLocaleTimeString()}
      </p>
      {role === "designer" ? (
        <ul className="list-disc pl-6 space-y-1">
          <li>Review design system guidelines</li>
          <li>Audit existing components for consistency</li>
          <li>Collaborate with developers on UI implementation</li>
        </ul>
      ) : (
        <ul className="list-disc pl-6 space-y-1">
          <li>Set up local development environment</li>
          <li>Follow project coding standards and lint rules</li>
          <li>Coordinate with designers on features</li>
        </ul>
      )}
    </div>
  );
}

