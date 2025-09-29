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
        <path
          d="M11 8h4v16h-4z"
          fill={resolveTokenColor(tokens.iconFg)}
        />
        <path
          d="M18 8h6a4 4 0 0 1 0 8a4 4 0 0 1 0 8h-6v-4h4a2 2 0 0 0 0-4h-4v-4h4a2 2 0 1 0 0-4h-4z"
          fill={resolveTokenColor(tokens.iconFg)}
        />
      </svg>
    ),
    size,
  );
}
