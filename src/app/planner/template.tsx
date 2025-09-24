import type { ReactNode } from "react";

interface PlannerTemplateProps {
  children: ReactNode;
}

export default function PlannerTemplate({ children }: PlannerTemplateProps): ReactNode {
  return <>{children}</>;
}
