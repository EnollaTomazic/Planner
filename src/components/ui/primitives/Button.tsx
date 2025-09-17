"use client";

import * as React from "react";
import type { CSSProperties } from "react";
import { Slot } from "@radix-ui/react-slot";
import { motion, useReducedMotion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import { cn, withBasePath } from "@/lib/utils";
import Spinner from "../feedback/Spinner";
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
} as const;

export type ButtonSize = keyof typeof buttonSizes;

type Tone = "primary" | "accent" | "info" | "danger";

const spinnerSizes: Record<ButtonSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

const MotionSlot = motion.create(Slot);
const MotionAnchor = motion.a;

type AnchorMotionProps = HTMLMotionProps<"a">;

type ButtonBaseProps = {
  size?: ButtonSize;
  variant?: "primary" | "secondary" | "ghost";
  tone?: Tone;
  loading?: boolean;
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
    primary: "text-muted-foreground bg-panel/60",
    accent:
      "text-accent-foreground bg-accent/30 [--hover:hsl(var(--accent)/0.25)] [--active:hsl(var(--accent)/0.2)]",
    info:
      "text-accent-2-foreground bg-accent-2/25 [--hover:hsl(var(--accent-2)/0.2)] [--active:hsl(var(--accent-2)/0.15)]",
    danger:
      "text-danger-foreground bg-danger/15 [--hover:hsl(var(--danger)/0.12)] [--active:hsl(var(--danger)/0.1)]",
  },
  ghost: {
    primary:
      "text-foreground bg-card/60 [--hover:hsl(var(--background)/0.8)] [--active:hsl(var(--background))]",
    accent:
      "text-accent-foreground bg-accent/20 [--hover:theme('colors.interaction.accent.surfaceHover')] [--active:theme('colors.interaction.accent.surfaceActive')]",
    info:
      "text-accent-2-foreground bg-accent-2/20 [--hover:theme('colors.interaction.info.surfaceHover')] [--active:theme('colors.interaction.info.surfaceActive')]",
    danger:
      "text-danger [--hover:theme('colors.interaction.danger.tintHover')] [--active:theme('colors.interaction.danger.tintActive')]",
  },
};

type VariantConfig = {
  className: string | ((tone: Tone) => string);
  whileHover?: HTMLMotionProps<"button">["whileHover"];
  whileTap?: HTMLMotionProps<"button">["whileTap"];
  overlay?: React.ReactNode;
  contentClass?: string;
};

export const variants: Record<
  NonNullable<ButtonProps["variant"]>,
  VariantConfig
> = {
  primary: {
    className: (tone) =>
      cn(
        "shadow-glow-sm hover:shadow-glow-md active:translate-y-px active:shadow-btn-primary-active",
        tone === "primary"
          ? "bg-primary-soft"
          : `bg-[hsl(var(${colorVar[tone]})/0.12)]`,
        `border-[hsl(var(${colorVar[tone]})/0.35)]`,
        `text-[hsl(var(${toneForegroundVar[tone]}))]`,
      ),
    whileTap: {
      scale: 0.97,
    },
    contentClass:
      "relative z-10 inline-flex items-center gap-[var(--space-2)]",
  },
  secondary: {
    className: "bg-panel/80 shadow-neo",
    whileHover: { scale: 1.02, boxShadow: neuRaised(15) },
    whileTap: {
      scale: 0.97,
      boxShadow: neuInset(9) as CSSProperties["boxShadow"],
    },
  },
  ghost: {
    className: "bg-transparent",
    whileTap: { scale: 0.97 },
  },
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
  const spinnerSize = spinnerSizes[size];
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
    className: variantClass,
    whileHover: variantHover,
    whileTap,
    overlay,
    contentClass,
  } = variants[variant];

  const resolvedVariantClass =
    typeof variantClass === "function" ? variantClass(tone) : variantClass;

  const hoverAnimation = reduceMotion
    ? undefined
    : variant === "primary"
      ? { scale: 1.03 }
      : variantHover;

  const contentClasses = cn(
    contentClass ?? cn("inline-flex items-center", s.gap),
    loading && "opacity-0",
  );

  let resolvedStyle = style;

  if (variant === "primary") {
    const glowStyles = {
      "--glow-active": `hsl(var(${toneColorVar}) / 0.35)`,
      "--btn-primary-hover-shadow": `0 2px 6px -1px hsl(var(${toneColorVar}) / 0.25)`,
      "--btn-primary-active-shadow": `inset 0 0 0 1px hsl(var(${toneColorVar}) / 0.6)`,
    } as CSSProperties;
    resolvedStyle = {
      ...glowStyles,
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
          <Spinner size={spinnerSize} />
        </span>
      ) : null}
      <span className={contentClasses}>{contentChildren}</span>
    </>
  );

  if (asChild) {
    const slotProps = {
      ...(props as ButtonAsChildProps),
    } as Record<string, unknown> & { tabIndex?: number };
    const tabIndex = slotProps.tabIndex;
    delete slotProps.tabIndex;
    delete slotProps.asChild;
    delete slotProps.size;
    delete slotProps.variant;
    delete slotProps.tone;
    delete slotProps.loading;
    delete slotProps.className;
    delete slotProps.children;
    delete slotProps.style;
    delete slotProps.type;
    delete slotProps.disabled;
    const baseProps = {
      className: mergedClassName,
      "data-loading": loading ? "true" : undefined,
      "data-disabled": isDisabled ? "true" : undefined,
      "aria-busy": loading ? true : undefined,
      style: resolvedStyle,
      whileHover: hoverAnimation,
      whileTap: reduceMotion ? undefined : whileTap,
      tabIndex: tabIndex ?? (isDisabled ? -1 : undefined),
      ...slotProps,
    };
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
    delete anchorProps.className;
    delete anchorProps.children;
    delete anchorProps.style;
    const baseProps = {
      className: mergedClassName,
      "data-loading": loading ? "true" : undefined,
      "data-disabled": isDisabled ? "true" : undefined,
      "aria-busy": loading ? true : undefined,
      style: resolvedStyle,
      whileHover: hoverAnimation,
      whileTap: reduceMotion ? undefined : whileTap,
      tabIndex: tabIndex ?? (isDisabled ? -1 : undefined),
      ...anchorProps,
    };
    let resolvedHref = href;

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
        rel={rel}
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
  delete buttonProps.className;
  delete buttonProps.children;
  delete buttonProps.style;
  delete buttonProps.disabled;
  const baseProps = {
    className: mergedClassName,
    "data-loading": loading ? "true" : undefined,
    "data-disabled": isDisabled ? "true" : undefined,
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
