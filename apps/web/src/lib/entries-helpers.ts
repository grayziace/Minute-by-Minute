import type { Entry, MediaAsset, Visibility } from "@/lib/types";
import { updateEntryLocal, deleteEntryLocal } from "@/lib/sync/engine";
import { toDateKey } from "@/lib/utils";

export function isEntryVisibleToVisitor(entry: Entry): boolean {
  return entry.visibility === "shared" || entry.visibility === "public";
}

export function filterEntriesForViewer(
  entries: Entry[],
  isViewMode: boolean,
): Entry[] {
  if (!isViewMode) return entries;
  return entries.filter(isEntryVisibleToVisitor);
}

export function filterMediaForViewer(
  media: MediaAsset[],
  isViewMode: boolean,
): MediaAsset[] {
  if (!isViewMode) return media;
  return media.filter((m) => m.visibility !== "private");
}

export async function patchEntry(
  id: string,
  patch: Partial<Pick<Entry, "text" | "locationName" | "moodNote" | "visibility" | "recordedAt">>,
): Promise<void> {
  await updateEntryLocal(id, patch);
}

export async function removeEntry(id: string): Promise<void> {
  await deleteEntryLocal(id);
}

export function groupEntriesByDay(entries: Entry[]): Map<string, Entry[]> {
  const map = new Map<string, Entry[]>();
  for (const e of entries) {
    const k = toDateKey(e.recordedAt);
    const list = map.get(k) ?? [];
    list.push(e);
    map.set(k, list);
  }
  for (const [, list] of map) {
    list.sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
  }
  return map;
}

export function momentKind(entry: Entry, media?: MediaAsset[]): string {
  if (media?.some((m) => m.mimeType.startsWith("video/"))) return "video";
  if (media?.some((m) => m.mimeType.startsWith("image/"))) return "photo";
  if (media?.some((m) => m.mimeType.startsWith("audio/"))) return "voice";
  if (entry.locationName && !entry.text) return "location";
  if (entry.text && entry.text.length < 80) return "thought";
  return "writing";
}

export const VISIBILITY_LABELS: Record<Visibility, string> = {
  private: "Private",
  shared: "Shared",
  unlisted: "Hidden",
  public: "Public",
};
