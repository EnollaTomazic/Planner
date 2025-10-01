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
    variant: "quiet",
    "aria-label": "Add item sm",
    title: "Add item sm",
  },
  {
    size: "md",
    variant: "quiet",
    "aria-label": "Add item md",
    title: "Add item md",
  },
  {
    size: "lg",
    variant: "quiet",
    "aria-label": "Add item lg",
    title: "Add item lg",
  },
  {
    size: "xl",
    variant: "quiet",
    "aria-label": "Add item xl",
    title: "Add item xl",
  },
  {
    size: "md",
    variant: "secondary",
    "aria-label": "Add item secondary",
    title: "Add item secondary",
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
    variant: "quiet",
    size: "md",
    className: "bg-[--active]",
    "aria-pressed": true,
    "aria-label": "Add item ghost pressed",
    title: "Add item ghost pressed",
  },
  {
    variant: "secondary",
    size: "md",
    className: "bg-[--active]",
    "aria-pressed": true,
    "aria-label": "Add item secondary pressed",
    title: "Add item secondary pressed",
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
