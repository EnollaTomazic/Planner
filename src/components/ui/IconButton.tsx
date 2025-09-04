import * as React from "react";
import { cn } from "@/lib/utils";

export type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Hit area size: sm=28px, md=36px, lg=44px */
  size?: "sm" | "md" | "lg";
  /** Visual variant */
  variant?: "ghost" | "destructive";
  /** For toggle buttons */
  pressed?: boolean;
};

const sizeMap: Record<NonNullable<IconButtonProps["size"]>, string> = {
  sm: "h-7 w-7 [&>svg]:h-[18px] [&>svg]:w-[18px]",
  md: "h-9 w-9 [&>svg]:h-5 [&>svg]:w-5",
  lg: "h-11 w-11 [&>svg]:h-6 [&>svg]:w-6",
};

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { size = "md", variant = "ghost", pressed, disabled, className, children, ...props },
    ref
  ) => {
    const styleVars: React.CSSProperties = {
      "--btn-color": `hsl(var(${variant === "destructive" ? "--danger" : "--accent"}))`,
      "--btn-glow": `hsl(var(${variant === "destructive" ? "--danger" : "--glow"}))`,
    } as React.CSSProperties;

    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={pressed}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-transparent",
          "ring-1 ring-[hsl(var(--ring-muted))] text-[hsl(var(--muted))]",
          "transition-[color,box-shadow,transform] duration-150",
          "focus-visible:outline-none",
          "disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none",
          "hover:text-[var(--btn-color)] hover:ring-[var(--btn-color)]",
          "focus-visible:text-[var(--btn-color)] focus-visible:ring-[var(--btn-color)]",
          "aria-pressed:text-[var(--btn-color)] aria-pressed:ring-[var(--btn-color)]",
          "hover:shadow-[0_0_0_1px_var(--btn-color),0_0_8px_var(--btn-glow)]",
          "focus-visible:shadow-[0_0_0_1px_var(--btn-color),0_0_8px_var(--btn-glow)]",
          "aria-pressed:shadow-[0_0_0_1px_var(--btn-color),0_0_8px_var(--btn-glow)]",
          "active:shadow-[0_0_0_1px_var(--btn-color),0_0_10px_var(--btn-glow)] active:scale-[0.98]",
          "motion-reduce:active:scale-100",
          "motion-reduce:hover:shadow-[0_0_0_1px_var(--btn-color),0_0_4px_var(--btn-glow)]",
          "motion-reduce:focus-visible:shadow-[0_0_0_1px_var(--btn-color),0_0_4px_var(--btn-glow)]",
          "motion-reduce:active:shadow-[0_0_0_1px_var(--btn-color),0_0_5px_var(--btn-glow)]",
          sizeMap[size],
          className
        )}
        style={styleVars}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

export default IconButton;

