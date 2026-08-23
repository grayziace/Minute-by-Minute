"use client";

import { useState } from "react";
import type { MediaAsset } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MediaViewer } from "@/components/media/MediaViewer";

interface MediaThumbProps {
  asset: MediaAsset;
  size?: "sm" | "md" | "lg" | "hero";
  variant?: "default" | "polaroid" | "float" | "edge";
}

export function MediaThumb({
  asset,
  size = "md",
  variant = "default",
}: MediaThumbProps) {
  const [viewing, setViewing] = useState(false);
  const src = asset.localBlobUrl;

  const sizeClass =
    size === "sm"
      ? "h-20 w-[4.5rem]"
      : size === "hero"
        ? "h-[55vh] w-full min-h-[240px]"
        : size === "lg"
          ? "h-52 w-full"
          : "h-28 w-28";

  const frameClass = cn(
    sizeClass,
    "overflow-hidden transition-transform duration-500",
    variant === "polaroid" && "polaroid !h-auto !w-[5.5rem] !pb-6",
    variant === "float" &&
      "rounded-sm shadow-[0_8px_32px_rgba(140,170,220,0.2)] ring-1 ring-white/60",
    variant === "edge" && "rounded-none shadow-[0_12px_48px_rgba(100,140,200,0.15)]",
    variant === "default" && "glass",
  );

  const inner = asset.mimeType.startsWith("video/") ? (
    <div className="relative h-full w-full">
      {src ? (
        <video src={src} className="h-full w-full object-cover" muted playsInline />
      ) : (
        <div className="flex h-full items-center justify-center bg-background-deep text-[10px] text-muted">
          Video
        </div>
      )}
      <span className="absolute bottom-2 right-2 rounded-full glass px-2 py-0.5 text-[9px] uppercase tracking-wider">
        ▶
      </span>
    </div>
  ) : asset.mimeType.startsWith("audio/") ? (
    <div className="flex h-full items-center justify-center bg-background-deep font-hand text-sm text-muted">
      ♪
    </div>
  ) : src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={asset.originalFilename}
      className="memory-resolve h-full w-full object-cover"
    />
  ) : (
    <div className="flex h-full items-center justify-center text-[10px] text-muted">
      Photo
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setViewing(true)}
        className={cn(frameClass, "block cursor-pointer")}
      >
        {inner}
      </button>
      {viewing && (
        <MediaViewer asset={asset} onClose={() => setViewing(false)} />
      )}
    </>
  );
}
