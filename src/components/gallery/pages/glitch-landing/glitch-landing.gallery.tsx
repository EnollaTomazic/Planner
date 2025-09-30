import * as React from "react";

import {
  createGalleryPreview,
  defineGallerySection,
} from "@/components/gallery/registry";

import GlitchLandingPage from "./GlitchLandingPage";

const PREVIEW_ID = "homepage:glitch-landing" as const;

export default defineGallerySection({
  id: "homepage",
  entries: [
    {
      id: "glitch-landing",
      name: "Glitch landing",
      description:
        "Token-driven landing shell with glitch overlays, depth-aware stats, and reserved hero space for zero layout shift.",
      kind: "complex",
      tags: ["page", "landing", "glitch"],
      axes: [
        {
          id: "layout",
          label: "Layout",
          type: "variant",
          values: [
            { value: "Navigation" },
            { value: "Hero" },
            { value: "Metrics" },
            { value: "Features" },
            { value: "Footer" },
          ],
        },
      ],
      preview: createGalleryPreview({
        id: PREVIEW_ID,
        render: () => <GlitchLandingPage />,
      }),
    },
  ],
});
