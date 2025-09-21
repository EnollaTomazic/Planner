import * as React from "react";
import SectionLabel from "@/components/reviews/SectionLabel";
import { cn } from "@/lib/utils";
import ReviewSurface, { type ReviewSurfaceProps } from "./ReviewSurface";
import ReviewSliderTrack, {
  type ReviewSliderTone,
  type ReviewSliderVariant,
} from "./ReviewSliderTrack";

const formatDefaultValue = (value: number) => `${value}/10`;

export type ScoreMeterProps = {
  value: number;
  label?: string;
  tone?: ReviewSliderTone;
  variant?: ReviewSliderVariant;
  detail?: React.ReactNode;
  control?: React.ReactNode;
  className?: string;
  surfaceProps?: Omit<ReviewSurfaceProps<"div">, "children">;
  trackProps?: Omit<
    React.ComponentPropsWithoutRef<typeof ReviewSliderTrack>,
    "value" | "tone" | "variant"
  >;
  valueFormatter?: (value: number) => React.ReactNode;
};

const isElementWithProps = (
  node: React.ReactNode,
): node is React.ReactElement<Record<string, unknown>> =>
  React.isValidElement(node);

export default function ScoreMeter({
  value,
  label,
  tone = "score",
  variant = "display",
  detail,
  control,
  className,
  surfaceProps,
  trackProps,
  valueFormatter,
}: ScoreMeterProps) {
  const {
    className: surfaceClassName,
    padding = "inline",
    ...surfaceRest
  } = surfaceProps ?? {};
  const { className: trackClassName, ...trackRest } = trackProps ?? {};
  const formatValue = valueFormatter ?? formatDefaultValue;
  const isInteractive = variant === "input";

  const labelId = React.useId();
  let labelledControl: React.ReactNode = control;

  if (label && isElementWithProps(control)) {
    const existing = control.props["aria-labelledby"];
    const merged = [
      typeof existing === "string" ? existing : undefined,
      labelId,
    ]
      .filter(Boolean)
      .join(" ");

    labelledControl = React.cloneElement(control, {
      "aria-labelledby": merged,
    } as Record<string, unknown>);
  }

  return (
    <div className={className}>
      {label ? <SectionLabel id={labelId}>{label}</SectionLabel> : null}
      <ReviewSurface
        padding={padding}
        {...surfaceRest}
        className={cn(
          "relative h-[var(--space-7)]",
          isInteractive && "group",
          surfaceClassName,
        )}
      >
        {labelledControl}
        <ReviewSliderTrack
          value={value}
          tone={tone}
          variant={variant}
          {...trackRest}
          className={cn(trackClassName)}
        />
      </ReviewSurface>
      <div className="mt-[var(--space-1)] flex items-center gap-[var(--space-2)] text-ui text-muted-foreground">
        <span className="pill h-[var(--space-5)] px-[var(--space-2)] text-ui">
          {formatValue(value)}
        </span>
        {detail}
      </div>
    </div>
  );
}
