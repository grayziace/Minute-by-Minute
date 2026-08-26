import { formatISO, parseISO } from "date-fns";

/** Archive timezone — all displayed times and day boundaries use China Standard Time. */
export const CHINA_TIMEZONE = "Asia/Shanghai";

export function generateId(): string {
  return crypto.randomUUID();
}

function chinaFormat(date: Date, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: CHINA_TIMEZONE,
    ...options,
  }).format(date);
}

function chinaDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CHINA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((p) => p.type === "year")!.value;
  const month = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;
  return `${year}-${month}-${day}`;
}

export function formatTime(iso: string): string {
  return chinaFormat(parseISO(iso), {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDayHeading(iso: string): string {
  return chinaFormat(parseISO(iso), {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).toUpperCase();
}

export function formatNowDayUpper(date: Date): string {
  return chinaFormat(date, { weekday: "long" }).toUpperCase();
}

export function formatNowDateUpper(date: Date): string {
  return chinaFormat(date, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).toUpperCase();
}

export function formatNowTime(date: Date): string {
  return chinaFormat(date, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** @deprecated use formatNowDayUpper + formatNowDateUpper */
export function formatNowDate(date: Date): string {
  return chinaFormat(date, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function toDateKey(iso: string): string {
  return chinaDateKey(parseISO(iso));
}

/** Start/end of a calendar day in China, as UTC ISO strings for querying. */
export function dayRange(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, day, -8, 0, 0, 0));
  const end = new Date(Date.UTC(year, month - 1, day, 15, 59, 59, 999));
  return { start: start.toISOString(), end: end.toISOString() };
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function isTodayInChina(iso: string): boolean {
  return toDateKey(iso) === toDateKey(nowIso());
}

export { formatISO, parseISO };

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
