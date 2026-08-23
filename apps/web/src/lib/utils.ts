import { format, formatISO, parseISO, startOfDay, endOfDay, isToday } from "date-fns";

export function generateId(): string {
  return crypto.randomUUID();
}

export function formatTime(iso: string): string {
  return format(parseISO(iso), "HH:mm");
}

export function formatDayHeading(iso: string): string {
  return format(parseISO(iso), "d MMMM yyyy").toUpperCase();
}

export function formatNowDayUpper(date: Date): string {
  return format(date, "EEEE").toUpperCase();
}

export function formatNowDateUpper(date: Date): string {
  return format(date, "d MMMM yyyy").toUpperCase();
}

export function formatNowTime(date: Date): string {
  return format(date, "HH:mm");
}

/** @deprecated use formatNowDayUpper + formatNowDateUpper */
export function formatNowDate(date: Date): string {
  return format(date, "EEEE, d MMMM yyyy");
}

export function toDateKey(iso: string): string {
  return format(parseISO(iso), "yyyy-MM-dd");
}

export function dayRange(dateKey: string) {
  const start = startOfDay(parseISO(`${dateKey}T00:00:00`));
  const end = endOfDay(start);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function nowIso(): string {
  return new Date().toISOString();
}

export { isToday, formatISO, parseISO };

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export async function sha256File(file: Blob): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function hashIndex(id: string, max: number): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i) * (i + 1)) % max;
  return h;
}

export const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB for S3 multipart minimum
