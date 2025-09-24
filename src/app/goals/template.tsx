import type { ReactNode } from "react";

interface GoalsTemplateProps {
  children: ReactNode;
}

export default function GoalsTemplate({ children }: GoalsTemplateProps): ReactNode {
  return <>{children}</>;
}
