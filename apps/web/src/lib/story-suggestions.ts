import type { Entry } from "@/lib/types";
import { generateId } from "@/lib/utils";

export interface StorySuggestion {
  id: string;
  title: string;
  summary: string;
  tone: string;
  momentIds: string[];
  approved: boolean;
}

export function generateStorySuggestions(
  entries: Entry[],
  dayTitle: string,
): StorySuggestion[] {
  if (entries.length === 0) return [];

  const texts = entries.filter((e) => e.text).map((e) => e.text!);
  const hasPhotos = entries.length >= 2;
  const locations = [...new Set(entries.map((e) => e.locationName).filter(Boolean))];

  const suggestions: StorySuggestion[] = [];

  if (texts.length > 0) {
    suggestions.push({
      id: generateId(),
      title: dayTitle || "The day unfolded",
      summary: `Follow the thread from morning to night: ${texts[0]?.slice(0, 120)}…`,
      tone: "slice of life",
      momentIds: entries.slice(0, 4).map((e) => e.id),
      approved: false,
    });
  }

  if (locations.length > 0) {
    suggestions.push({
      id: generateId(),
      title: `Lost in ${locations[0]}`,
      summary: `A day shaped by place — moving through ${locations.join(", ")} without a fixed plan.`,
      tone: "cinematic",
      momentIds: entries.filter((e) => e.locationName).map((e) => e.id),
      approved: false,
    });
  }

  if (hasPhotos) {
    suggestions.push({
      id: generateId(),
      title: "Small moments, big feeling",
      summary: "Visual fragments from the day woven into a quiet, dreamlike chapter.",
      tone: "dreamlike",
      momentIds: entries.map((e) => e.id),
      approved: false,
    });
  }

  const moodEntries = entries.filter((e) => e.moodNote || (e.text && e.text.length < 60));
  if (moodEntries.length > 0) {
    suggestions.push({
      id: generateId(),
      title: "What I noticed",
      summary: "Short observations and passing thoughts — the texture of an ordinary day.",
      tone: "quiet",
      momentIds: moodEntries.map((e) => e.id),
      approved: false,
    });
  }

  return suggestions.slice(0, 4);
}
