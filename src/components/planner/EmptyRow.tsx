import * as React from "react";
import Button from "@/components/ui/primitives/Button";
import { cn } from "@/lib/utils";

type EmptyRowAction =
  | {
      label: string;
      onClick: () => void;
      href?: undefined;
      target?: undefined;
      rel?: undefined;
    }
  | {
      label: string;
      href: string;
      onClick?: React.MouseEventHandler<HTMLAnchorElement>;
      target?: React.AnchorHTMLAttributes<HTMLAnchorElement>["target"];
      rel?: React.AnchorHTMLAttributes<HTMLAnchorElement>["rel"];
    };

type EmptyRowProps = {
  heading: string;
  helperText: string;
  icon?: React.ReactNode;
  action?: EmptyRowAction;
  className?: string;
};

export default function EmptyRow({
  heading,
  helperText,
  icon,
  action,
  className,
}: EmptyRowProps) {
  return (
    <div className={cn("tasks-placeholder", className)} role="status">
      {icon ? (
        <div className="tasks-placeholder__icon" aria-hidden="true">
          {icon}
        </div>
      ) : null}
      <div className="tasks-placeholder__content">
        <h3 className="tasks-placeholder__heading">{heading}</h3>
        <p className="tasks-placeholder__helper">{helperText}</p>
      </div>
      {action ? (
        <div className="tasks-placeholder__cta">
          {"href" in action ? (
            <Button asChild size="sm" variant="secondary" tone="primary">
              <a href={action.href} onClick={action.onClick} target={action.target} rel={action.rel}>
                {action.label}
              </a>
            </Button>
          ) : (
            <Button size="sm" variant="secondary" tone="primary" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
