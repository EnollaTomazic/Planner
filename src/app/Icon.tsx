// Programmatic favicon so the server returns a valid icon.
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        className="flex h-full w-full items-center justify-center bg-[hsl(var(--background))] text-[hsl(var(--icon-fg))]"
        style={{
          fontSize: "var(--font-size-md)",
          fontWeight: "var(--font-weight-bold)",
        }}
      >
        13
      </div>
    ),
    size,
  );
}
