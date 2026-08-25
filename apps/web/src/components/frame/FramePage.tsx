"use client";

import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { db } from "@/lib/dexie/db";
import { StorybookShell } from "@/components/storybook/StorybookShell";
import { formatTime } from "@/lib/utils";
import { useExperienceMode } from "@/lib/experience/mode";

export function FramePage() {
  const { isViewMode } = useExperienceMode();

  const favourites = useLiveQuery(async () => {
    const all = await db.mediaAssets
      .filter((m) => !!m.localBlobUrl && m.mimeType.startsWith("image/"))
      .reverse()
      .sortBy("createdAt");
    if (isViewMode) return all.filter((m) => m.visibility !== "private");
    return all;
  }, [isViewMode]);

  return (
    <StorybookShell>
      <div className="frame-spread memory-appear">
        <header className="mb-8">
          <h1 className="spread-title">Frame</h1>
          <p className="spread-subtitle">Your favourite photographs — curated over time.</p>
        </header>
        <div className="frame-mosaic">
          {favourites?.map((asset, i) => (
            <div
              key={asset.id}
              className="frame-mosaic__item polaroid"
              style={{ transform: `rotate(${(i % 7 - 3) * 2.5}deg)` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.localBlobUrl!}
                alt={asset.originalFilename}
                className="w-full object-cover"
              />
              {asset.capturedAt && (
                <p className="mt-2 text-center text-xs text-[var(--ink-muted)]">
                  {formatTime(asset.capturedAt)}
                </p>
              )}
            </div>
          ))}
        </div>
        {!favourites?.length && (
          <p className="text-xl text-center text-[var(--ink-muted)] py-16">
            Your gallery is waiting for its first favourite.
          </p>
        )}
        <Link href="/" className="storybook-widget__link mt-8 inline-block">← back to now</Link>
      </div>
    </StorybookShell>
  );
}
