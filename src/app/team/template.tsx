import type { ReactNode } from "react";

interface TeamTemplateProps {
  children: ReactNode;
}

export default function TeamTemplate({ children }: TeamTemplateProps): ReactNode {
  return <>{children}</>;
}
