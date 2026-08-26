"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/dexie/db";
import { generateId } from "@/lib/utils";
import type { MediaAsset } from "@/lib/types";

export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  traits: string;
  notes: string;
  photoMediaIds: string[];
  createdAt: string;
  updatedAt: string;
}

const LIST_KEY = "characters.list";

async function readAll(): Promise<Character[]> {
  const row = await db.syncMeta.get(LIST_KEY);
  if (!row?.value) return [];
  try {
    const parsed = JSON.parse(row.value) as Character[];
    return parsed.map((c) => ({ ...c, photoMediaIds: c.photoMediaIds ?? [] }));
  } catch {
    return [];
  }
}

async function writeAll(chars: Character[]) {
  await db.syncMeta.put({ key: LIST_KEY, value: JSON.stringify(chars) });
}

export function useCharacters() {
  const stored = useLiveQuery(() => db.syncMeta.get(LIST_KEY), []);
  const characters: Character[] = stored?.value
    ? (JSON.parse(stored.value) as Character[]).map((c) => ({
        ...c,
        photoMediaIds: c.photoMediaIds ?? [],
      }))
    : [];

  const save = async (
    char: Omit<Character, "createdAt" | "updatedAt" | "id"> & { id?: string },
  ) => {
    const all = await readAll();
    const now = new Date().toISOString();
    if (char.id) {
      const idx = all.findIndex((c) => c.id === char.id);
      if (idx >= 0) {
        all[idx] = {
          ...all[idx],
          ...char,
          id: char.id,
          photoMediaIds: char.photoMediaIds ?? all[idx].photoMediaIds,
          updatedAt: now,
        };
      }
    } else {
      all.push({
        id: generateId(),
        name: char.name,
        role: char.role,
        description: char.description,
        traits: char.traits,
        notes: char.notes,
        photoMediaIds: char.photoMediaIds ?? [],
        createdAt: now,
        updatedAt: now,
      });
    }
    await writeAll(all);
  };

  const remove = async (id: string) => {
    const all = (await readAll()).filter((c) => c.id !== id);
    await writeAll(all);
  };

  return { characters, save, remove };
}

export function useCharacterPhotos(mediaIds: string[]): MediaAsset[] {
  const assets = useLiveQuery(
    () => db.mediaAssets.toArray(),
    [],
  );
  if (!assets) return [];
  const set = new Set(mediaIds);
  return assets.filter((a) => set.has(a.id) && a.localBlobUrl);
}
