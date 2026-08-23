export interface EDLClip {
  sourceMediaId: string;
  inMs: number;
  outMs: number | null;
  order: number;
  transition: "cut" | "crossfade" | "metro_glitch";
  speed: number;
  crop?: { x: number; y: number; w: number; h: number };
  audioTreatment: "keep" | "mute" | "duck";
  textOverlays?: { text: string; startMs: number; endMs: number }[];
  musicTrackId?: string | null;
}

export interface EDL {
  projectId: string;
  title: string;
  description?: string;
  clips: EDLClip[];
  targetDurationMs?: number;
}
