# Minute by Minute

A private, mobile-first personal archive for documenting life in the present moment.

## Quick start

```bash
# Start Postgres + MinIO
docker compose up -d postgres minio

# Configure environment
cp apps/web/.env.example apps/web/.env.local

# Push database schema
npm run db:push --prefix apps/web

# Run dev server
npm run dev --prefix apps/web
```

Open [http://localhost:3000](http://localhost:3000)

## Features

- **NOW** — live clock, today's moments, recent media
- **Timeline** — day episodes, chronological archive
- **Inbox** — capture first, organise later
- **Scrapbook** — visual collage view
- **Search** — full-text across entries
- **Offline-first** — Dexie/IndexedDB with sync queue
- **Resumable uploads** — S3 multipart for large videos
- **Passkey auth** — single-user private access
- **Map / People / Places / Music** — context layers
- **AI Studio / Video Studio** — suggestions and EDL-based editing

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Deployment](docs/DEPLOY.md)

## Philosophy

> You are here. This is happening now. Notice it. Capture it. Then move on.
