import * as React from "react";

export default function HornedGirlIcon(
  props: React.SVGProps<SVGSVGElement>,
) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M9 7V4L7 2" />
      <path d="M15 7V4l2-2" />
      <circle cx={12} cy={9} r={3} />
      <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
    </svg>
  );
}
