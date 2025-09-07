"use client";

import * as React from "react";
import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { neuRaised, neuInset } from "./Neu";

export const buttonSizes = {
  sm: {
    height: "h-5",
    padding: "px-3",
    text: "text-[12px]",
    gap: "gap-2",
  },
  md: {
    height: "h-6",
    padding: "px-4",
    text: "text-[14px]",
    gap: "gap-2",
  },
  lg: {
    height: "h-7",
    padding: "px-5",
    text: "text-[16px]",
    gap: "gap-2",
  },
} as const;

export type ButtonSize = keyof typeof buttonSizes;

export type ButtonProps = React.ComponentProps<typeof motion.button> & {
  size?: ButtonSize;
  variant?: "primary" | "secondary" | "ghost";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size = "sm", variant = "secondary", children, ...rest }, ref) => {
    const s = buttonSizes[size];
    const base = cn(
      "relative inline-flex items-center justify-center rounded-2xl border border-[hsl(var(--line)/0.35)] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/.6)]",
      s.height,
      s.padding,
      s.text,
      s.gap,
      "text-[hsl(var(--text))]",
      className
    );

    if (variant === "primary") {
      return (
        <motion.button
          ref={ref}
          className={cn(
            base,
            "bg-[hsl(var(--panel)/0.85)] overflow-hidden",
            "shadow-neo"
          )}
          whileHover={{
            scale: 1.03,
            boxShadow: `${neuRaised(16)},0 0 8px hsl(var(--accent)/.3)` as CSSProperties["boxShadow"],
          }}
          whileTap={{
            scale: 0.96,
            boxShadow: neuInset(10) as CSSProperties["boxShadow"],
          }}
          {...rest}
        >
          <span
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{
              background:
                "linear-gradient(90deg, hsl(var(--accent)/.18), hsl(var(--accent-2)/.18))",
            }}
          />
          <span className="relative z-10 inline-flex items-center gap-2">
            {children as React.ReactNode}
          </span>
        </motion.button>
      );
    }

    if (variant === "ghost") {
      return (
        <motion.button
          ref={ref}
          className={cn(
            base,
            "bg-transparent hover:bg-[hsl(var(--panel)/0.45)]"
          )}
          whileTap={{ scale: 0.97 }}
          {...rest}
        >
          {children}
        </motion.button>
      );
    }

    return (
      <motion.button
        ref={ref}
        className={cn(base, "bg-[hsl(var(--panel)/0.8)]", "shadow-neo")}
        whileHover={{ scale: 1.02, boxShadow: neuRaised(15) }}
        whileTap={{
          scale: 0.97,
          boxShadow: neuInset(9) as CSSProperties["boxShadow"],
        }}
        {...rest}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
export default Button;
