"use client";

import * as React from "react";
import type { CSSProperties } from "react";
import { Slot } from "@radix-ui/react-slot";
import { motion, useReducedMotion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import { cn, withBasePath } from "@/lib/utils";
import Spinner, { type SpinnerTone, type SpinnerSize } from "../feedback/Spinner";
import neumorphicStyles from "../neumorphic.module.css";
import { neuRaised, neuInset } from "./Neu";
import styles from "./Button.module.css";

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
  glitch?: boolean;
};

type ButtonAsButtonProps = ButtonBaseProps &
  Omit<HTMLMotionProps<"button">, "ref" | "style"> & {
    asChild?: false;
    href?: undefined;
  };

type ButtonAsAnchorProps = ButtonBaseProps &
  Omit<AnchorMotionProps, "ref" | "style"> & {
    asChild?: false;
    href: AnchorMotionProps["href"];
  };

type ButtonAsChildProps = ButtonBaseProps &
  Omit<HTMLMotionProps<"button">, "ref" | "style"> & {
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

const primaryShadowVars: Record<Tone, string> = {
  primary:
    "[--glow-active:hsl(var(--primary)/0.35)] [--btn-primary-hover-shadow:0_var(--spacing-0-5)_calc(var(--space-3)/2)_calc(-1*var(--spacing-0-25))_hsl(var(--primary)/0.25)] [--btn-primary-active-shadow:inset_0_0_0_var(--spacing-0-25)_hsl(var(--primary)/0.6)]",
  accent:
    "[--glow-active:hsl(var(--accent)/0.35)] [--btn-primary-hover-shadow:0_var(--spacing-0-5)_calc(var(--space-3)/2)_calc(-1*var(--spacing-0-25))_hsl(var(--accent)/0.25)] [--btn-primary-active-shadow:inset_0_0_0_var(--spacing-0-25)_hsl(var(--accent)/0.6)]",
  info:
    "[--glow-active:hsl(var(--accent-2)/0.35)] [--btn-primary-hover-shadow:0_var(--spacing-0-5)_calc(var(--space-3)/2)_calc(-1*var(--spacing-0-25))_hsl(var(--accent-2)/0.25)] [--btn-primary-active-shadow:inset_0_0_0_var(--spacing-0-25)_hsl(var(--accent-2)/0.6)]",
  danger:
    "[--glow-active:hsl(var(--danger)/0.35)] [--btn-primary-hover-shadow:0_var(--spacing-0-5)_calc(var(--space-3)/2)_calc(-1*var(--spacing-0-25))_hsl(var(--danger)/0.25)] [--btn-primary-active-shadow:inset_0_0_0_var(--spacing-0-25)_hsl(var(--danger)/0.6)]",
};

const toneInteractionTokens: Record<Tone, string> = {
  primary: "[--hover:hsl(var(--primary)/0.14)] [--active:hsl(var(--primary)/0.2)]",
  accent: "[--hover:hsl(var(--accent)/0.14)] [--active:hsl(var(--accent)/0.2)]",
  info: "[--hover:hsl(var(--accent-2)/0.14)] [--active:hsl(var(--accent-2)/0.2)]",
  danger: "[--hover:hsl(var(--danger)/0.14)] [--active:hsl(var(--danger)/0.2)]",
};

const secondarySurfaceTokens: Record<Tone, string> = {
  primary: "[--hover:hsl(var(--primary)/0.25)] [--active:hsl(var(--primary)/0.35)]",
  accent: "[--hover:hsl(var(--accent)/0.25)] [--active:hsl(var(--accent)/0.2)]",
  info: "[--hover:hsl(var(--accent-2)/0.2)] [--active:hsl(var(--accent-2)/0.15)]",
  danger: "[--hover:hsl(var(--danger)/0.14)] [--active:hsl(var(--danger)/0.2)]",
};

const ghostSurfaceTokens: Record<Tone, string> = {
  primary: "[--hover:hsl(var(--background)/0.8)] [--active:hsl(var(--background))]",
  accent: "[--hover:hsl(var(--accent)/0.25)] [--active:hsl(var(--accent)/0.35)]",
  info: "[--hover:hsl(var(--accent-2)/0.25)] [--active:hsl(var(--accent-2)/0.35)]",
  danger: "[--hover:hsl(var(--danger)/0.1)] [--active:hsl(var(--danger)/0.2)]",
};

export const toneClasses: Record<
  NonNullable<ButtonProps["variant"]>,
  Record<Tone, string>
> = {
  primary: {
    primary: cn(toneInteractionTokens.primary, primaryShadowVars.primary),
    accent: cn(toneInteractionTokens.accent, primaryShadowVars.accent),
    info: cn(toneInteractionTokens.info, primaryShadowVars.info),
    danger: cn(toneInteractionTokens.danger, primaryShadowVars.danger),
  },
  secondary: {
    primary: cn(
      secondarySurfaceTokens.primary,
      "text-muted-foreground hover:text-foreground active:text-foreground focus-visible:text-foreground",
      "[--neu-surface:hsl(var(--panel)/0.6)]",
    ),
    accent: cn(
      secondarySurfaceTokens.accent,
      "text-on-accent",
      "[--neu-surface:hsl(var(--accent)/0.3)]",
    ),
    info: cn(
      secondarySurfaceTokens.info,
      "text-on-accent",
      "[--neu-surface:hsl(var(--accent-2)/0.25)]",
    ),
    danger: cn(
      secondarySurfaceTokens.danger,
      "text-[hsl(var(--danger-tint-foreground))]",
      "[--neu-surface:hsl(var(--danger)/0.25)]",
    ),
  },
  ghost: {
    primary: cn(
      ghostSurfaceTokens.primary,
      "text-foreground",
      "[--neu-surface:hsl(var(--card)/0.6)]",
      "border-[hsl(var(--line)/0.35)]",
    ),
    accent: cn(
      ghostSurfaceTokens.accent,
      "text-on-accent",
      "[--neu-surface:hsl(var(--accent)/0.2)]",
      "border-accent/35",
    ),
    info: cn(
      ghostSurfaceTokens.info,
      "text-on-accent",
      "[--neu-surface:hsl(var(--accent-2)/0.2)]",
      "border-accent-2/35",
    ),
    danger: cn(
      ghostSurfaceTokens.danger,
      "text-danger",
      "[--neu-surface:hsl(var(--danger)/0.12)]",
      "border-danger/35",
    ),
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

export const variants: Record<
  NonNullable<ButtonProps["variant"]>,
  VariantConfig
> = {
  primary: ({ tone, tactile }) => ({
    className: cn(
      tactile
        ? "shadow-inner-md hover:shadow-inner-lg active:shadow-inner-lg"
        : "shadow-glow-md hover:shadow-btn-primary-hover active:shadow-btn-primary-active",
      tactile
        ? "active:translate-y-0"
        : "active:translate-y-[var(--spacing-0-25)]",
      tone === "primary"
        ? "[--neu-surface:hsl(var(--primary-soft))]"
        : `[--neu-surface:hsl(var(${colorVar[tone]})/0.12)]`,
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
      "[--neu-surface:hsl(var(--panel)/0.8)]",
      tactile
        ? "shadow-inner-md hover:shadow-inner-lg active:shadow-inner-lg"
        : "shadow-control hover:shadow-control-hover active:shadow-inner-md",
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
    className: "",
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
    glitch = false,
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
    neumorphicStyles.neu,
    styles.root,
    styles.organicControl,
    glitch && "glitch-wrapper",
    glitch && styles.glitch,
    "relative inline-flex items-center justify-center rounded-[var(--control-radius)] border font-medium tracking-[0.02em] transition-all duration-quick ease-out motion-reduce:transition-none hover:bg-[--hover] active:bg-[--active] focus-visible:ring-2 focus-visible:ring-[var(--ring-contrast)] focus-visible:shadow-[var(--shadow-glow-md)] focus-visible:[outline:var(--spacing-0-5)_solid_var(--ring-contrast)] focus-visible:[outline-offset:var(--spacing-0-5)] disabled:opacity-disabled disabled:pointer-events-none data-[loading=true]:opacity-loading",
    "data-[disabled=true]:opacity-disabled data-[disabled=true]:pointer-events-none",
    "[--neu-radius:var(--control-radius)]",
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

  const providedGlitchTextRaw = (props as Record<string, unknown>)["data-text"];
  const providedGlitchText =
    typeof providedGlitchTextRaw === "string" ? providedGlitchTextRaw : undefined;

  const glitchText = glitch
    ? providedGlitchText ??
        (typeof children === "string" ? children : undefined)
    : providedGlitchText;

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
    delete slotProps.glitch;
    delete slotProps.className;
    delete slotProps.children;
    delete slotProps.disabled;
    delete slotProps["data-text"];
    const baseProps = {
      className: mergedClassName,
      "data-loading": loading ? "true" : undefined,
      "data-disabled": isDisabled ? "true" : undefined,
      "data-tactile": tactile ? "true" : undefined,
      "data-glitch": glitch ? "true" : undefined,
      "data-text": glitchText,
      "aria-busy": loading ? true : undefined,
      whileHover: hoverAnimation,
      whileTap: reduceMotion ? undefined : whileTap,
      tabIndex: tabIndex ?? (isDisabled ? -1 : undefined),
      "data-variant": variant,
      "data-tone": tone,
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
    delete anchorProps.glitch;
    delete anchorProps.className;
    delete anchorProps.children;
    delete anchorProps["data-text"];
    const baseProps = {
      className: mergedClassName,
      "data-loading": loading ? "true" : undefined,
      "data-disabled": isDisabled ? "true" : undefined,
      "data-tactile": tactile ? "true" : undefined,
      "data-glitch": glitch ? "true" : undefined,
      "data-text": glitchText,
      "aria-busy": loading ? true : undefined,
      whileHover: hoverAnimation,
      whileTap: reduceMotion ? undefined : whileTap,
      tabIndex: tabIndex ?? (isDisabled ? -1 : undefined),
      "data-variant": variant,
      "data-tone": tone,
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
  delete buttonProps.glitch;
  delete buttonProps.className;
  delete buttonProps.children;
  delete buttonProps["data-text"];
  delete buttonProps.disabled;
  const baseProps = {
    className: mergedClassName,
    "data-loading": loading ? "true" : undefined,
    "data-disabled": isDisabled ? "true" : undefined,
    "data-tactile": tactile ? "true" : undefined,
    "data-glitch": glitch ? "true" : undefined,
    "data-text": glitchText,
    "aria-busy": loading ? true : undefined,
    whileHover: hoverAnimation,
    whileTap: reduceMotion ? undefined : whileTap,
    tabIndex,
    "data-variant": variant,
    "data-tone": tone,
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
