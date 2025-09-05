/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { neuRaised, neuInset } from "./neu";

export const buttonSizes = {
  sm: {
    height: "h-9",
    padding: "px-3",
    text: "text-[12px]",
    gap: "gap-2",
  },
  md: {
    height: "h-12",
    padding: "px-4",
    text: "text-[14px]",
    gap: "gap-2",
  },
  lg: {
    height: "h-14",
    padding: "px-6",
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
  ({ className, size = "md", variant = "secondary", children, ...rest }, ref) => {
    const s = buttonSizes[size];
    const base = cn(
      "relative inline-flex items-center justify-center gap-2 rounded-2xl",
      s.height,
      s.padding,
      s.text,
      "text-[hsl(var(--text))]",
      className
    );

    if (variant === "primary") {
      return (
        <motion.button
          ref={ref}
          className={cn(base, "bg-[hsl(var(--panel)/0.85)]")}
          style={{ boxShadow: neuRaised(12) }}
          whileHover={{ scale: 1.03, boxShadow: neuRaised(16) }}
          whileTap={{ scale: 0.96, boxShadow: neuInset(10) as any }}
          {...rest}
        >
          <span
            className="absolute inset-0 rounded-2xl"
            style={{
              background:
                "linear-gradient(90deg, hsl(275 95% 72% /.18), hsl(195 95% 68% /.18))",
            }}
          />
          <span className="relative z-10 font-semibold">{children as React.ReactNode}</span>
        </motion.button>
      );
    }

    if (variant === "ghost") {
      return (
        <motion.button
          ref={ref}
          className={cn(base, "bg-[hsl(var(--panel)/0.6)]")}
          style={{ boxShadow: neuRaised(10) }}
          whileHover={{ scale: 1.02, boxShadow: neuRaised(14) }}
          whileTap={{ scale: 0.97, boxShadow: neuInset(8) as any }}
          {...rest}
        >
          {children}
        </motion.button>
      );
    }

    return (
      <motion.button
        ref={ref}
        className={cn(base, "bg-[hsl(var(--panel)/0.8)]")}
        style={{ boxShadow: neuRaised(12) }}
        whileHover={{ scale: 1.02, boxShadow: neuRaised(15) }}
        whileTap={{ scale: 0.97, boxShadow: neuInset(9) as any }}
        {...rest}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
export default Button;
