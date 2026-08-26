"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/dexie/db";
import { generateId } from "@/lib/utils";
import type { MediaAsset } from "@/lib/types";

export interface FrameFavourite {
  id: string;
  entryId: string;
  mediaAssetId: string;
  description: string;
  locationName: string;
  recordedAt: string;
  createdAt: string;
}

const LIST_KEY = "frame.favourites";

async function readAll(): Promise<FrameFavourite[]> {
  const row = await db.syncMeta.get(LIST_KEY);
  if (!row?.value) return [];
  try {
    return JSON.parse(row.value) as FrameFavourite[];
  } catch {
    return [];
  }
}

async function writeAll(items: FrameFavourite[]) {
  await db.syncMeta.put({ key: LIST_KEY, value: JSON.stringify(items) });
}

export function useFrameFavourites() {
  const stored = useLiveQuery(() => db.syncMeta.get(LIST_KEY), []);

  const favourites: FrameFavourite[] = stored?.value
    ? (JSON.parse(stored.value) as FrameFavourite[])
    : [];

  const add = async (item: Omit<FrameFavourite, "id" | "createdAt">) => {
    const all = await readAll();
    all.unshift({
      ...item,
      id: generateId(),
      createdAt: new Date().toISOString(),
    });
    await writeAll(all);
  };

  const update = async (id: string, patch: Partial<FrameFavourite>) => {
    const all = await readAll();
    const idx = all.findIndex((f) => f.id === id);
    if (idx < 0) return;
    all[idx] = { ...all[idx], ...patch };
    await writeAll(all);
  };

  const remove = async (id: string) => {
    await writeAll((await readAll()).filter((f) => f.id !== id));
  };

  return { favourites, add, update, remove };
}

export interface FrameFavouriteWithMedia extends FrameFavourite {
  media: MediaAsset | null;
}

export function useFrameGallery(isViewMode: boolean) {
  return useLiveQuery(async () => {
    const row = await db.syncMeta.get(LIST_KEY);
    const favourites: FrameFavourite[] = row?.value
      ? (JSON.parse(row.value) as FrameFavourite[])
      : [];
    const media = await db.mediaAssets.toArray();
    const byId = new Map(media.map((m) => [m.id, m]));

    return favourites
      .map((f) => {
        const asset = byId.get(f.mediaAssetId) ?? null;
        if (!asset?.localBlobUrl) return null;
        if (isViewMode && asset.visibility === "private") return null;
        return { ...f, media: asset } as FrameFavouriteWithMedia;
      })
      .filter(Boolean) as FrameFavouriteWithMedia[];
  }, [isViewMode]);
}
