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
      <div
        style={{
          alignItems: "center",
          backgroundColor: resolveTokenColor(tokens.background),
          color: resolveTokenColor(tokens.iconFg),
          display: "flex",
          fontSize: tokens.fontBody,
          fontWeight: tokens.fontWeightBold,
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
