import * as React from "react";
import { IconButton, type IconButtonProps } from "@/components/ui";
import { Plus } from "lucide-react";

type ShowcaseButtonProps = Pick<
  IconButtonProps,
  "size" | "variant" | "className" | "aria-pressed"
> & {
  "aria-label": string;
  title: string;
};

const ICON_BUTTONS = [
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
  {
    size: "md",
    variant: "solid",
    "aria-label": "Add item solid",
    title: "Add item solid",
  },
] satisfies ShowcaseButtonProps[];

const PRESSED_ICON_BUTTONS = [
  {
    variant: "ring",
    size: "md",
    className: "bg-[--active]",
    "aria-pressed": true,
    "aria-label": "Add item ring pressed",
    title: "Add item ring pressed",
  },
  {
    variant: "glow",
    size: "md",
    className: "bg-[--active]",
    "aria-pressed": true,
    "aria-label": "Add item glow pressed",
    title: "Add item glow pressed",
  },
  {
    variant: "solid",
    size: "md",
    className: "bg-[--active]",
    "aria-pressed": true,
    "aria-label": "Add item solid pressed",
    title: "Add item solid pressed",
  },
] satisfies ShowcaseButtonProps[];

export default function IconButtonShowcase() {
  return (
    <div className="mb-[var(--space-8)] flex flex-col gap-[var(--space-4)]">
      <div className="flex gap-[var(--space-2)]">
        {ICON_BUTTONS.map((props) => (
          <IconButton key={props.title} {...props}>
            <Plus aria-hidden />
          </IconButton>
        ))}
      </div>
      <div className="flex gap-[var(--space-2)]">
        {PRESSED_ICON_BUTTONS.map((props) => (
          <IconButton key={props.title} {...props}>
            <Plus aria-hidden />
          </IconButton>
        ))}
      </div>
    </div>
  );
}
