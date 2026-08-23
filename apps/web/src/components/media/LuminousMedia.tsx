"use client";

import type { MediaAsset } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { FragmentLayout } from "@/components/now/NowFragment";

interface LuminousMediaProps {
  asset: MediaAsset;
  scale: FragmentLayout["scale"];
  bleed?: FragmentLayout["bleed"];
  onOpen: () => void;
}

export function LuminousMedia({ asset, scale, bleed, onOpen }: LuminousMediaProps) {
  const src = asset.localBlobUrl;
  const isVideo = asset.mimeType.startsWith("video/");

  const mediaEl =
    isVideo && src ? (
      <video src={src} className="luminous-media__img" muted playsInline />
    ) : src ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={asset.originalFilename} className="luminous-media__img memory-resolve" />
    ) : (
      <div className="luminous-media__placeholder" />
    );

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "luminous-media group block w-full text-left",
        `luminous-media--${scale}`,
        bleed && `luminous-media--bleed-${bleed}`,
      )}
    >
      <div className="luminous-media__frame">
        {mediaEl}
        {isVideo && <span className="luminous-media__play">▶</span>}
      </div>
      {src && !isVideo && (
        <div className="luminous-media__reflection" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="luminous-media__reflection-img" />
        </div>
      )}
    </button>
  );
}
