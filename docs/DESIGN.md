# Cinematic Angelcore — Visual Design System

The visual identity of Minute by Minute is **Cinematic Angelcore**: luminous, ethereal, and media-first.

## Design test

Before any major screen:

1. Does this feel like a generic application? → Redesign.
2. Could this plausibly be a frame from an interactive film? → Ship it.

## Colour palette

| Token | Role |
|-------|------|
| `--background` | Luminous pearl base |
| `--ice`, `--ice-deep` | Primary cool accent |
| `--blush`, `--blush-deep` | Warm emotional accent |
| `--lavender` | Soft violet atmosphere |
| `--midnight` | Contrast for immersive media overlays only |
| `--glass` | Translucent surfaces |

The default world is **luminous**, not black. Dark tones appear primarily in full-screen media viewing.

## Typography

- **Instrument Sans** — UI, timestamps, navigation
- **Cormorant Garamond** — diary text, chapter titles, emotional moments
- **Caveat** — sparing handwritten annotations (mood notes, scrapbook fragments)

## Components

- `Atmosphere` — ambient gradient orbs
- `GlassPanel` — frosted translucent surfaces
- `HaloLoader` — loading states (no generic spinners)
- `PageShell` — page wrapper with atmosphere
- `MediaViewer` — cinematic full-screen media (UI fades away)

## Media presentation

Photos and videos are the main character. The UI uses:

- Variable sizing in timeline (not uniform cards)
- Edge-to-edge hero images on some entries
- Polaroid / float / tape variants in scrapbook
- Full-screen viewer on tap

## Chapters

Chapters emerge gradually from lived experience. Each can develop its own subtle atmosphere while sharing the global design language.

## Motion

Subtle only: `memory-appear`, `memory-resolve`, drifting orbs, light sweep on NOW page. No bounce or gamification.

## Angel imagery

Expressed through light, glow, vertical composition, white space — not literal wing clipart. Occasional halo motifs in loaders and empty states only.
