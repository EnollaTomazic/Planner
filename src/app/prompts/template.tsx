import type { ReactNode } from "react";

interface PromptsTemplateProps {
  children: ReactNode;
}

export default function PromptsTemplate({ children }: PromptsTemplateProps): ReactNode {
  return <>{children}</>;
}
