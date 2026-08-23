# Minute by Minute — Architecture

See the implementation plan for full product context. This document summarises the built architecture.

## Stack

- **Frontend:** Next.js 16 App Router, TypeScript, Tailwind CSS v4
- **Local:** Dexie.js (IndexedDB) — offline-first source of truth on device
- **Server DB:** PostgreSQL + Drizzle ORM
- **Storage:** S3-compatible (MinIO dev / Cloudflare R2 prod)
- **PWA:** Serwist service worker
- **Auth:** WebAuthn passkeys + HTTP-only session cookies
- **Worker:** Node + Sharp (+ FFmpeg in container) for media processing

## Data flow

1. User captures → writes to IndexedDB immediately
2. Sync queue replays to `/api/sync` when online
3. Media uploads via S3 multipart with resume state in IndexedDB
4. Worker generates thumbnails; originals preserved

## Key routes

| Route | Purpose |
|-------|---------|
| `/` | NOW — emotional centre |
| `/timeline` | Day list archive |
| `/timeline/[date]` | Day episode view |
| `/inbox` | Unprocessed media |
| `/scrapbook` | Visual collage mode |
| `/search` | Full-text search |
| `/map`, `/people`, `/places`, `/music` | Phase 2 context |
| `/archive/ai` | Phase 3 AI studio |

## Privacy

- Default visibility: `private`
- AI output always labelled and requires approval
- Original media never deleted by edits (EDL model)
