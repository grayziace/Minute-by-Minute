"use client";

import { useState } from "react";
import { formatTime, hashIndex, cn } from "@/lib/utils";
import type { Entry, MediaAsset } from "@/lib/types";
import { MediaThumb } from "@/components/media/MediaThumb";
import { MediaViewer } from "@/components/media/MediaViewer";

interface EntryCardProps {
  entry: Entry;
  media?: MediaAsset[];
  compact?: boolean;
  cinematic?: boolean;
  index?: number;
}

export function EntryCard({
  entry,
  media = [],
  compact,
  cinematic,
  index = 0,
}: EntryCardProps) {
  const [viewing, setViewing] = useState<MediaAsset | null>(null);
  const hasMedia = media.length > 0;
  const hasText = !!entry.text?.trim();
  const isLarge =
    cinematic && hasMedia && !compact && hashIndex(entry.id, 3) === 0;
  const isTinyText =
    cinematic && hasText && !hasMedia && (entry.text?.length ?? 0) < 40;

  if (cinematic && !compact) {
    return (
      <>
        <article
          className={cn(
            "memory-appear py-6",
            isLarge && "py-8",
            isTinyText && "py-3",
          )}
          style={{ animationDelay: `${index * 0.08}s` }}
        >
          <time
            dateTime={entry.recordedAt}
            className="mb-3 block font-display text-sm tabular-nums tracking-wider text-muted"
          >
            {formatTime(entry.recordedAt)}
          </time>

          {hasMedia && (
            <div
              className={cn(
                "mb-3",
                isLarge ? "-mx-5" : "max-w-[85%]",
                hashIndex(entry.id, 2) === 1 && "ml-auto",
              )}
            >
              {media.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setViewing(m)}
                  className="block w-full text-left"
                >
                  <MediaThumb
                    asset={m}
                    size={isLarge ? "hero" : "lg"}
                    variant={isLarge ? "edge" : "float"}
                  />
                </button>
              ))}
            </div>
          )}

          {entry.text && (
            <p
              className={cn(
                "leading-relaxed text-foreground",
                isTinyText
                  ? "font-serif text-sm italic text-muted"
                  : "max-w-prose font-serif text-lg",
              )}
            >
              {entry.text}
            </p>
          )}

          {entry.moodNote && (
            <p className="mt-2 font-hand text-base text-blush-deep">{entry.moodNote}</p>
          )}

          {entry.locationName && (
            <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-ice-deep">
              {entry.locationName}
            </p>
          )}
        </article>
        {viewing && (
          <MediaViewer asset={viewing} onClose={() => setViewing(null)} />
        )}
      </>
    );
  }

  return (
    <>
      <article
        className={cn(
          compact ? "flex gap-4 py-2.5" : "py-5",
          !compact && "border-b border-white/40 last:border-0",
        )}
      >
        <time
          dateTime={entry.recordedAt}
          className="shrink-0 w-12 font-display text-xs tabular-nums tracking-wide text-muted"
        >
          {formatTime(entry.recordedAt)}
        </time>
        <div className="min-w-0 flex-1 space-y-2">
          {entry.text && (
            <p
              className={cn(
                compact
                  ? "text-sm text-foreground-soft"
                  : "font-serif text-base leading-relaxed",
              )}
            >
              {entry.text}
            </p>
          )}
          {entry.moodNote && (
            <p className="font-hand text-sm text-blush-deep">{entry.moodNote}</p>
          )}
          {entry.locationName && (
            <p className="text-[10px] uppercase tracking-[0.15em] text-ice-deep">
              {entry.locationName}
            </p>
          )}
          {media.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {media.map((m) => (
                <button key={m.id} type="button" onClick={() => setViewing(m)}>
                  <MediaThumb asset={m} variant="float" />
                </button>
              ))}
            </div>
          )}
        </div>
      </article>
      {viewing && <MediaViewer asset={viewing} onClose={() => setViewing(null)} />}
    </>
  );
}
