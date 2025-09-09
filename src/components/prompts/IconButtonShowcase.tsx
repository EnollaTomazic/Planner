import * as React from "react";
import { IconButton, type IconButtonProps } from "@/components/ui";
import { Plus } from "lucide-react";

const ICON_BUTTONS = [
  {
    size: "xs",
    variant: "ring",
    "aria-label": "Add item xs",
    title: "Add item xs",
  },
  {
    size: "md",
    variant: "ring",
    "aria-label": "Add item",
    title: "Add item",
  },
  {
    size: "md",
    variant: "glow",
    "aria-label": "Add item glow",
    title: "Add item glow",
  },
] satisfies Array<
  Pick<IconButtonProps, "size" | "variant"> & { "aria-label": string; title: string }
>;

export default function IconButtonShowcase() {
  return (
    <div className="mb-8 flex gap-2">
      {ICON_BUTTONS.map((props) => (
        <IconButton key={props.title} {...props}>
          <Plus size={16} aria-hidden />
        </IconButton>
      ))}
    </div>
  );
}

