import * as React from "react";
import Image from "next/image";

import { AvatarFrame } from "@/components/ui/primitives/AvatarFrame";
import { cn, withBasePath } from "@/lib/utils";

import { PortraitFrame } from "./PortraitFrame";
import styles from "./HomeSplashIllustration.module.css";

export interface HomeSplashIllustrationProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const ICON_SRC = withBasePath("/planner-logo.svg");

export function HomeSplashIllustration({ className, ...rest }: HomeSplashIllustrationProps) {
  return (
    <div className={cn(styles.root, className)} {...rest}>
      <span aria-hidden className={styles.backdrop} />
      <PortraitFrame
        pose="angel-leading"
        transparentBackground
        className={cn(styles.portrait, styles.angel)}
      />
      <AvatarFrame
        frame
        size="md"
        className={styles.iconFrame}
        innerClassName={styles.iconInner}
        rimClassName={styles.iconRim}
        glowClassName={styles.iconGlow}
        media={
          <Image
            src={ICON_SRC}
            alt=""
            fill
            priority
            sizes="(max-width: 640px) 120px, 136px"
          />
        }
      />
      <PortraitFrame
        pose="demon-leading"
        transparentBackground
        className={cn(styles.portrait, styles.demon)}
      />
    </div>
  );
}
