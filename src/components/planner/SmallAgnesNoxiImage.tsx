import * as React from "react";
import Image from "next/image";

import { cn, withBasePath } from "@/lib/utils";

export interface SmallAgnesNoxiImageProps {
  className?: string;
}

function SmallAgnesNoxiImage({ className }: SmallAgnesNoxiImageProps) {
  return (
    <Image
      src={withBasePath("/portraits/agnes-noxi-duo.svg")}
      alt="Agnes and Noxi calibrating the sprint focus dial."
      fill
      sizes="(min-width: 1280px) 32vw, (min-width: 768px) 48vw, 100vw"
      priority={false}
      className={cn("object-contain object-center", className)}
    />
  );
}

export { SmallAgnesNoxiImage };
