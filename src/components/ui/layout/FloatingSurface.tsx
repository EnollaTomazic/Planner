import * as React from "react";

import { cn } from "@/lib/utils";

import styles from "./RecessedSurface.module.css";

type FloatingSurfaceElement =
  | "div"
  | "main"
  | "section"
  | "article"
  | "aside"
  | "header"
  | "footer"
  | "nav";

type FloatingSurfaceOwnProps<T extends FloatingSurfaceElement = "div"> = {
  as?: T;
  className?: string;
};

export type FloatingSurfaceProps<
  T extends FloatingSurfaceElement = "div",
> = FloatingSurfaceOwnProps<T> &
  Omit<React.ComponentPropsWithoutRef<T>, keyof FloatingSurfaceOwnProps<T>>;

const FloatingSurface = <T extends FloatingSurfaceElement = "div">({
  as,
  className,
  children,
  ...rest
}: FloatingSurfaceProps<T>) => {
  const Component = (as ?? "div") as FloatingSurfaceElement;
  return (
    <Component className={cn(styles.surface, className)} {...rest}>
      {children}
    </Component>
  );
};

FloatingSurface.displayName = "FloatingSurface";

export default FloatingSurface;
