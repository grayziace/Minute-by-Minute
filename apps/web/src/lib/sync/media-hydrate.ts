"use client";

import { db } from "@/lib/dexie/db";
import type { MediaAsset } from "@/lib/types";

export interface MediaHydrateProgress {
  done: number;
  total: number;
  currentId: string | null;
}

function needsDownload(asset: MediaAsset): boolean {
  if (asset.localBlobUrl) return false;
  if (!asset.storageKey) return false;
  return asset.uploadStatus === "ready" || asset.uploadStatus === "processing";
}

export async function countMissingMediaBlobs(): Promise<number> {
  const assets = await db.mediaAssets.toArray();
  return assets.filter(needsDownload).length;
}

export async function hydrateMissingMediaBlobs(
  onProgress?: (progress: MediaHydrateProgress) => void,
): Promise<number> {
  if (!navigator.onLine) return 0;

  const assets = await db.mediaAssets.toArray();
  const missing = assets.filter(needsDownload);
  let hydrated = 0;

  for (let i = 0; i < missing.length; i++) {
    const asset = missing[i];
    onProgress?.({ done: i, total: missing.length, currentId: asset.id });

    try {
      const res = await fetch(
        `/api/uploads/download?mediaAssetId=${encodeURIComponent(asset.id)}`,
        { credentials: "include" },
      );
      if (!res.ok) continue;

      const { url, mimeType } = await res.json();
      const blobRes = await fetch(url);
      if (!blobRes.ok) continue;

      const blob = await blobRes.blob();
      const typedBlob =
        !blob.type && mimeType ? new Blob([blob], { type: mimeType }) : blob;

      const localBlobKey = `blob-${asset.id}`;
      await db.cachedMedia.put({
        id: localBlobKey,
        mediaAssetId: asset.id,
        blob: typedBlob,
        cachedAt: new Date().toISOString(),
      });

      await db.mediaAssets.update(asset.id, {
        localBlobUrl: URL.createObjectURL(typedBlob),
      });
      hydrated++;
    } catch {
      /* skip failed asset */
    }
  }

  if (hydrated > 0) {
    await db.syncMeta.put({
      key: "lastMediaHydratedAt",
      value: new Date().toISOString(),
    });
  }

  onProgress?.({ done: missing.length, total: missing.length, currentId: null });
  return hydrated;
}
