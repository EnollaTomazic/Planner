import * as React from "react";
import Image from "next/image";

import { AvatarFrame } from "@/components/ui/primitives/AvatarFrame";
import { withBasePath } from "@/lib/utils";

export interface HeroPortraitFrameProps {
  imageSrc: string;
  imageAlt: string;
  imageSizes?: string;
  priority?: boolean;
  className?: string;
  frame?: boolean;
}

const defaultSizes =
  "(max-width: 640px) 104px, (max-width: 1024px) 136px, 168px";

export function HeroPortraitFrame({
  imageSrc,
  imageAlt,
  imageSizes = defaultSizes,
  priority = false,
  className,
  frame = true,
}: HeroPortraitFrameProps) {
  const resolvedImageSrc = withBasePath(imageSrc);
  return (
    <AvatarFrame
      as="div"
      frame={frame}
      size="lg"
      media={
        <Image
          src={resolvedImageSrc}
          alt={imageAlt}
          sizes={imageSizes}
          priority={priority}
          fill
        />
      }
      className={className}
    />
  );
}
