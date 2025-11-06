import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

export interface NoxiHeroImageProps {
  className?: string;
}

function NoxiHeroImage({ className }: NoxiHeroImageProps) {
  return (
    <Image
      src="/images/noxi-3d.svg"
      alt="Noxi emerging from a neon glitch portal."
      fill
      priority={false}
      sizes="(min-width: 1280px) 32vw, (min-width: 768px) 48vw, 100vw"
      className={cn("object-contain object-center", className)}
    />
  );
}

export { NoxiHeroImage };
