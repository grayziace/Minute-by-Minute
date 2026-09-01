/** Session-only — clears when the browser tab closes. */
export const KNOCK_STORAGE_KEY = "mbm-knock-unlocked";

export type KnockCorner = "tl" | "tr" | "br" | "bl";

/** Tap the four corners of the cover page clockwise, starting top-left. */
export const KNOCK_SEQUENCE: KnockCorner[] = ["tl", "tr", "br", "bl"];

export function readKnockUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(KNOCK_STORAGE_KEY) === "1";
}

export function setKnockUnlocked(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KNOCK_STORAGE_KEY, "1");
}

export function clearKnockUnlocked(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KNOCK_STORAGE_KEY);
}

export function isProductionGuest(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host !== "localhost" && host !== "127.0.0.1";
}
