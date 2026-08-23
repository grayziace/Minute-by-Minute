export type RecordedAtPrecision = "exact" | "approximate" | "unknown";
export type LocationPrivacy = "hidden" | "approximate" | "exact";
export type Visibility = "private" | "unlisted" | "shared" | "public";
export type ContentSource = "user" | "ai_suggested";
export type SyncStatus = "pending" | "synced" | "failed";
export type UploadStatus =
  | "pending"
  | "uploading"
  | "processing"
  | "ready"
  | "failed";
export type InboxStatus =
  | "unprocessed"
  | "reviewed"
  | "placed"
  | "dismissed";
export type VariantType =
  | "thumbnail"
  | "preview"
  | "poster"
  | "transcoded";
export type PlaceType =
  | "school"
  | "apartment"
  | "hotel"
  | "restaurant"
  | "cafe"
  | "club"
  | "metro"
  | "park"
  | "beach"
  | "city"
  | "neighbourhood"
  | "other";
export type MusicRole = "moment" | "song_of_day";
export type AiJobStatus = "queued" | "running" | "completed" | "failed";
export type AiSuggestionStatus = "pending" | "accepted" | "rejected";
export type EditProjectStatus =
  | "draft"
  | "proposed"
  | "approved"
  | "rendered";
export type ScrapbookScopeType = "day" | "custom_collection";

export interface Entry {
  id: string;
  userId: string;
  recordedAt: string;
  recordedAtPrecision: RecordedAtPrecision;
  text: string | null;
  moodNote: string | null;
  locationName: string | null;
  locationLat: number | null;
  locationLng: number | null;
  locationAccuracy: number | null;
  locationPrivacy: LocationPrivacy;
  visibility: Visibility;
  source: ContentSource;
  syncStatus: SyncStatus;
  clientId: string | null;
  updatedAt: string;
  createdAt: string;
}

export interface MediaAsset {
  id: string;
  userId: string;
  entryId: string | null;
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  byteSize: number;
  sha256: string | null;
  capturedAt: string | null;
  durationMs: number | null;
  exifJson: Record<string, unknown> | null;
  gpsJson: Record<string, unknown> | null;
  uploadStatus: UploadStatus;
  uploadMultipartId: string | null;
  visibility: Visibility;
  localBlobUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InboxItem {
  id: string;
  mediaAssetId: string;
  suggestedDate: string | null;
  suggestedLocation: string | null;
  suggestedGroupId: string | null;
  aiMetadataJson: Record<string, unknown> | null;
  status: InboxStatus;
  createdAt: string;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
}

export interface ScrapbookLayoutItem {
  id: string;
  entryId?: string;
  mediaAssetId?: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  annotation?: string;
}

export interface ScrapbookLayout {
  items: ScrapbookLayoutItem[];
}
