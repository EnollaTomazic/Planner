"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import { HeroGlitchStyles } from "../layout/hero/HeroGlitchStyles";
import { NeomorphicFrameStyles } from "../layout/NeomorphicFrameStyles";

type GlitchNeoCardStyle = React.CSSProperties & {
  "--glitch-neo-card-padding"?: string;
  "--glitch-neo-card-scanline-opacity"?: string;
  "--texture-scanline-opacity"?: string;
  "--texture-scanline-strength"?: string;
};

type GlitchNeoCardNoiseLevel = "none" | "subtle" | "moderate";

export type GlitchNeoCardProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Render the neomorphic frame and glitch noise helpers.
   * Disable for lean surfaces that shouldn't load the styles.
   */
  frame?: boolean;
  /** Optional leading title. */
  title?: React.ReactNode;
  /** Optional supporting subtitle. */
  subtitle?: React.ReactNode;
  /** Optional action elements rendered alongside the title stack. */
  actions?: React.ReactNode;
  /**
   * Override the default padding token for the surface.
   * Accepts any valid CSS `padding` value.
   */
  padding?: string;
  /** Adjust the scanline overlay strength. */
  noiseLevel?: GlitchNeoCardNoiseLevel;
};

const baseClassName = cn(
  "relative isolate overflow-hidden",
  "rounded-card r-card-lg bg-card/80 backdrop-blur shadow-depth-outer-xl",
  "p-[var(--glitch-neo-card-padding,var(--space-6))]",
  "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:content-['']",
  "after:bg-[var(--card-overlay-scanlines)] after:mix-blend-soft-light after:opacity-[var(--glitch-neo-card-scanline-opacity,var(--theme-scanline-opacity-subtle,0.05))] after:z-[1]",
);

const GLITCH_NEO_NOISE_STYLES: Record<
  GlitchNeoCardNoiseLevel,
  GlitchNeoCardStyle
> = {
  none: {
    "--glitch-neo-card-scanline-opacity": "0",
    "--texture-scanline-opacity": "var(--theme-noise-level-none, 0)",
    "--texture-scanline-strength": "0",
  },
  subtle: {
    "--glitch-neo-card-scanline-opacity":
      "var(--theme-scanline-opacity-subtle, 0.05)",
    "--texture-scanline-opacity": "var(--theme-scanline-opacity-subtle, 0.05)",
    "--texture-scanline-strength": "1",
  },
  moderate: {
    "--glitch-neo-card-scanline-opacity":
      "var(--theme-scanline-opacity-moderate, 0.08)",
    "--texture-scanline-opacity": "var(--theme-scanline-opacity-moderate, 0.08)",
    "--texture-scanline-strength": "1",
  },
};

const headerContainerClassName = "relative z-[2] mb-[var(--space-4)] flex flex-col gap-[var(--space-2)] md:flex-row md:items-start md:justify-between";
const headerTextStackClassName = "space-y-[var(--space-1)]";
const headerTitleClassName = "text-title font-semibold tracking-[-0.01em] text-foreground";
const headerSubtitleClassName = "text-label text-muted-foreground";
const headerActionsClassName = "flex flex-wrap gap-[var(--space-2)] md:justify-end";

const GlitchNeoCard = React.forwardRef<HTMLDivElement, GlitchNeoCardProps>(
  (
    {
      className,
      children,
      frame = true,
      title,
      subtitle,
      actions,
      padding,
      style,
      noiseLevel = "subtle",
      ...rest
    },
    ref,
  ) => {
    const resolvedStyle = React.useMemo<GlitchNeoCardStyle>(() => {
      const variables = GLITCH_NEO_NOISE_STYLES[noiseLevel];
      const baseStyle: GlitchNeoCardStyle = {
        ...variables,
      };

      if (padding) {
        baseStyle["--glitch-neo-card-padding"] = padding;
      }

      if (style) {
        return {
          ...baseStyle,
          ...(style as GlitchNeoCardStyle),
        };
      }

      return baseStyle;
    }, [noiseLevel, padding, style]);

    const hasTitle = title !== undefined && title !== null && title !== "";
    const hasSubtitle = subtitle !== undefined && subtitle !== null && subtitle !== "";
    const hasActions = actions !== undefined && actions !== null;
    const hasHeaderContent = hasTitle || hasSubtitle || hasActions;

    const renderedTitle = React.useMemo(() => {
      if (!hasTitle) return null;

      if (React.isValidElement(title)) {
        return React.cloneElement(title as React.ReactElement<{ className?: string }>, {
          className: cn(headerTitleClassName, (title as React.ReactElement<{ className?: string }>).props.className),
        });
      }

      return <div className={headerTitleClassName}>{title}</div>;
    }, [hasTitle, title]);

    const renderedSubtitle = React.useMemo(() => {
      if (!hasSubtitle) return null;

      if (React.isValidElement(subtitle)) {
        return React.cloneElement(subtitle as React.ReactElement<{ className?: string }>, {
          className: cn(headerSubtitleClassName, (subtitle as React.ReactElement<{ className?: string }>).props.className),
        });
      }

      return <div className={headerSubtitleClassName}>{subtitle}</div>;
    }, [hasSubtitle, subtitle]);

    return (
      <div
        ref={ref}
        className={cn(baseClassName, className)}
        style={resolvedStyle}
        {...rest}
      >
        {frame ? (
          <>
            <NeomorphicFrameStyles />
            <HeroGlitchStyles />
          </>
        ) : null}
        {hasHeaderContent ? (
          <div className={headerContainerClassName}>
            <div className={headerTextStackClassName}>
              {renderedTitle}
              {renderedSubtitle}
            </div>
            {hasActions ? <div className={headerActionsClassName}>{actions}</div> : null}
          </div>
        ) : null}
        <div className="relative z-[2] flex w-full flex-col gap-[var(--space-3)]">
          {children}
        </div>
      </div>
    );
  },
);

GlitchNeoCard.displayName = "GlitchNeoCard";

export { GlitchNeoCard };
