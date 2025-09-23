"use client";

import * as React from "react";
import type { CSSProperties } from "react";
import { Slot } from "@radix-ui/react-slot";
import { motion, useReducedMotion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import { cn, withBasePath } from "@/lib/utils";
import Spinner, { type SpinnerTone, type SpinnerSize } from "../feedback/Spinner";
import { neuRaised, neuInset } from "./Neu";

export const buttonSizes = {
  sm: {
    height: "h-[var(--control-h-sm)]",
    padding: "px-[var(--space-4)]",
    text: "text-label",
    gap: "gap-[var(--space-1)]",
    icon: "[&_svg]:size-[var(--space-4)]",
  },
  md: {
    height: "h-[var(--control-h-md)]",
    padding: "px-[var(--space-4)]",
    text: "text-ui",
    gap: "gap-[var(--space-2)]",
    icon: "[&_svg]:size-[var(--space-5)]",
  },
  lg: {
    height: "h-[var(--control-h-lg)]",
    padding: "px-[var(--space-8)]",
    text: "text-title",
    gap: "gap-[var(--space-4)]",
    icon: "[&_svg]:size-[var(--space-8)]",
  },
  xl: {
    height: "h-[var(--control-h-xl)]",
    padding: "px-[calc(var(--control-h-xl)*4/3)]",
    text: "text-title-lg",
    gap: "gap-[calc(var(--control-h-xl)/3)]",
    icon: "[&_svg]:size-[calc(var(--control-h-xl)*4/3)]",
  },
} as const;

export type ButtonSize = keyof typeof buttonSizes;

type Tone = SpinnerTone;

const buttonSpinnerSizes: Record<ButtonSize, SpinnerSize> = {
  sm: "control-sm",
  md: "control-md",
  lg: "control-lg",
  xl: "control-xl",
};

const MotionSlot = motion.create(Slot);
const MotionAnchor = motion.a;

type AnchorMotionProps = HTMLMotionProps<"a">;

type ButtonBaseProps = {
  size?: ButtonSize;
  variant?: "primary" | "secondary" | "ghost";
  tone?: Tone;
  loading?: boolean;
  tactile?: boolean;
};

type ButtonAsButtonProps = ButtonBaseProps &
  Omit<HTMLMotionProps<"button">, "ref"> & {
    asChild?: false;
    href?: undefined;
  };

type ButtonAsAnchorProps = ButtonBaseProps &
  Omit<AnchorMotionProps, "ref"> & {
    asChild?: false;
    href: AnchorMotionProps["href"];
  };

type ButtonAsChildProps = ButtonBaseProps &
  Omit<HTMLMotionProps<"button">, "ref"> & {
    asChild: true;
    href?: undefined;
  };

/**
 * Props for the {@link Button} component.
 * @property loading - When `true`, the button is disabled and `data-loading` is set.
 */
export type ButtonProps =
  | ButtonAsButtonProps
  | ButtonAsAnchorProps
  | ButtonAsChildProps;

export const colorVar: Record<Tone, string> = {
  primary: "--primary",
  accent: "--accent",
  info: "--accent-2",
  danger: "--danger",
};

const toneForegroundVar: Record<Tone, string> = {
  primary: "--primary-foreground",
  accent: "--accent-foreground",
  info: "--accent-2-foreground",
  danger: "--danger-foreground",
};

const toneInteractionTokens: Record<Tone, string> = {
  primary:
    "[--hover:theme('colors.interaction.primary.hover')] [--active:theme('colors.interaction.primary.active')]",
  accent:
    "[--hover:theme('colors.interaction.accent.hover')] [--active:theme('colors.interaction.accent.active')]",
  info:
    "[--hover:theme('colors.interaction.info.hover')] [--active:theme('colors.interaction.info.active')]",
  danger:
    "[--hover:theme('colors.interaction.danger.hover')] [--active:theme('colors.interaction.danger.active')]",
};

export const toneClasses: Record<
  NonNullable<ButtonProps["variant"]>,
  Record<Tone, string>
> = {
  primary: {
    primary: toneInteractionTokens.primary,
    accent: toneInteractionTokens.accent,
    info: toneInteractionTokens.info,
    danger: toneInteractionTokens.danger,
  },
  secondary: {
    primary:
      "text-muted-foreground bg-panel/60 [--hover:hsl(var(--primary)/0.25)] [--active:hsl(var(--primary)/0.35)] hover:text-foreground active:text-foreground focus-visible:text-foreground",
    accent:
      "text-on-accent bg-accent/30 [--hover:hsl(var(--accent)/0.25)] [--active:hsl(var(--accent)/0.2)]",
    info:
      "text-on-accent bg-accent-2/25 [--hover:hsl(var(--accent-2)/0.2)] [--active:hsl(var(--accent-2)/0.15)]",
    danger: `${toneInteractionTokens.danger} text-danger-foreground bg-danger/25`,
  },
  ghost: {
    primary:
      "text-foreground bg-card/60 [--hover:hsl(var(--background)/0.8)] [--active:hsl(var(--background))]",
    accent:
      "text-on-accent bg-accent/20 [--hover:theme('colors.interaction.accent.surfaceHover')] [--active:theme('colors.interaction.accent.surfaceActive')]",
    info:
      "text-on-accent bg-accent-2/20 [--hover:theme('colors.interaction.info.surfaceHover')] [--active:theme('colors.interaction.info.surfaceActive')]",
    danger:
      "text-danger [--hover:theme('colors.interaction.danger.tintHover')] [--active:theme('colors.interaction.danger.tintActive')]",
  },
};

type VariantConfigResult = {
  className: string;
  whileHover?: HTMLMotionProps<"button">["whileHover"];
  whileTap?: HTMLMotionProps<"button">["whileTap"];
  overlay?: React.ReactNode;
  contentClass?: string;
};

type VariantConfig = (options: {
  tone: Tone;
  tactile: boolean;
}) => VariantConfigResult;

const composeShadow = (layers: string[]) => layers.join(", ");

export const variants: Record<
  NonNullable<ButtonProps["variant"]>,
  VariantConfig
> = {
  primary: ({ tone, tactile }) => ({
    className: cn(
      "shadow-[var(--btn-primary-shadow-rest)] hover:shadow-[var(--btn-primary-shadow-hover)] active:shadow-[var(--btn-primary-shadow-active)]",
      tactile
        ? "active:translate-y-0"
        : "active:translate-y-[var(--spacing-0-25)]",
      tone === "primary"
        ? "bg-primary-soft"
        : `bg-[hsl(var(${colorVar[tone]})/0.12)]`,
      `border-[hsl(var(${colorVar[tone]})/0.35)]`,
      tone === "accent" || tone === "info"
        ? "text-on-accent"
        : `text-[hsl(var(${toneForegroundVar[tone]}))]`,
    ),
    whileTap: {
      scale: tactile ? 0.98 : 0.97,
    },
    contentClass:
      "relative z-10 inline-flex items-center gap-[var(--space-2)]",
  }),
  secondary: ({ tactile }) => ({
    className: cn(
      "bg-panel/80 shadow-[var(--btn-secondary-shadow-rest)] hover:shadow-[var(--btn-secondary-shadow-hover)] active:shadow-[var(--btn-secondary-shadow-active)]",
      tactile && "active:translate-y-0",
    ),
    whileHover: tactile
      ? { scale: 1.01 }
      : { scale: 1.02, boxShadow: neuRaised(15) },
    whileTap: tactile
      ? { scale: 0.98 }
      : {
          scale: 0.97,
          boxShadow: neuInset(9) as CSSProperties["boxShadow"],
        },
  }),
  ghost: () => ({
    className: "bg-transparent",
    whileTap: { scale: 0.97 },
  }),
} as const;

export const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>((props, ref) => {
  const {
    className,
    size = "md",
    variant = "secondary",
    tone = "primary",
    children,
    loading,
    tactile = false,
    style,
  } = props;
  const asChild = props.asChild ?? false;
  const reduceMotion = useReducedMotion();
  const disabledProp =
    "disabled" in props && typeof props.disabled !== "undefined"
      ? props.disabled
      : undefined;
  const isDisabled = Boolean(disabledProp) || Boolean(loading);
  const isLink =
    !asChild && "href" in props && typeof props.href !== "undefined";
  const toneColorVar = colorVar[tone];
  const s = buttonSizes[size];
  const spinnerSize = buttonSpinnerSizes[size];
  const base = cn(
    "relative inline-flex items-center justify-center rounded-[var(--control-radius)] border font-medium tracking-[0.02em] transition-all duration-[var(--dur-quick)] ease-out motion-reduce:transition-none hover:bg-[--hover] active:bg-[--active] focus-visible:[outline:none] focus-visible:ring-2 focus-visible:ring-[var(--focus)] disabled:opacity-[var(--disabled)] disabled:pointer-events-none data-[loading=true]:opacity-[var(--loading)]",
    "data-[disabled=true]:opacity-[var(--disabled)] data-[disabled=true]:pointer-events-none",
    s.height,
    s.padding,
    s.text,
    s.gap,
    s.icon,
    className,
  );

  const {
    className: resolvedVariantClass,
    whileHover: variantHover,
    whileTap,
    overlay,
    contentClass,
  } = variants[variant]({ tone, tactile });

  const hoverAnimation = reduceMotion
    ? undefined
    : variant === "primary"
      ? { scale: tactile ? 1.02 : 1.03 }
      : variantHover;

  const contentClasses = cn(
    contentClass ?? cn("inline-flex items-center", s.gap),
    loading && "opacity-0",
  );

  let resolvedStyle = style;

  if (variant === "primary") {
    const basePrimaryShadows = {
      "--glow-active": `hsl(var(${toneColorVar}) / 0.35)`,
      "--btn-primary-hover-shadow":
        `0 var(--spacing-0-5) calc(var(--space-3) / 2) calc(-1 * var(--spacing-0-25)) hsl(var(${toneColorVar}) / 0.25)`,
      "--btn-primary-active-shadow":
        `inset 0 0 0 var(--spacing-0-25) hsl(var(${toneColorVar}) / 0.6)`,
      "--btn-primary-shadow-rest": "0 0 calc(var(--space-4) / 2) var(--glow-active)",
      "--btn-primary-shadow-hover": "0 0 var(--space-4) var(--glow-active)",
      "--btn-primary-shadow-active": "var(--btn-primary-active-shadow)",
    } as CSSProperties;

    const tactilePrimary = tactile
      ? {
          "--btn-primary-shadow-rest": composeShadow([
            `inset 0 var(--spacing-0-5) var(--space-2) hsl(var(${toneColorVar}) / 0.32)`,
            `inset 0 calc(-1 * var(--spacing-0-5)) var(--space-2) hsl(var(${toneColorVar}) / 0.18)`,
            `inset 0 0 0 var(--spacing-0-25) hsl(var(${toneColorVar}) / 0.4)`,
          ]),
          "--btn-primary-shadow-hover": composeShadow([
            `inset 0 var(--spacing-0-5) var(--space-2) hsl(var(${toneColorVar}) / 0.32)`,
            `inset 0 calc(-1 * var(--spacing-0-5)) var(--space-2) hsl(var(${toneColorVar}) / 0.22)`,
            `0 0 0 var(--spacing-0-5) hsl(var(${toneColorVar}) / 0.4)`,
            `0 var(--space-4) var(--space-8) hsl(var(${toneColorVar}) / 0.25)`,
          ]),
          "--btn-primary-shadow-active": composeShadow([
            `inset 0 var(--spacing-0-5) var(--space-2) hsl(var(${toneColorVar}) / 0.45)`,
            `inset 0 calc(-1 * var(--spacing-0-5)) var(--space-2) hsl(var(${toneColorVar}) / 0.28)`,
            `0 0 0 var(--spacing-0-5) hsl(var(${toneColorVar}) / 0.45)`,
          ]),
        }
      : {};

    resolvedStyle = {
      ...basePrimaryShadows,
      ...tactilePrimary,
      ...(style ?? {}),
    };
  } else if (variant === "secondary") {
    const accentVar = tone === "primary" ? "--ring" : colorVar[tone];
    const baseSecondaryShadows = {
      "--btn-secondary-shadow-rest": neuRaised(),
      "--btn-secondary-shadow-hover": neuRaised(15),
      "--btn-secondary-shadow-active": neuInset(9),
    } as CSSProperties;

    const tactileSecondary = tactile
      ? {
          "--btn-secondary-shadow-rest": composeShadow([
            `inset 0 var(--spacing-0-5) var(--space-2) hsl(var(${accentVar}) / 0.18)`,
            `inset 0 calc(-1 * var(--spacing-0-5)) var(--space-2) hsl(var(--shadow-color) / 0.22)`,
            `0 0 0 var(--spacing-0-25) hsl(var(${accentVar}) / 0.22)`,
          ]),
          "--btn-secondary-shadow-hover": composeShadow([
            `inset 0 var(--spacing-0-5) var(--space-2) hsl(var(${accentVar}) / 0.2)`,
            `inset 0 calc(-1 * var(--spacing-0-5)) var(--space-2) hsl(var(--shadow-color) / 0.26)`,
            `0 0 0 var(--spacing-0-5) hsl(var(${accentVar}) / 0.28)`,
            `0 var(--space-3) var(--space-6) hsl(var(${accentVar}) / 0.22)`,
          ]),
          "--btn-secondary-shadow-active": composeShadow([
            `inset 0 var(--spacing-0-5) var(--space-2) hsl(var(${accentVar}) / 0.28)`,
            `inset 0 calc(-1 * var(--spacing-0-5)) var(--space-2) hsl(var(--shadow-color) / 0.3)`,
            `0 0 0 var(--spacing-0-5) hsl(var(${accentVar}) / 0.32)`,
          ]),
        }
      : {};

    resolvedStyle = {
      ...baseSecondaryShadows,
      ...tactileSecondary,
      ...(style ?? {}),
    };
  }

  const mergedClassName = cn(
    base,
    resolvedVariantClass,
    toneClasses[variant][tone],
  );

  const renderInnerContent = (contentChildren: React.ReactNode) => (
    <>
      {variant === "primary" ? (
        <span
          className={cn(
            "absolute inset-0 pointer-events-none rounded-[inherit]",
            `bg-[linear-gradient(90deg,hsl(var(${toneColorVar})/.18),hsl(var(${toneColorVar})/.18))]`,
          )}
        />
      ) : (
        overlay
      )}
      {loading ? (
        <span className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <Spinner size={spinnerSize} tone={tone} />
        </span>
      ) : null}
      <span className={contentClasses}>{contentChildren}</span>
    </>
  );

  if (asChild) {
    const slotProps = {
      ...(props as ButtonAsChildProps),
    } as Record<string, unknown> & {
      tabIndex?: number;
      type?: HTMLMotionProps<"button">["type"];
    };
    const tabIndex = slotProps.tabIndex;
    delete slotProps.tabIndex;
    delete slotProps.asChild;
    delete slotProps.size;
    delete slotProps.variant;
    delete slotProps.tone;
    delete slotProps.loading;
    delete slotProps.tactile;
    delete slotProps.className;
    delete slotProps.children;
    delete slotProps.style;
    delete slotProps.disabled;
    const baseProps = {
      className: mergedClassName,
      "data-loading": loading ? "true" : undefined,
      "data-disabled": isDisabled ? "true" : undefined,
      "data-tactile": tactile ? "true" : undefined,
      "aria-busy": loading ? true : undefined,
      style: resolvedStyle,
      whileHover: hoverAnimation,
      whileTap: reduceMotion ? undefined : whileTap,
      tabIndex: tabIndex ?? (isDisabled ? -1 : undefined),
      ...slotProps,
    };
    const childCount = React.Children.count(children);

    if (childCount !== 1 || !React.isValidElement(children)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "[Button] `asChild` requires a single valid React element child.",
        );
      }

      return null;
    }
    const child = React.Children.only(
      children,
    ) as React.ReactElement<{ children?: React.ReactNode }>;

    return (
      <MotionSlot
        {...baseProps}
        ref={ref as React.ForwardedRef<HTMLElement>}
        aria-disabled={isDisabled ? true : undefined}
      >
        {React.cloneElement(
          child,
          undefined,
          renderInnerContent(child.props.children),
        )}
      </MotionSlot>
    );
  }

  if (isLink) {
    const anchorProps = {
      ...(props as ButtonAsAnchorProps),
    } as Record<string, unknown> & {
      href: ButtonAsAnchorProps["href"];
      target?: ButtonAsAnchorProps["target"];
      rel?: ButtonAsAnchorProps["rel"];
      download?: ButtonAsAnchorProps["download"];
      tabIndex?: number;
    };
    const href = anchorProps.href as ButtonAsAnchorProps["href"];
    const target = anchorProps.target as ButtonAsAnchorProps["target"];
    const rel = anchorProps.rel as ButtonAsAnchorProps["rel"];
    const download = anchorProps.download as ButtonAsAnchorProps["download"];
    const tabIndex = anchorProps.tabIndex;
    delete anchorProps.href;
    delete anchorProps.target;
    delete anchorProps.rel;
    delete anchorProps.download;
    delete anchorProps.tabIndex;
    delete anchorProps.asChild;
    delete anchorProps.size;
    delete anchorProps.variant;
    delete anchorProps.tone;
    delete anchorProps.loading;
    delete anchorProps.tactile;
    delete anchorProps.className;
    delete anchorProps.children;
    delete anchorProps.style;
    const baseProps = {
      className: mergedClassName,
      "data-loading": loading ? "true" : undefined,
      "data-disabled": isDisabled ? "true" : undefined,
      "data-tactile": tactile ? "true" : undefined,
      "aria-busy": loading ? true : undefined,
      style: resolvedStyle,
      whileHover: hoverAnimation,
      whileTap: reduceMotion ? undefined : whileTap,
      tabIndex: tabIndex ?? (isDisabled ? -1 : undefined),
      ...anchorProps,
    };
    let resolvedHref = href;

    const resolvedRel =
      target === "_blank" && typeof rel === "undefined"
        ? "noopener noreferrer"
        : rel;

    if (typeof href === "string") {
      const trimmedHref = href.trim();
      const hasScheme = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmedHref);
      const isProtocolRelative = trimmedHref.startsWith("//");
      const isHash = trimmedHref.startsWith("#");
      const shouldPrefixBasePath =
        !isHash &&
        (trimmedHref.startsWith("/") || (!hasScheme && !isProtocolRelative));

      resolvedHref = shouldPrefixBasePath
        ? withBasePath(trimmedHref)
        : trimmedHref;
    }

    return (
      <MotionAnchor
        {...baseProps}
        ref={ref as React.ForwardedRef<HTMLAnchorElement>}
        href={resolvedHref}
        target={target}
        rel={resolvedRel}
        download={download}
        aria-disabled={isDisabled ? true : undefined}
      >
        {renderInnerContent(children as React.ReactNode)}
      </MotionAnchor>
    );
  }

  const buttonProps = {
    ...(props as ButtonAsButtonProps),
  } as Record<string, unknown> & {
    type?: HTMLMotionProps<"button">["type"];
    tabIndex?: number;
  };
  const typeProp =
    (buttonProps.type as HTMLMotionProps<"button">["type"]) ?? "button";
  const tabIndex = buttonProps.tabIndex;
  delete buttonProps.type;
  delete buttonProps.tabIndex;
  delete buttonProps.asChild;
  delete buttonProps.size;
    delete buttonProps.variant;
    delete buttonProps.tone;
    delete buttonProps.loading;
    delete buttonProps.tactile;
    delete buttonProps.className;
    delete buttonProps.children;
  delete buttonProps.style;
  delete buttonProps.disabled;
  const baseProps = {
    className: mergedClassName,
    "data-loading": loading ? "true" : undefined,
    "data-disabled": isDisabled ? "true" : undefined,
    "data-tactile": tactile ? "true" : undefined,
    "aria-busy": loading ? true : undefined,
    style: resolvedStyle,
    whileHover: hoverAnimation,
    whileTap: reduceMotion ? undefined : whileTap,
    tabIndex,
    ...buttonProps,
  };

  return (
    <motion.button
      {...baseProps}
      ref={ref as React.ForwardedRef<HTMLButtonElement>}
      type={typeProp}
      disabled={isDisabled}
    >
      {renderInnerContent(children as React.ReactNode)}
    </motion.button>
  );
});

Button.displayName = "Button";
export default Button;
