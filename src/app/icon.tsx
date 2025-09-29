// Programmatic favicon so the server returns a valid icon.
import { ImageResponse } from "next/og";
import tokens from "../../tokens/tokens.js";
import { resolveTokenColor } from "@/lib/color";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function Icon() {
  return new ImageResponse(
    (
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${size.width} ${size.height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          width="100%"
          height="100%"
          fill={resolveTokenColor(tokens.background)}
        />
        <text
          x="50%"
          y="50%"
          fill={resolveTokenColor(tokens.iconFg)}
          fontSize={tokens.fontBody}
          fontWeight={tokens.fontWeightBold}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          13
        </text>
      </svg>
    ),
    size,
  );
}
