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
    size: "sm",
    variant: "ring",
    "aria-label": "Add item sm",
    title: "Add item sm",
  },
  {
    size: "md",
    variant: "ring",
    "aria-label": "Add item md",
    title: "Add item md",
  },
  {
    size: "lg",
    variant: "ring",
    "aria-label": "Add item lg",
    title: "Add item lg",
  },
  {
    size: "xl",
    variant: "ring",
    "aria-label": "Add item xl",
    title: "Add item xl",
  },
  {
    size: "md",
    variant: "glow",
    "aria-label": "Add item glow",
    title: "Add item glow",
  },
] satisfies Array<
  Pick<IconButtonProps, "size" | "variant"> & {
    "aria-label": string;
    title: string;
  }
>;

export default function IconButtonShowcase() {
  return (
    <div className="mb-8 flex gap-2">
      {ICON_BUTTONS.map((props) => (
        <IconButton key={props.title} {...props}>
          <Plus aria-hidden />
        </IconButton>
      ))}
    </div>
  );
}
