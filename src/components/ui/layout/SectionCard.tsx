// src/components/ui/SectionCard.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type RootProps = React.HTMLAttributes<HTMLElement> & {
  variant?: "neo" | "plain" | "glitch";
};
export type SectionCardHeaderProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> & {
  sticky?: boolean;
  topClassName?: string; // sticky top offset
  children?: React.ReactNode; // if provided, we render this and ignore title/actions
  title?: React.ReactNode; // optional convenience API
  actions?: React.ReactNode; // optional convenience API
  titleAs?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  titleClassName?: string;
};
type BodyProps = React.HTMLAttributes<HTMLDivElement>;

type SectionCardContextValue = {
  headingId?: string;
  setHeadingId: React.Dispatch<React.SetStateAction<string | undefined>>;
};

const SectionCardContext = React.createContext<SectionCardContextValue | null>(
  null,
);

const SectionCardRoot = React.forwardRef<HTMLElement, RootProps>(
  ({ variant = "neo", className, children, ...props }, ref) => {
    const [headingId, setHeadingId] = React.useState<string | undefined>();
    const contextValue = React.useMemo(
      () => ({ headingId, setHeadingId }),
      [headingId],
    );

    return (
      <SectionCardContext.Provider value={contextValue}>
        <section
          ref={ref}
          className={cn(
            "overflow-hidden rounded-card r-card-lg text-card-foreground",
            variant === "neo"
              ? "card-neo-soft bg-glitch-noise-primary"
              : variant === "plain"
                ? "card-soft bg-glitch-noise-primary"
                : "glitch-card",
            className,
          )}
          {...props}
        >
          {children}
        </section>
      </SectionCardContext.Provider>
    );
  },
);
SectionCardRoot.displayName = "SectionCard";

function SectionCardHeader({
  sticky,
  topClassName = "top-[var(--space-8)]",
  className,
  children,
  title,
  actions,
  titleAs = "h2",
  titleClassName,
  id,
  ...props
}: SectionCardHeaderProps) {
  const setHeadingId = React.useContext(SectionCardContext)?.setHeadingId;
  const autoId = React.useId();
  const shouldUseDefaultLayout = children === undefined || children === null;
  const hasTitle = shouldUseDefaultLayout && title !== undefined && title !== null;
  const headingId = hasTitle ? id ?? autoId : undefined;

  React.useEffect(() => {
    if (!setHeadingId) return;

    setHeadingId(headingId);

    return () => {
      setHeadingId(undefined);
    };
  }, [setHeadingId, headingId]);

  let renderedTitle: React.ReactNode = null;

  if (hasTitle && headingId) {
    if (
      React.isValidElement(title) &&
      typeof title.type === "string" &&
      /^h[1-6]$/.test(title.type)
    ) {
      const headingElement = title as React.ReactElement<{
        className?: string;
        id?: string;
      }>;

      renderedTitle = React.cloneElement(headingElement, {
        id: headingId,
        className: cn(titleClassName, headingElement.props.className),
      });
    } else {
      const HeadingTag = titleAs;
      renderedTitle = (
        <HeadingTag id={headingId} className={titleClassName}>
          {title}
        </HeadingTag>
      );
    }
  } else if (title !== undefined && title !== null) {
    renderedTitle = title;
  }

  return (
    <div
      className={cn(
        "section-h",
        sticky ? cn("sticky", topClassName) : undefined,
        className,
      )}
      {...props}
    >
      {children ?? (
        <div className="flex w-full items-center justify-between">
          <div>{renderedTitle}</div>
          <div>{actions}</div>
        </div>
      )}
    </div>
  );
}

function SectionCardBody({ className, ...props }: BodyProps) {
  const context = React.useContext(SectionCardContext);
  const labelledBy =
    (props as React.HTMLAttributes<HTMLDivElement>)["aria-labelledby"] ??
    context?.headingId;

  return (
    <div
      {...props}
      className={cn("section-b", "text-ui", className)}
      aria-labelledby={labelledBy}
    />
  );
}

const SectionCard = Object.assign(SectionCardRoot, {
  Header: SectionCardHeader,
  Body: SectionCardBody,
});

export { SectionCardHeader, SectionCardBody };
export { SectionCard };
