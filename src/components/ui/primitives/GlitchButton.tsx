import * as React from "react";

import Button, { type ButtonProps } from "./Button";
import type { GlitchOverlayToken } from "./BlobContainer";

export type GlitchButtonProps = Omit<ButtonProps, "glitch" | "glitchIntensity"> & {
  glitchIntensity?: GlitchOverlayToken;
};

const GlitchButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  GlitchButtonProps
>(({ glitchIntensity = "glitch-overlay-button-opacity", ...rest }, ref) => {
  return (
    <Button
      {...(rest as ButtonProps)}
      ref={ref}
      glitch
      glitchIntensity={glitchIntensity}
    />
  );
});

GlitchButton.displayName = "GlitchButton";

export default GlitchButton;
