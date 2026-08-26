"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/dexie/db";

export interface DayMeta {
  title: string;
  summary: string;
  feeling: string;
  remember: string;
  favouriteMomentId: string;
}

const FIELDS = ["title", "summary", "feeling", "remember", "favouriteMomentId"] as const;

export async function saveDayMetaField(
  dateKey: string,
  field: keyof DayMeta,
  value: string,
): Promise<void> {
  await db.syncMeta.put({ key: `day.${dateKey}.${field}`, value });
}

export function useDayMeta(dateKey: string) {
  const rows = useLiveQuery(async () => {
    const entries = await Promise.all(
      FIELDS.map((field) => db.syncMeta.get(`day.${dateKey}.${field}`)),
    );
    return Object.fromEntries(
      FIELDS.map((field, i) => [field, entries[i]?.value ?? ""]),
    ) as unknown as DayMeta;
  }, [dateKey]);

  const meta: DayMeta = rows ?? {
    title: "",
    summary: "",
    feeling: "",
    remember: "",
    favouriteMomentId: "",
  };

  const save = async (field: keyof DayMeta, value: string) => {
    await saveDayMetaField(dateKey, field, value);
  };

  return { meta, save };
}

export function chapterNumberForDay(dateKey: string, allDayKeysAsc: string[]): number {
  const idx = allDayKeysAsc.indexOf(dateKey);
  return idx >= 0 ? idx + 1 : allDayKeysAsc.length + 1;
}
