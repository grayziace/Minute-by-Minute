"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/dexie/db";
import { MediaThumb } from "@/components/media/MediaThumb";
import { formatTime, toDateKey } from "@/lib/utils";
import Link from "next/link";

export function VideosPage() {
  const videos = useLiveQuery(async () => {
    return db.mediaAssets
      .filter((m) => m.mimeType.startsWith("video/"))
      .reverse()
      .sortBy("createdAt");
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-lg px-5 pb-32 pt-10">
      <header className="mb-8">
        <h1 className="font-display text-2xl">Videos</h1>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {videos?.map((video) => (
          <Link
            key={video.id}
            href={video.capturedAt ? `/timeline/${toDateKey(video.capturedAt)}` : "/timeline"}
          >
            <MediaThumb asset={video} size="lg" />
            {video.capturedAt && (
              <time className="mt-1 block text-[10px] tabular-nums text-muted">
                {formatTime(video.capturedAt)}
              </time>
            )}
          </Link>
        ))}
      </div>

      {!videos?.length && (
        <p className="py-16 text-center font-serif italic text-muted">
          No videos yet.
        </p>
      )}
    </main>
  );
}
