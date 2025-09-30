import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import styles from "./Card.module.css";

export type CardDepth = "base" | "raised" | "sunken";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
  depth?: CardDepth;
  glitch?: boolean;
};

const Card = React.forwardRef<React.ElementRef<"div">, CardProps>(
  ({ className, asChild = false, depth = "base", glitch = false, ...props }, ref) => {
    const Component = asChild ? Slot : "div";

    return (
      <Component
        ref={ref}
        className={cn(
          styles.root,
          glitch && "glitch-wrapper",
          glitch && styles.glitch,
          "rounded-card r-card-lg p-[var(--space-4)] border border-card-hairline/60 bg-card/60 text-card-foreground",
          className,
        )}
        data-depth={depth}
        data-glitch={glitch ? "true" : undefined}
        {...props}
      />
    );
  },
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-[var(--space-2)]",
      className,
    )}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-title font-semibold tracking-[-0.01em]", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-ui text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("pt-[var(--space-2)]", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-[var(--space-4)]", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export default Card;
