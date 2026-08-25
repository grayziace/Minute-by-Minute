"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/dexie/db";

export async function getPageNote(key: string, fallback = ""): Promise<string> {
  const row = await db.syncMeta.get(key);
  return row?.value ?? fallback;
}

export async function setPageNote(key: string, value: string): Promise<void> {
  await db.syncMeta.put({ key, value });
}

export function usePageNote(key: string, fallback = "") {
  const stored = useLiveQuery(() => db.syncMeta.get(key), [key]);
  const value = stored?.value ?? fallback;

  const save = async (next: string) => {
    await db.syncMeta.put({ key, value: next });
  };

  return { value, save };
}

/** Keys for editable page copy */
export const PAGE_NOTES = {
  nowMood: "page.now.mood",
  nowPinned: "page.now.pinned",
  nowPrompt: "page.now.prompt",
  nowSubprompt: "page.now.subprompt",
  nowLocation: "page.now.location",
  meInsight: "page.me.insight",
  meQuestion: "page.me.question",
} as const;
