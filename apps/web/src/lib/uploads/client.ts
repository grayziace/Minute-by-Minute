import exifr from "exifr";
import { db } from "@/lib/dexie/db";
import { enqueueSync } from "@/lib/sync/engine";
import { CHUNK_SIZE, generateId, sha256File } from "@/lib/utils";
import type { MediaAsset } from "@/lib/types";

export interface UploadProgress {
  mediaAssetId: string;
  bytesUploaded: number;
  byteSize: number;
  status: string;
}

export async function extractMediaMetadata(file: File) {
  let capturedAt: string | null = null;
  let exifJson: Record<string, unknown> | null = null;
  let gpsJson: Record<string, unknown> | null = null;

  if (file.type.startsWith("image/") || file.type === "image/heic") {
    try {
      const exif = await exifr.parse(file, { gps: true });
      if (exif) {
        exifJson = exif as Record<string, unknown>;
        if (exif.DateTimeOriginal) {
          capturedAt = new Date(exif.DateTimeOriginal).toISOString();
        }
        if (exif.latitude && exif.longitude) {
          gpsJson = {
            lat: exif.latitude,
            lng: exif.longitude,
          };
        }
      }
    } catch {
      // metadata optional
    }
  }

  if (!capturedAt) {
    capturedAt = new Date(file.lastModified).toISOString();
  }

  return { capturedAt, exifJson, gpsJson };
}

export async function queueFileUpload(
  file: File,
  options: { entryId?: string | null; toInbox?: boolean; userId?: string } = {},
): Promise<MediaAsset> {
  const userId = options.userId ?? "local-user";
  const mediaAssetId = generateId();
  const sha256 = await sha256File(file).catch(() => null);
  const { capturedAt, exifJson, gpsJson } = await extractMediaMetadata(file);

  const localBlobKey = `blob-${mediaAssetId}`;
  await db.cachedMedia.add({
    id: localBlobKey,
    mediaAssetId,
    blob: file,
    cachedAt: new Date().toISOString(),
  });

  const asset: MediaAsset = {
    id: mediaAssetId,
    userId,
    entryId: options.entryId ?? null,
    storageKey: "",
    originalFilename: file.name,
    mimeType: file.type || "application/octet-stream",
    byteSize: file.size,
    sha256,
    capturedAt,
    durationMs: null,
    exifJson,
    gpsJson,
    uploadStatus: "pending",
    uploadMultipartId: null,
    visibility: "private",
    localBlobUrl: URL.createObjectURL(file),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.mediaAssets.put(asset);

  if (options.toInbox !== false && !options.entryId) {
    const inboxItem = {
      id: generateId(),
      mediaAssetId,
      suggestedDate: capturedAt,
      suggestedLocation: null,
      suggestedGroupId: null,
      aiMetadataJson: null,
      status: "unprocessed" as const,
      createdAt: new Date().toISOString(),
    };
    await db.inboxItems.put(inboxItem);
    await enqueueSync({
      entityType: "inbox",
      entityId: inboxItem.id,
      operation: "create",
      payload: inboxItem as unknown as Record<string, unknown>,
    });
  }

  await db.uploadQueue.add({
    id: generateId(),
    mediaAssetId,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    byteSize: file.size,
    sha256,
    uploadId: null,
    storageKey: null,
    completedParts: [],
    bytesUploaded: 0,
    status: "pending",
    retryCount: 0,
    entryId: options.entryId ?? null,
    capturedAt,
    exifJson,
    gpsJson,
    localBlobKey,
    createdAt: new Date().toISOString(),
  });

  void processUploadQueue();
  return asset;
}

export async function processUploadQueue(): Promise<void> {
  if (!navigator.onLine) return;

  const pending = await db.uploadQueue
    .where("status")
    .anyOf(["pending", "failed"])
    .toArray();

  for (const item of pending) {
    await uploadQueueItem(item.id);
  }
}

async function uploadQueueItem(queueId: string): Promise<void> {
  const item = await db.uploadQueue.get(queueId);
  if (!item) return;

  const cached = item.localBlobKey
    ? await db.cachedMedia.get(item.localBlobKey)
    : null;
  if (!cached) {
    await db.uploadQueue.update(queueId, { status: "failed" });
    return;
  }

  const file = cached.blob;
  await db.uploadQueue.update(queueId, { status: "uploading" });
  await db.mediaAssets.update(item.mediaAssetId, { uploadStatus: "uploading" });

  try {
    if (!item.uploadId || !item.storageKey) {
      const initRes = await fetch("/api/uploads/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          mediaAssetId: item.mediaAssetId,
          filename: item.fileName,
          mimeType: item.mimeType,
          byteSize: item.byteSize,
          sha256: item.sha256,
          entryId: item.entryId,
          capturedAt: item.capturedAt,
          exifJson: item.exifJson,
          gpsJson: item.gpsJson,
        }),
      });
      if (!initRes.ok) throw new Error("Init failed");
      const initData = await initRes.json();
      await db.uploadQueue.update(queueId, {
        uploadId: initData.uploadId,
        storageKey: initData.storageKey,
      });
      item.uploadId = initData.uploadId;
      item.storageKey = initData.storageKey;
    }

    const totalParts = Math.ceil(file.size / CHUNK_SIZE);
    const completedParts = [...item.completedParts];

    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
      if (completedParts.some((p) => p.partNumber === partNumber)) continue;

      const start = (partNumber - 1) * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const partRes = await fetch("/api/uploads/part-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          storageKey: item.storageKey,
          uploadId: item.uploadId,
          partNumber,
        }),
      });
      if (!partRes.ok) throw new Error("Part URL failed");
      const { url } = await partRes.json();

      const uploadRes = await fetch(url, {
        method: "PUT",
        body: chunk,
      });
      if (!uploadRes.ok) throw new Error("Part upload failed");

      const etag = uploadRes.headers.get("ETag")?.replace(/"/g, "") ?? "";
      completedParts.push({ partNumber, etag });
      const bytesUploaded = Math.min(partNumber * CHUNK_SIZE, file.size);

      await db.uploadQueue.update(queueId, {
        completedParts,
        bytesUploaded,
      });
    }

    const completeRes = await fetch("/api/uploads/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        mediaAssetId: item.mediaAssetId,
        storageKey: item.storageKey,
        uploadId: item.uploadId,
        parts: completedParts,
      }),
    });
    if (!completeRes.ok) throw new Error("Complete failed");

    await db.uploadQueue.update(queueId, { status: "completed" });
    await db.mediaAssets.update(item.mediaAssetId, {
      uploadStatus: "processing",
      storageKey: item.storageKey!,
    });
  } catch {
    await db.uploadQueue.update(queueId, {
      status: "failed",
      retryCount: item.retryCount + 1,
    });
    await db.mediaAssets.update(item.mediaAssetId, { uploadStatus: "failed" });
  }
}

export function initUploadEngine() {
  if (typeof window === "undefined") return;
  window.addEventListener("online", () => void processUploadQueue());
  void processUploadQueue();
}
