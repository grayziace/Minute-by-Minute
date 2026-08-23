"use client";

import { useEffect } from "react";
import type { MediaAsset } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MediaViewerProps {
  asset: MediaAsset;
  onClose: () => void;
}

export function MediaViewer({ asset, onClose }: MediaViewerProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const src = asset.localBlobUrl;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-midnight/90 backdrop-blur-xl"
      onClick={onClose}
      role="dialog"
      aria-modal
    >
      <div
        className="relative max-h-[100dvh] max-w-[100vw] memory-resolve"
        onClick={(e) => e.stopPropagation()}
      >
        {asset.mimeType.startsWith("video/") && src ? (
          <video
            src={src}
            controls
            autoPlay
            playsInline
            className="max-h-[100dvh] max-w-[100vw] object-contain"
          />
        ) : asset.mimeType.startsWith("audio/") && src ? (
          <div className="glass-strong px-12 py-16">
            <audio src={src} controls autoPlay className="w-72" />
          </div>
        ) : src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={asset.originalFilename}
            className="max-h-[100dvh] max-w-[100vw] object-contain"
          />
        ) : null}
      </div>
      <button
        onClick={onClose}
        className={cn(
          "absolute right-4 top-4 z-10 rounded-full glass px-4 py-2",
          "text-xs uppercase tracking-wider text-foreground-soft",
        )}
      >
        Close
      </button>
    </div>
  );
}
