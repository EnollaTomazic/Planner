import { cn } from "@/lib/utils";

export {
  Card,
  CardBody,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./primitives/Card";
export type { CardDepth, CardProps } from "./primitives/Card";

export const cardSurfaceClassName = cn(
  "relative overflow-hidden",
  "card-neo-soft border border-card-hairline",
  "[box-shadow:var(--depth-shadow-soft)]",
  "[--neo-card-overlay-inset:0px] [--neo-card-overlay-opacity:var(--surface-overlay-strong,0.2)]",
);
