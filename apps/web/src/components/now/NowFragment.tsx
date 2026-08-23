"use client";

import { useState } from "react";
import { formatTime } from "@/lib/utils";
import type { Entry, MediaAsset } from "@/lib/types";
import { LuminousMedia } from "@/components/media/LuminousMedia";
import { MediaViewer } from "@/components/media/MediaViewer";
import { cn } from "@/lib/utils";

export interface FragmentLayout {
  top: string;
  left?: string;
  right?: string;
  width: string;
  rotate: number;
  depth: number;
  scale: "micro" | "tiny" | "medium" | "large" | "hero";
  bleed?: "left" | "right" | "both";
}

/** Editorial compositions — extreme scale variation */
export const LUMINOUS_LAYOUTS: FragmentLayout[] = [
  { top: "22%", left: "42%", width: "min(62vw, 780px)", rotate: -0.6, depth: 3, scale: "hero", bleed: "right" },
  { top: "48%", left: "6%", width: "min(18vw, 200px)", rotate: 2.2, depth: 1, scale: "tiny" },
  { top: "38%", left: "72%", width: "min(24vw, 280px)", rotate: -2, depth: 2, scale: "medium" },
  { top: "58%", left: "35%", width: "min(14vw, 160px)", rotate: 0.5, depth: 1, scale: "micro" },
  { top: "32%", left: "8%", width: "min(38vw, 460px)", rotate: 1.2, depth: 2, scale: "large", bleed: "left" },
  { top: "62%", left: "58%", width: "min(28vw, 340px)", rotate: -1.5, depth: 2, scale: "medium" },
  { top: "44%", left: "22%", width: "min(52vw, 640px)", rotate: 0.3, depth: 3, scale: "hero", bleed: "both" },
  { top: "52%", left: "78%", width: "min(12vw, 140px)", rotate: 3, depth: 1, scale: "micro" },
];

interface NowFragmentProps {
  entry: Entry;
  media?: MediaAsset[];
  layout: FragmentLayout;
  index: number;
  mobile?: boolean;
}

export function NowFragment({
  entry,
  media = [],
  layout,
  index,
  mobile,
}: NowFragmentProps) {
  const [viewing, setViewing] = useState<MediaAsset | null>(null);
  const hasMedia = media.length > 0;
  const isTinyText = !hasMedia && (entry.text?.length ?? 0) < 55;
  const isAudio = hasMedia && media[0].mimeType.startsWith("audio/");

  if (mobile) {
    return (
      <article
        className="memory-appear mb-8"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <time className="mb-2 block font-display text-[9px] tabular-nums tracking-[0.25em] text-[#8a9ab8]">
          {formatTime(entry.recordedAt)}
        </time>
        {hasMedia && !isAudio && (
          <LuminousMedia
            asset={media[0]}
            scale={layout.scale}
            bleed={layout.bleed}
            onOpen={() => setViewing(media[0])}
          />
        )}
        {isAudio && (
          <p className="font-hand text-sm text-[#b8a0c0]">♪ voice</p>
        )}
        {entry.text && (
          <p
            className={cn(
              "mt-2",
              isTinyText
                ? "font-hand text-lg text-[#9aa8c0]"
                : "max-w-sm font-serif text-base leading-relaxed text-[#4a5568]",
            )}
          >
            {entry.text}
          </p>
        )}
        {viewing && <MediaViewer asset={viewing} onClose={() => setViewing(null)} />}
      </article>
    );
  }

  return (
    <>
      <article
        className={cn(
          "luminous-fragment memory-appear absolute",
          layout.bleed && `luminous-fragment--bleed-${layout.bleed}`,
        )}
        style={{
          top: layout.top,
          left: layout.left,
          right: layout.right,
          width: layout.width,
          transform: `rotate(${layout.rotate}deg)`,
          zIndex: layout.depth + 10,
          animationDelay: `${index * 0.14}s`,
        }}
        data-depth={layout.depth}
        data-scale={layout.scale}
      >
        <time className="luminous-fragment__time">{formatTime(entry.recordedAt)}</time>

        {hasMedia && !isAudio && (
          <LuminousMedia
            asset={media[0]}
            scale={layout.scale}
            bleed={layout.bleed}
            onOpen={() => setViewing(media[0])}
          />
        )}

        {isAudio && (
          <div className="luminous-fragment__waveform" aria-hidden>
            {Array.from({ length: 24 }).map((_, i) => (
              <span
                key={i}
                style={{ height: `${20 + Math.sin(i * 0.8) * 16}px` }}
              />
            ))}
          </div>
        )}

        {entry.text && !hasMedia && (
          <p
            className={cn(
              "luminous-fragment__text",
              isTinyText && "luminous-fragment__text--whisper",
            )}
          >
            {entry.text}
          </p>
        )}

        {entry.text && hasMedia && (
          <p className="luminous-fragment__caption">{entry.text}</p>
        )}

        {entry.locationName && (
          <p className="luminous-fragment__place">{entry.locationName}</p>
        )}
      </article>
      {viewing && <MediaViewer asset={viewing} onClose={() => setViewing(null)} />}
    </>
  );
}
