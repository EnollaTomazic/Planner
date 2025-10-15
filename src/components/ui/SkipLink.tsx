import * as React from "react";

import { cn } from "@/lib/utils";

export interface SkipLinkProps
  extends Omit<React.ComponentPropsWithoutRef<"a">, "href"> {
  /**
   * ID of the landmark to focus when activated. A leading `#` is optional.
   */
  targetId: string;
  /**
   * Accessible label for the skip action. Defaults to "Skip to main content".
   */
  children?: React.ReactNode;
  /**
   * Optional href override when linking outside of the current page.
   */
  href?: string;
}

const BASE_CLASSES =
  "fixed left-[var(--space-4)] top-[var(--space-4)] z-50 inline-flex items-center rounded-[var(--radius-lg)] bg-background px-[var(--space-4)] py-[var(--space-2)] text-ui font-medium text-foreground shadow-outline-subtle outline-none transition-all duration-motion-sm ease-out opacity-0 -translate-y-full pointer-events-none focus-visible:translate-y-0 focus-visible:opacity-100 focus-visible:pointer-events-auto focus-visible:shadow-ring focus-visible:no-underline focus-visible:outline-none hover:shadow-ring focus-visible:active:translate-y-[var(--space-1)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const SkipLink = React.forwardRef<HTMLAnchorElement, SkipLinkProps>(
  (
    {
      targetId,
      children = "Skip to main content",
      className,
      href,
      ...props
    },
    ref,
  ) => {
    const normalizedTarget = targetId.startsWith("#")
      ? targetId
      : `#${targetId}`;
    const resolvedHref = href ?? normalizedTarget;

    return (
      <a
        {...props}
        ref={ref}
        className={cn(BASE_CLASSES, className)}
        href={resolvedHref}
      >
        {children}
      </a>
    );
  },
);

SkipLink.displayName = "SkipLink";
export { SkipLink };
