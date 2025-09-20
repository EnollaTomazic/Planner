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
    size: "xs",
    variant: "secondary",
    "aria-label": "Add item xs",
    title: "Add item xs",
  },
  {
    size: "sm",
    variant: "secondary",
    "aria-label": "Add item sm",
    title: "Add item sm",
  },
  {
    size: "md",
    variant: "secondary",
    "aria-label": "Add item md",
    title: "Add item md",
  },
  {
    size: "lg",
    variant: "secondary",
    "aria-label": "Add item lg",
    title: "Add item lg",
  },
  {
    size: "xl",
    variant: "secondary",
    "aria-label": "Add item xl",
    title: "Add item xl",
  },
  {
    size: "md",
    variant: "ghost",
    "aria-label": "Add item ghost",
    title: "Add item ghost",
  },
  {
    size: "md",
    variant: "primary",
    "aria-label": "Add item primary",
    title: "Add item primary",
  },
] satisfies ShowcaseButtonProps[];

const PRESSED_ICON_BUTTONS = [
  {
    variant: "secondary",
    size: "md",
    className: "bg-[--active]",
    "aria-pressed": true,
    "aria-label": "Add item secondary pressed",
    title: "Add item secondary pressed",
  },
  {
    variant: "ghost",
    size: "md",
    className: "bg-[--active]",
    "aria-pressed": true,
    "aria-label": "Add item ghost pressed",
    title: "Add item ghost pressed",
  },
  {
    variant: "primary",
    size: "md",
    className: "bg-[--active]",
    "aria-pressed": true,
    "aria-label": "Add item primary pressed",
    title: "Add item primary pressed",
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
