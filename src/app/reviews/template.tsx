import type { ReactNode } from "react";

interface ReviewsTemplateProps {
  children: ReactNode;
}

export default function ReviewsTemplate({ children }: ReviewsTemplateProps): ReactNode {
  return <>{children}</>;
}
