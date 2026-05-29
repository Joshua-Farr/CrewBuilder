"use client";

import Image, { type ImageProps } from "next/image";
import * as React from "react";
import type { TcgCard } from "@/lib/types";
import { getCardImageUrl } from "@/lib/utils";

type CardImageProps = Omit<ImageProps, "src" | "alt"> & {
  card: Pick<TcgCard, "imageUrl" | "imageUrlFallback" | "code">;
  alt: string;
};

export function CardImage({ card, alt, onError, ...props }: CardImageProps) {
  const primary = getCardImageUrl(card);
  const fallback = card.imageUrlFallback ?? "/card-back.svg";
  const [src, setSrc] = React.useState(primary);

  React.useEffect(() => {
    setSrc(primary);
  }, [primary]);

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      onError={(event) => {
        if (src !== fallback) setSrc(fallback);
        onError?.(event);
      }}
    />
  );
}
