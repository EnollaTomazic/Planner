"use client";

import * as React from "react";
import { TabBar, type TabItem } from "@/components/ui";
import ButtonsPanel from "./component-gallery/ButtonsPanel";
import InputsPanel from "./component-gallery/InputsPanel";
import MiscPanel from "./component-gallery/MiscPanel";
import PlannerPanel from "./component-gallery/PlannerPanel";
import PromptsPanel from "./component-gallery/PromptsPanel";
import { useComponentGalleryState } from "./component-gallery/useComponentGalleryState";

type View = "buttons" | "inputs" | "prompts" | "planner" | "misc";

const viewTabs: TabItem<View>[] = [
  { key: "buttons", label: "Buttons" },
  { key: "inputs", label: "Inputs" },
  { key: "prompts", label: "Prompts" },
  { key: "planner", label: "Planner" },
  { key: "misc", label: "Misc" },
];

export default function ComponentGallery() {
  const [view, setView] = React.useState<View>("buttons");
  const state = useComponentGalleryState();

  let panel: React.ReactNode;
  switch (view) {
    case "buttons":
      panel = <ButtonsPanel data={state.buttons} />;
      break;
    case "inputs":
      panel = <InputsPanel data={state.inputs} />;
      break;
    case "prompts":
      panel = <PromptsPanel data={state.prompts} />;
      break;
    case "planner":
      panel = <PlannerPanel data={state.planner} />;
      break;
    case "misc":
      panel = <MiscPanel data={state.misc} />;
      break;
    default:
      panel = null;
      break;
  }

  return (
    <div className="space-y-[var(--space-8)]">
      <TabBar
        items={viewTabs}
        value={view}
        onValueChange={setView}
        ariaLabel="Component gallery"
        linkPanels={false}
      />
      {panel}
    </div>
  );
}
