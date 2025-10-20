import { ImageResponse } from "next/og"
import tokens from "../../tokens/tokens.js"
import { resolveTokenColor } from "@/lib/color"

export const PLANNER_ICON_SIZE = { width: 32, height: 32 } as const
export const PLANNER_ICON_CONTENT_TYPE = "image/png" as const

function PlannerIconGlyph({
  background,
  foreground,
}: {
  readonly background: string
  readonly foreground: string
}): JSX.Element {
  return (
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
  )
}

export function createPlannerIconResponse(): ImageResponse {
  const background = resolveTokenColor(tokens.background)
  const foreground = resolveTokenColor(tokens.iconFg)

  return new ImageResponse(
    <PlannerIconGlyph background={background} foreground={foreground} />,
    PLANNER_ICON_SIZE,
  )
}
