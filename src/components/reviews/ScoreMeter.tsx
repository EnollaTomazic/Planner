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

  return (
    <div className={className}>
      {label ? <SectionLabel>{label}</SectionLabel> : null}
      <ReviewSurface
        padding={padding}
        {...surfaceRest}
        className={cn("relative h-[var(--space-7)]", surfaceClassName)}
      >
        {control}
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
