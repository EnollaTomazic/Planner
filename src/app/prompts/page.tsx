"use client";

import * as React from "react";
import { TabBar, type TabItem } from "@/components/ui";
import {
  ComponentGallery,
  ColorGallery,
  DemoHeader,
  UpdatesList,
  ButtonShowcase,
  IconButtonShowcase,
  GoalListDemo,
  FRUIT_ITEMS,
} from "@/components/prompts";
import { HomePage } from "@/components/home";
import { ROLE_OPTIONS } from "@/components/reviews/reviewData";
import type { Role } from "@/lib/types";

type View = "components" | "colors";

const VIEW_TABS: TabItem<View>[] = [
  { key: "components", label: "Components" },
  { key: "colors", label: "Colors" },
];

export default function Page() {
  const [view, setView] = React.useState<View>("components");
  const [role, setRole] = React.useState<Role>(ROLE_OPTIONS[0].value);
  const [fruit, setFruit] = React.useState(FRUIT_ITEMS[0].value);

  return (
    <main className="page-shell py-6">
      <DemoHeader
        role={role}
        onRoleChange={setRole}
        fruit={fruit}
        onFruitChange={setFruit}
      />
      <UpdatesList />
      <ButtonShowcase />
      <IconButtonShowcase />
      <GoalListDemo />
      <HomePage />
      <p className="mb-4 text-xs text-danger">Example error message</p>
      <div className="mb-8">
        <TabBar
          items={VIEW_TABS}
          value={view}
          onValueChange={setView}
          ariaLabel="Prompts gallery view"
        />
      </div>
      {view === "components" ? <ComponentGallery /> : <ColorGallery />}
    </main>
  );
}

