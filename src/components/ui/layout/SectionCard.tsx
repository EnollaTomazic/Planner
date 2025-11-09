// src/components/ui/SectionCard.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import styles from "./SectionCard.module.css";

type NoiseLevel = "none" | "subtle" | "moderate";

type RootProps = React.HTMLAttributes<HTMLElement> & {
  variant?: "neo" | "plain" | "glitch";
  noiseLevel?: NoiseLevel;
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

const SECTION_CARD_NOISE_STYLES: Record<NoiseLevel, React.CSSProperties> = {
  none: {
    "--texture-grain-opacity": "var(--theme-noise-level-none, 0)",
    "--texture-grain-strength": "0",
    "--texture-scanline-opacity": "var(--theme-noise-level-none, 0)",
    "--texture-scanline-strength": "0",
  } as React.CSSProperties,
  subtle: {
    "--texture-grain-opacity": "var(--theme-noise-level-subtle, 0.035)",
    "--texture-grain-strength": "1",
    "--texture-scanline-opacity": "var(--theme-scanline-opacity-subtle, 0.05)",
    "--texture-scanline-strength": "1",
  } as React.CSSProperties,
  moderate: {
    "--texture-grain-opacity": "var(--theme-noise-level-moderate, 0.06)",
    "--texture-grain-strength": "1",
    "--texture-scanline-opacity": "var(--theme-scanline-opacity-moderate, 0.08)",
    "--texture-scanline-strength": "1",
  } as React.CSSProperties,
};

const SectionCardRoot = React.forwardRef<HTMLElement, RootProps>(
  ({ variant = "neo", noiseLevel, className, children, style, ...props }, ref) => {
    const [headingId, setHeadingId] = React.useState<string | undefined>();
    const contextValue = React.useMemo(
      () => ({ headingId, setHeadingId }),
      [headingId],
    );

    const resolvedNoiseLevel: NoiseLevel = React.useMemo(() => {
      if (noiseLevel) {
        return noiseLevel;
      }

      return variant === "glitch" ? "moderate" : "subtle";
    }, [noiseLevel, variant]);

    const noiseStyle = React.useMemo<React.CSSProperties | undefined>(() => {
      const variables = SECTION_CARD_NOISE_STYLES[resolvedNoiseLevel];

      if (!style) {
        return { ...variables };
      }

      return { ...variables, ...style };
    }, [resolvedNoiseLevel, style]);

    const showNoiseBackground = resolvedNoiseLevel !== "none";

    const variantClassName = React.useMemo(() => {
      if (variant === "neo") {
        return cn(
          "card-neo-soft shadow-depth-outer-strong",
          showNoiseBackground && "bg-glitch-noise-primary",
        );
      }

      if (variant === "plain") {
        return cn("card-soft", showNoiseBackground && "bg-glitch-noise-primary");
      }

      return styles.glitch;
    }, [showNoiseBackground, variant]);

    return (
      <SectionCardContext.Provider value={contextValue}>
        <section
          ref={ref}
          data-variant={variant}
          className={cn(
            "overflow-hidden rounded-card r-card-lg text-card-foreground",
            variantClassName,
            className,
          )}
          style={noiseStyle}
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
