import Dexie, { type EntityTable } from "dexie";
import type {
  Entry,
  MediaAsset,
  InboxItem,
  Tag,
  ScrapbookLayout,
  SyncStatus,
} from "@/lib/types";

export interface DraftEntry {
  id: string;
  text: string;
  recordedAt: string;
  locationName: string | null;
  updatedAt: string;
}

export interface SyncQueueItem {
  id: string;
  entityType: "entry" | "media" | "tag" | "inbox";
  entityId: string;
  operation: "create" | "update" | "delete";
  payload: Record<string, unknown>;
  retryCount: number;
  createdAt: string;
}

export interface UploadQueueItem {
  id: string;
  mediaAssetId: string;
  fileName: string;
  mimeType: string;
  byteSize: number;
  sha256: string | null;
  uploadId: string | null;
  storageKey: string | null;
  completedParts: { partNumber: number; etag: string }[];
  bytesUploaded: number;
  status: "pending" | "uploading" | "completed" | "failed";
  retryCount: number;
  entryId: string | null;
  capturedAt: string | null;
  exifJson: Record<string, unknown> | null;
  gpsJson: Record<string, unknown> | null;
  localBlobKey: string | null;
  createdAt: string;
}

export interface CachedMedia {
  id: string;
  mediaAssetId: string;
  blob: Blob;
  cachedAt: string;
}

export interface SyncMeta {
  key: string;
  value: string;
}

class MinuteByMinuteDB extends Dexie {
  entries!: EntityTable<Entry, "id">;
  mediaAssets!: EntityTable<MediaAsset, "id">;
  inboxItems!: EntityTable<InboxItem, "id">;
  tags!: EntityTable<Tag, "id">;
  drafts!: EntityTable<DraftEntry, "id">;
  syncQueue!: EntityTable<SyncQueueItem, "id">;
  uploadQueue!: EntityTable<UploadQueueItem, "id">;
  cachedMedia!: EntityTable<CachedMedia, "id">;
  scrapbookLayouts!: EntityTable<
    { id: string; scopeType: string; scopeId: string; layoutJson: ScrapbookLayout; updatedAt: string },
    "id"
  >;
  syncMeta!: EntityTable<SyncMeta, "key">;

  constructor() {
    super("minute-by-minute");
    this.version(1).stores({
      entries: "id, userId, recordedAt, syncStatus, updatedAt",
      mediaAssets: "id, userId, entryId, uploadStatus, capturedAt, sha256, createdAt",
      inboxItems: "id, mediaAssetId, status, suggestedDate",
      tags: "id, userId, name",
      drafts: "id, updatedAt",
      syncQueue: "id, entityType, entityId, createdAt",
      uploadQueue: "id, mediaAssetId, status, createdAt",
      cachedMedia: "id, mediaAssetId, cachedAt",
      scrapbookLayouts: "id, scopeType, scopeId",
      syncMeta: "key",
    });
  }
}

export const db = new MinuteByMinuteDB();

export function entryToLocal(entry: Omit<Entry, "syncStatus"> & { syncStatus?: SyncStatus }): Entry {
  return {
    ...entry,
    syncStatus: entry.syncStatus ?? "pending",
  };
}
