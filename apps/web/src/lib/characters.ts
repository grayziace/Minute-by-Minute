"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/dexie/db";
import { generateId } from "@/lib/utils";

export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  traits: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const LIST_KEY = "characters.list";

async function readAll(): Promise<Character[]> {
  const row = await db.syncMeta.get(LIST_KEY);
  if (!row?.value) return [];
  try {
    return JSON.parse(row.value) as Character[];
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
    ? (JSON.parse(stored.value) as Character[])
    : [];

  const save = async (
    char: Omit<Character, "createdAt" | "updatedAt" | "id"> & { id?: string },
  ) => {
    const all = await readAll();
    const now = new Date().toISOString();
    if (char.id) {
      const idx = all.findIndex((c) => c.id === char.id);
      if (idx >= 0) {
        all[idx] = { ...all[idx], ...char, id: char.id, updatedAt: now };
      }
    } else {
      all.push({
        id: generateId(),
        name: char.name,
        role: char.role,
        description: char.description,
        traits: char.traits,
        notes: char.notes,
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
