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

const depthShadowClasses: Record<CardDepth, string> = {
  base: "shadow-elev-0",
  raised:
    "shadow-elev-1 hover:shadow-elev-2 focus-visible:shadow-elev-2 focus-within:shadow-elev-2",
  sunken: "shadow-inner-md",
};

const Card = React.forwardRef<React.ElementRef<"div">, CardProps>(
  (
    {
      className,
      asChild = false,
      depth = "base",
      glitch = false,
      children,
      ...props
    },
    ref,
  ) => {
    const { ["data-text"]: providedGlitchText, ...restProps } = props as CardProps & {
      ["data-text"]?: unknown;
    };
    const glitchText =
      typeof providedGlitchText === "string" ? providedGlitchText : undefined;

    const baseClassName = cn(
      styles.root,
      glitch && "group/glitch isolate",
      "rounded-card r-card-lg p-[var(--space-4)] border border-card-hairline/60 bg-card/60 text-card-foreground",
      depthShadowClasses[depth],
      className,
    );

    const overlay = glitch ? (
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]"
      >
        <span
          className="absolute inset-0 rounded-[inherit] bg-gradient-blob-primary opacity-0 blur-[var(--space-4)] transition-opacity duration-quick ease-out motion-reduce:animate-none motion-safe:animate-blob-drift group-hover/glitch:opacity-[var(--glitch-overlay-opacity-card,0.55)] group-focus-visible/glitch:opacity-[var(--glitch-overlay-opacity-card,0.55)] group-focus-within/glitch:opacity-[var(--glitch-overlay-opacity-card,0.55)]"
        />
        <span
          className="absolute inset-0 rounded-[inherit] bg-glitch-noise bg-cover opacity-0 mix-blend-screen transition-opacity duration-quick ease-out motion-reduce:animate-none motion-safe:animate-glitch-noise group-hover/glitch:opacity-[var(--glitch-noise-level,0.18)] group-focus-visible/glitch:opacity-[var(--glitch-noise-level,0.18)] group-focus-within/glitch:opacity-[calc(var(--glitch-noise-level,0.18)*1.3)]"
        />
      </span>
    ) : null;

    const baseProps = {
      className: baseClassName,
      "data-depth": depth,
      "data-glitch": glitch ? "true" : undefined,
      "data-text": glitchText,
      ...restProps,
    };

    if (asChild) {
      const childCount = React.Children.count(children);
      if (childCount !== 1 || !React.isValidElement(children)) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[Card] `asChild` requires a single valid React element child.");
        }

        return null;
      }

      const child = React.Children.only(children) as React.ReactElement<{ children?: React.ReactNode }>;

      return (
        <Slot {...baseProps} ref={ref as React.ForwardedRef<HTMLElement>}>
          {React.cloneElement(child, undefined, <>{overlay}{child.props.children}</>)}
        </Slot>
      );
    }

    return (
      <div ref={ref} {...baseProps}>
        {overlay}
        {children}
      </div>
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
