// Programmatic favicon so the server returns a valid icon.
import { ImageResponse } from "next/og";
import tokens from "../../tokens/tokens.js";
import { resolveTokenColor } from "@/lib/color";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function Icon() {
  const background = resolveTokenColor(tokens.background);
  const foreground = resolveTokenColor(tokens.iconFg);

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          backgroundColor: background,
          color: foreground,
          display: "flex",
          fontSize: tokens.fontBody,
          fontWeight: Number(tokens.fontWeightBold),
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        13
      </div>
    ),
    size,
  );
}
